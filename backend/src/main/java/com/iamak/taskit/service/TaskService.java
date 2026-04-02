package com.iamak.taskit.service;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.model.*;
import com.iamak.taskit.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final CurrentUserService currentUserService;
    private final JsonMapperService jsonMapperService;
    private final XpService xpService;
    private final RecurrenceValidatorService recurrenceValidatorService;

    public TaskService(
            TaskRepository taskRepository,
            CurrentUserService currentUserService,
            JsonMapperService jsonMapperService,
            XpService xpService,
            RecurrenceValidatorService recurrenceValidatorService
    ) {
        this.taskRepository = taskRepository;
        this.currentUserService = currentUserService;
        this.jsonMapperService = jsonMapperService;
        this.xpService = xpService;
        this.recurrenceValidatorService = recurrenceValidatorService;
    }

    public List<DomainDtos.TaskResponse> list() {
        User user = currentUserService.getCurrentUser();
        return taskRepository.findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public DomainDtos.TaskResponse get(Long id) {
        User user = currentUserService.getCurrentUser();
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        return toResponse(task);
    }

    @Transactional
    public DomainDtos.TaskResponse create(DomainDtos.TaskRequest request) {
        recurrenceValidatorService.validate(request.recurrence());
        User user = currentUserService.getCurrentUser();
        Task task = Task.builder()
                .user(user)
                .title(request.title())
                .description(request.description())
                .priority(request.priority() == null ? Priority.MEDIUM : request.priority())
                .status(request.status() == null ? TaskStatus.TODO : request.status())
                .dueAtUtc(request.dueAtUtc())
                .scheduledAtUtc(request.scheduledAtUtc())
                .estimateMinutes(request.estimateMinutes())
                .sourceTimezone(request.sourceTimezone() == null || request.sourceTimezone().isBlank() ? user.getTimezone() : request.sourceTimezone())
                .recurrenceEnabled(request.recurrence() != null)
                .recurrenceConfigJson(jsonMapperService.toJson(request.recurrence()))
                .build();
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public DomainDtos.TaskResponse update(Long id, DomainDtos.TaskRequest request) {
        recurrenceValidatorService.validate(request.recurrence());
        User user = currentUserService.getCurrentUser();
        Task existing = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        existing.setTitle(request.title());
        existing.setDescription(request.description());
        existing.setPriority(request.priority() == null ? existing.getPriority() : request.priority());
        existing.setStatus(request.status() == null ? existing.getStatus() : request.status());
        existing.setDueAtUtc(request.dueAtUtc());
        existing.setScheduledAtUtc(request.scheduledAtUtc());
        existing.setEstimateMinutes(request.estimateMinutes());
        existing.setSourceTimezone(request.sourceTimezone() == null || request.sourceTimezone().isBlank() ? existing.getSourceTimezone() : request.sourceTimezone());
        existing.setRecurrenceEnabled(request.recurrence() != null);
        existing.setRecurrenceConfigJson(jsonMapperService.toJson(request.recurrence()));

        return toResponse(taskRepository.save(existing));
    }

    @Transactional
    public DomainDtos.TaskResponse complete(Long id) {
        User user = currentUserService.getCurrentUser();
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        task.setStatus(TaskStatus.DONE);
        task.setCompletedAtUtc(Instant.now());
        Task saved = taskRepository.save(task);

        int xp = switch (saved.getPriority()) {
            case LOW -> 10;
            case MEDIUM -> 20;
            case HIGH -> 30;
        };
        xpService.addXp(user, XpSourceType.TASK, saved.getId(), xp);

        return toResponse(saved);
    }

    @Transactional
    public DomainDtos.TaskResponse reopen(Long id) {
        User user = currentUserService.getCurrentUser();
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        task.setStatus(TaskStatus.TODO);
        task.setCompletedAtUtc(null);
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.getCurrentUser();
        Task task = taskRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        task.setDeletedAt(Instant.now());
        taskRepository.save(task);
    }

    @Transactional
    public void restore(Long id, Long userId) {
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        task.setDeletedAt(null);
        taskRepository.save(task);
    }

    @Transactional
    public void purge(Long id, Long userId) {
        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        taskRepository.delete(task);
    }

    public List<DomainDtos.TrashItemResponse> trash(Long userId) {
        return taskRepository.findByUserIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(userId)
                .stream()
                .map(t -> new DomainDtos.TrashItemResponse("task", t.getId(), t.getTitle(), t.getDeletedAt()))
                .toList();
    }

    private DomainDtos.TaskResponse toResponse(Task task) {
        return new DomainDtos.TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getStatus(),
                task.getDueAtUtc(),
                task.getScheduledAtUtc(),
                task.getCompletedAtUtc(),
                task.getEstimateMinutes(),
                task.getSourceTimezone(),
                task.getRecurrenceEnabled(),
                task.getRecurrenceConfigJson(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
