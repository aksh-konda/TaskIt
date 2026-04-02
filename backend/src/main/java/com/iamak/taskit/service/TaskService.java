package com.iamak.taskit.service;

import com.iamak.taskit.entity.Task;
import com.iamak.taskit.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private static final Logger logger = LoggerFactory.getLogger(TaskService.class);

    private final TaskRepository repo;

    public TaskService(TaskRepository repo) {
        this.repo = repo;
    }

    public Task create(Task task) {
        Task savedTask = repo.save(task);
        logger.info("Created task {}", savedTask.getId());
        return savedTask;
    }

    public Task update(Long id, Task updatedTask) {

        Task existingTask = repo.findById(id)
                .orElseThrow(() -> {
                    logger.warn("Task {} not found for update", id);
                    return new RuntimeException("Task not found");
                });

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setStatus(updatedTask.getStatus());
        existingTask.setPriority(updatedTask.getPriority());
        existingTask.setDueDate(updatedTask.getDueDate());
        existingTask.setEstTime(updatedTask.getEstTime());
        existingTask.setProgress(updatedTask.getProgress());

        Task savedTask = repo.save(existingTask);
        logger.info("Updated task {}", id);
        return savedTask;
    }


    public List<Task> getAll() {
        List<Task> tasks = repo.findAll();
        logger.debug("Loaded {} tasks", tasks.size());
        return tasks;
    }

    public void delete(Long id) {
        logger.info("Deleting task {}", id);
        repo.deleteById(id);
    }
}
