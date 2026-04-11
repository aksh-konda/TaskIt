package com.iamak.taskit.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.iamak.taskit.dto.MemoryType;
import com.iamak.taskit.entity.AppUser;
import com.iamak.taskit.entity.Habit;
import com.iamak.taskit.entity.HabitLog;
import com.iamak.taskit.exception.ResourceNotFoundException;
import com.iamak.taskit.repository.AppUserRepository;
import com.iamak.taskit.repository.HabitLogRepository;
import com.iamak.taskit.repository.HabitRepository;

@Service
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final AppUserRepository appUserRepository;
    private final RAGService ragService;

    public HabitService(
            HabitRepository habitRepository,
            HabitLogRepository habitLogRepository,
            AppUserRepository appUserRepository,
            RAGService ragService) {
        this.habitRepository = habitRepository;
        this.habitLogRepository = habitLogRepository;
        this.appUserRepository = appUserRepository;
        this.ragService = ragService;
    }

    public Habit create(Habit habit, Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        habit.setUser(user);
        Habit saved = habitRepository.save(habit);
        ragService.storeMemory(
                userId,
                "Created habit " + saved.getName() + " with frequency " + defaultText(saved.getFrequency()),
                MemoryType.INSIGHT,
                "habit",
                String.valueOf(saved.getId()));
        return saved;
    }

    public List<Habit> getAll(Long userId) {
        return habitRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    public HabitLog logHabit(Long habitId, Long userId, LocalDate date, boolean completed) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));

        HabitLog log = new HabitLog();
        log.setHabit(habit);
        log.setDate(date != null ? date : LocalDate.now());
        log.setCompleted(completed);
        HabitLog saved = habitLogRepository.save(log);

        ragService.storeMemory(
                userId,
                "Habit " + habit.getName() + " was " + (completed ? "completed" : "missed") + " on " + saved.getDate(),
                MemoryType.LOG,
                "habit_log",
                String.valueOf(saved.getId()));
        return saved;
    }

    private String defaultText(String value) {
        return value == null || value.isBlank() ? "unspecified" : value;
    }
}
