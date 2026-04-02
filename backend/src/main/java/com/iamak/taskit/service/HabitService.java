package com.iamak.taskit.service;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.model.*;
import com.iamak.taskit.repository.HabitCheckinRepository;
import com.iamak.taskit.repository.HabitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitCheckinRepository habitCheckinRepository;
    private final CurrentUserService currentUserService;
    private final JsonMapperService jsonMapperService;
    private final XpService xpService;
    private final RecurrenceValidatorService recurrenceValidatorService;

    public HabitService(
            HabitRepository habitRepository,
            HabitCheckinRepository habitCheckinRepository,
            CurrentUserService currentUserService,
            JsonMapperService jsonMapperService,
            XpService xpService,
            RecurrenceValidatorService recurrenceValidatorService
    ) {
        this.habitRepository = habitRepository;
        this.habitCheckinRepository = habitCheckinRepository;
        this.currentUserService = currentUserService;
        this.jsonMapperService = jsonMapperService;
        this.xpService = xpService;
        this.recurrenceValidatorService = recurrenceValidatorService;
    }

    public List<DomainDtos.HabitResponse> list() {
        User user = currentUserService.getCurrentUser();
        return habitRepository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public DomainDtos.HabitResponse create(DomainDtos.HabitRequest request) {
        recurrenceValidatorService.validate(request.recurrence());
        User user = currentUserService.getCurrentUser();
        Habit habit = Habit.builder()
                .user(user)
                .name(request.name())
                .description(request.description())
                .frequencyType(request.frequencyType() == null ? FrequencyType.DAILY : request.frequencyType())
                .targetCountPerPeriod(request.targetCountPerPeriod() == null ? 1 : request.targetCountPerPeriod())
                .difficulty(request.difficulty() == null ? HabitDifficulty.MEDIUM : request.difficulty())
                .recurrenceEnabled(request.recurrence() != null)
                .recurrenceConfigJson(jsonMapperService.toJson(request.recurrence()))
                .build();
        return toResponse(habitRepository.save(habit));
    }

    @Transactional
    public DomainDtos.HabitResponse update(Long id, DomainDtos.HabitRequest request) {
        recurrenceValidatorService.validate(request.recurrence());
        User user = currentUserService.getCurrentUser();
        Habit habit = habitRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        habit.setName(request.name());
        habit.setDescription(request.description());
        if (request.frequencyType() != null) {
            habit.setFrequencyType(request.frequencyType());
        }
        if (request.targetCountPerPeriod() != null) {
            habit.setTargetCountPerPeriod(request.targetCountPerPeriod());
        }
        if (request.difficulty() != null) {
            habit.setDifficulty(request.difficulty());
        }
        habit.setRecurrenceEnabled(request.recurrence() != null);
        habit.setRecurrenceConfigJson(jsonMapperService.toJson(request.recurrence()));
        return toResponse(habitRepository.save(habit));
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        Habit habit = habitRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        habit.setDeletedAt(Instant.now());
        habitRepository.save(habit);
    }

    @Transactional
    public HabitCheckin checkin(Long id, DomainDtos.HabitCheckinRequest request) {
        User user = currentUserService.getCurrentUser();
        Habit habit = habitRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Habit not found"));

        int xp = switch (habit.getDifficulty()) {
            case EASY -> 5;
            case MEDIUM -> 10;
            case HARD -> 15;
        };

        HabitCheckin checkin = HabitCheckin.builder()
                .habit(habit)
                .user(user)
                .completedAtUtc(request.completedAtUtc() == null ? Instant.now() : request.completedAtUtc())
                .localDateKey(request.localDateKey() == null ? Instant.now().toString().substring(0, 10) : request.localDateKey())
                .count(request.count() == null || request.count() < 1 ? 1 : request.count())
                .xpAwarded(xp)
                .build();

        habit.setStreakCurrent(habit.getStreakCurrent() + 1);
        habit.setStreakBest(Math.max(habit.getStreakBest(), habit.getStreakCurrent()));
        habit.setLastSatisfiedDateKey(checkin.getLocalDateKey());
        habitRepository.save(habit);

        xpService.addXp(user, XpSourceType.HABIT, habit.getId(), xp);

        return habitCheckinRepository.save(checkin);
    }

    public List<HabitCheckin> checkins(Long id) {
        User user = currentUserService.getCurrentUser();
        return habitCheckinRepository.findByHabitIdAndUserIdOrderByCompletedAtUtcDesc(id, user.getId());
    }

    @Transactional
    public void restore(Long id, Long userId) {
        Habit habit = habitRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        habit.setDeletedAt(null);
        habitRepository.save(habit);
    }

    @Transactional
    public void purge(Long id, Long userId) {
        Habit habit = habitRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Habit not found"));
        habitRepository.delete(habit);
    }

    public List<DomainDtos.TrashItemResponse> trash(Long userId) {
        return habitRepository.findByUserIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(userId)
                .stream()
                .map(h -> new DomainDtos.TrashItemResponse("habit", h.getId(), h.getName(), h.getDeletedAt()))
                .toList();
    }

    private DomainDtos.HabitResponse toResponse(Habit habit) {
        return new DomainDtos.HabitResponse(
                habit.getId(),
                habit.getName(),
                habit.getDescription(),
                habit.getFrequencyType(),
                habit.getTargetCountPerPeriod(),
                habit.getDifficulty(),
                habit.getStreakCurrent(),
                habit.getStreakBest(),
                habit.getLastSatisfiedDateKey(),
                habit.getActive(),
                habit.getRecurrenceEnabled(),
                habit.getRecurrenceConfigJson(),
                habit.getCreatedAt(),
                habit.getUpdatedAt()
        );
    }
}
