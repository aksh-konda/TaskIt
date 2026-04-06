package com.iamak.taskit.controller;

import com.iamak.taskit.entity.Task;
import com.iamak.taskit.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @PostMapping
    public Task create(@RequestBody Task task) {
        logger.info("task.create.request");
        return service.create(task);
    }

    @PutMapping("/{id}")
    public Task update(@PathVariable Long id, @RequestBody Task task) {
        logger.info("task.update.request id={}", id);
        return service.update(id, task);
    }

    @GetMapping
    public List<Task> getAll() {
        logger.debug("task.list.request");
        return service.getAll();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        logger.info("task.delete.request id={}", id);
        service.delete(id);
    }
}
