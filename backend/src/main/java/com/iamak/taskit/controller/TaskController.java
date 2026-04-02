package com.iamak.taskit.controller;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public List<DomainDtos.TaskResponse> list() {
        return taskService.list();
    }

    @GetMapping("/{id}")
    public DomainDtos.TaskResponse get(@PathVariable Long id) {
        return taskService.get(id);
    }

    @PostMapping
    public DomainDtos.TaskResponse create(@RequestBody DomainDtos.TaskRequest request) {
        return taskService.create(request);
    }

    @PutMapping("/{id}")
    public DomainDtos.TaskResponse update(@PathVariable Long id, @RequestBody DomainDtos.TaskRequest request) {
        return taskService.update(id, request);
    }

    @PostMapping("/{id}/complete")
    public DomainDtos.TaskResponse complete(@PathVariable Long id) {
        return taskService.complete(id);
    }

    @PostMapping("/{id}/reopen")
    public DomainDtos.TaskResponse reopen(@PathVariable Long id) {
        return taskService.reopen(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        taskService.delete(id);
    }
}
