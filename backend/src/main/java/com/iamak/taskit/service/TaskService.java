package com.iamak.taskit.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.iamak.taskit.entity.Task;
import com.iamak.taskit.entity.AppUser;
import com.iamak.taskit.exception.ResourceNotFoundException;
import com.iamak.taskit.repository.TaskRepository;
import com.iamak.taskit.repository.AppUserRepository;

@Service
public class TaskService {

    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository repo;
    private final AppUserRepository appUserRepository;

    public TaskService(TaskRepository repo, AppUserRepository appUserRepository) {
        this.repo = repo;
        this.appUserRepository = appUserRepository;
    }

    public Task create(Task task, Long userId) {
        AppUser owner = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        task.setOwner(owner);
        Task savedTask = repo.save(task);
        logger.info("task.create.success id={} userId={}", savedTask.getId(), userId);
        return savedTask;
    }

    public Task update(Long id, Task updatedTask, Long userId) {

        Task existingTask = repo.findByIdAndOwnerId(id, userId)
                .orElseThrow(() -> {
                    logger.warn("task.update.not-found id={}", id);
                    return new ResourceNotFoundException("Task not found");
                });

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setStatus(updatedTask.getStatus());
        existingTask.setPriority(updatedTask.getPriority());
        existingTask.setDueDate(updatedTask.getDueDate());
        existingTask.setEstTime(updatedTask.getEstTime());
        existingTask.setProgress(updatedTask.getProgress());

        Task savedTask = repo.save(existingTask);
        logger.info("task.update.success id={} userId={}", id, userId);
        return savedTask;
    }

    public List<Task> getAll(Long userId) {
        List<Task> tasks = repo.findAllByOwnerId(userId);
        logger.debug("task.list.success count={} userId={}", tasks.size(), userId);
        return tasks;
    }

    public void delete(Long id, Long userId) {
        logger.info("task.delete.request id={} userId={}", id, userId);
        Task existingTask = repo.findByIdAndOwnerId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        repo.delete(existingTask);
        logger.info("task.delete.success id={} userId={}", id, userId);
    }
}
