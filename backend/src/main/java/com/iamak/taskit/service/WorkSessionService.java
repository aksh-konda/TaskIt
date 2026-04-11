package com.iamak.taskit.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.iamak.taskit.dto.MemoryType;
import com.iamak.taskit.entity.AppUser;
import com.iamak.taskit.entity.Task;
import com.iamak.taskit.entity.WorkSession;
import com.iamak.taskit.exception.ResourceNotFoundException;
import com.iamak.taskit.repository.AppUserRepository;
import com.iamak.taskit.repository.TaskRepository;
import com.iamak.taskit.repository.WorkSessionRepository;

@Service
public class WorkSessionService {

    private final WorkSessionRepository workSessionRepository;
    private final AppUserRepository appUserRepository;
    private final TaskRepository taskRepository;
    private final RAGService ragService;

    public WorkSessionService(
            WorkSessionRepository workSessionRepository,
            AppUserRepository appUserRepository,
            TaskRepository taskRepository,
            RAGService ragService) {
        this.workSessionRepository = workSessionRepository;
        this.appUserRepository = appUserRepository;
        this.taskRepository = taskRepository;
        this.ragService = ragService;
    }

    public WorkSession create(WorkSession session, Long taskId, Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        session.setUser(user);

        if (taskId != null) {
            Task task = taskRepository.findByIdAndOwnerId(taskId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
            session.setTask(task);
        }

        WorkSession saved = workSessionRepository.save(session);
        ragService.storeMemory(
                userId,
                buildSummary(saved),
                MemoryType.SESSION,
                "work_session",
                String.valueOf(saved.getId()));
        return saved;
    }

    public List<WorkSession> getAll(Long userId) {
        return workSessionRepository.findAllByUserIdOrderByStartTimeDesc(userId);
    }

    private String buildSummary(WorkSession session) {
        StringBuilder summary = new StringBuilder("Worked session");
        if (session.getTask() != null) {
            summary.append(" on task ").append(session.getTask().getTitle());
        }
        if (session.getFocusScore() != null) {
            summary.append(", focus score ").append(session.getFocusScore());
        }
        if (session.getDistractionCount() != null) {
            summary.append(", distractions ").append(session.getDistractionCount());
        }
        if (session.getNotes() != null && !session.getNotes().isBlank()) {
            summary.append(". Notes: ").append(session.getNotes().trim());
        }
        return summary.toString();
    }
}
