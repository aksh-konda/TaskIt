package com.iamak.taskit.service;

import com.iamak.taskit.entity.Task;
import com.iamak.taskit.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository repo;

    public TaskService(TaskRepository repo) {
        this.repo = repo;
    }

    public Task create(Task task) {
        return repo.save(task);
    }

    public Task update(Long id, Task updatedTask) {

        Task existingTask = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setDescription(updatedTask.getDescription());
        existingTask.setStatus(updatedTask.getStatus());
        existingTask.setPriority(updatedTask.getPriority());
        existingTask.setDueDate(updatedTask.getDueDate());
        existingTask.setEstTime(updatedTask.getEstTime());
        existingTask.setProgress(updatedTask.getProgress());

        return repo.save(existingTask);
    }


    public List<Task> getAll() {
        return repo.findAll();
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
