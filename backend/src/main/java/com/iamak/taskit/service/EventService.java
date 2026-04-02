package com.iamak.taskit.service;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.model.*;
import com.iamak.taskit.repository.EventItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class EventService {

    private final EventItemRepository eventItemRepository;
    private final CurrentUserService currentUserService;
    private final JsonMapperService jsonMapperService;
    private final XpService xpService;
    private final RecurrenceValidatorService recurrenceValidatorService;

    public EventService(
            EventItemRepository eventItemRepository,
            CurrentUserService currentUserService,
            JsonMapperService jsonMapperService,
            XpService xpService,
            RecurrenceValidatorService recurrenceValidatorService
    ) {
        this.eventItemRepository = eventItemRepository;
        this.currentUserService = currentUserService;
        this.jsonMapperService = jsonMapperService;
        this.xpService = xpService;
        this.recurrenceValidatorService = recurrenceValidatorService;
    }

    public List<DomainDtos.EventResponse> list() {
        User user = currentUserService.getCurrentUser();
        return eventItemRepository.findByUserIdAndDeletedAtIsNullOrderByStartAtUtcAsc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public DomainDtos.EventResponse create(DomainDtos.EventRequest request) {
        recurrenceValidatorService.validate(request.recurrence());
        User user = currentUserService.getCurrentUser();
        EventItem item = EventItem.builder()
                .user(user)
                .title(request.title())
                .description(request.description())
                .location(request.location())
                .allDay(request.allDay() != null && request.allDay())
                .startAtUtc(request.startAtUtc())
                .endAtUtc(request.endAtUtc())
                .status(EventStatus.SCHEDULED)
                .reminderMinutesBefore(request.reminderMinutesBefore())
                .sourceTimezone(request.sourceTimezone() == null || request.sourceTimezone().isBlank() ? user.getTimezone() : request.sourceTimezone())
                .recurrenceEnabled(request.recurrence() != null)
                .recurrenceConfigJson(jsonMapperService.toJson(request.recurrence()))
                .build();
        return toResponse(eventItemRepository.save(item));
    }

    @Transactional
    public DomainDtos.EventResponse update(Long id, DomainDtos.EventRequest request) {
        recurrenceValidatorService.validate(request.recurrence());
        User user = currentUserService.getCurrentUser();
        EventItem item = eventItemRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        item.setTitle(request.title());
        item.setDescription(request.description());
        item.setLocation(request.location());
        item.setAllDay(request.allDay() != null && request.allDay());
        item.setStartAtUtc(request.startAtUtc());
        item.setEndAtUtc(request.endAtUtc());
        item.setReminderMinutesBefore(request.reminderMinutesBefore());
        item.setRecurrenceEnabled(request.recurrence() != null);
        item.setRecurrenceConfigJson(jsonMapperService.toJson(request.recurrence()));
        return toResponse(eventItemRepository.save(item));
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        EventItem item = eventItemRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        item.setDeletedAt(Instant.now());
        eventItemRepository.save(item);
    }

    @Transactional
    public DomainDtos.EventResponse markDone(Long id) {
        User user = currentUserService.getCurrentUser();
        EventItem item = eventItemRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        item.setStatus(EventStatus.DONE);
        EventItem saved = eventItemRepository.save(item);
        xpService.addXp(user, XpSourceType.EVENT, saved.getId(), 10);
        return toResponse(saved);
    }

    @Transactional
    public void restore(Long id, Long userId) {
        EventItem item = eventItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        item.setDeletedAt(null);
        eventItemRepository.save(item);
    }

    @Transactional
    public void purge(Long id, Long userId) {
        EventItem item = eventItemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        eventItemRepository.delete(item);
    }

    public List<DomainDtos.TrashItemResponse> trash(Long userId) {
        return eventItemRepository.findByUserIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(userId)
                .stream()
                .map(e -> new DomainDtos.TrashItemResponse("event", e.getId(), e.getTitle(), e.getDeletedAt()))
                .toList();
    }

    private DomainDtos.EventResponse toResponse(EventItem item) {
        return new DomainDtos.EventResponse(
                item.getId(),
                item.getTitle(),
                item.getDescription(),
                item.getLocation(),
                item.getAllDay(),
                item.getStartAtUtc(),
                item.getEndAtUtc(),
                item.getStatus(),
                item.getReminderMinutesBefore(),
                item.getSourceTimezone(),
                item.getRecurrenceEnabled(),
                item.getRecurrenceConfigJson(),
                item.getCreatedAt(),
                item.getUpdatedAt()
        );
    }
}
