package com.iamak.taskit.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iamak.taskit.dto.task.TaskRequest;
import com.iamak.taskit.dto.task.TaskResponse;
import com.iamak.taskit.dto.Priority;
import com.iamak.taskit.dto.Status;
import com.iamak.taskit.entity.Task;
import com.iamak.taskit.security.UserPrincipal;
import com.iamak.taskit.service.TaskService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @PostMapping
    public TaskResponse create(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody TaskRequest request) {
        logger.info("task.create.request");
        return TaskResponse.from(service.create(toEntity(request), principal.getId()));
    }

    @PutMapping("/{id}")
    public TaskResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        logger.info("task.update.request id={}", id);
        return TaskResponse.from(service.update(id, toEntity(request), principal.getId()));
    }

    @GetMapping
    public List<TaskResponse> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        logger.debug("task.list.request");
        return service.getAll(principal.getId()).stream()
                .map(TaskResponse::from)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        logger.info("task.delete.request id={}", id);
        service.delete(id, principal.getId());
    }

    private Task toEntity(TaskRequest request) {
        Task task = new Task();
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        task.setStatus(request.getStatus() != null ? request.getStatus() : Status.TODO);
        task.setPriority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM);
        task.setType(request.getType());
        task.setDueDate(request.getDueDate());
        task.setScheduledAt(request.getScheduledAt());
        task.setCompletedAt(request.getCompletedAt());
        task.setEstTime(request.getEstTime());
        task.setActualMinutes(request.getActualMinutes());
        task.setProgress(request.getProgress());
        task.setTags(request.getTags());
        return task;
    }
}
