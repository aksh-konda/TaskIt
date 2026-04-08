package com.iamak.taskit.controller;

import java.util.List;

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

import com.iamak.taskit.entity.Task;
import com.iamak.taskit.security.UserPrincipal;
import com.iamak.taskit.service.TaskService;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @PostMapping
    public Task create(@AuthenticationPrincipal UserPrincipal principal, @RequestBody Task task) {
        logger.info("task.create.request");
        return service.create(task, principal.getId());
    }

    @PutMapping("/{id}")
    public Task update(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id, @RequestBody Task task) {
        logger.info("task.update.request id={}", id);
        return service.update(id, task, principal.getId());
    }

    @GetMapping
    public List<Task> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        logger.debug("task.list.request");
        return service.getAll(principal.getId());
    }

    @DeleteMapping("/{id}")
    public void delete(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        logger.info("task.delete.request id={}", id);
        service.delete(id, principal.getId());
    }
}
