package com.iamak.taskit.service;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.model.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TrashService {

    private final CurrentUserService currentUserService;
    private final TaskService taskService;
    private final HabitService habitService;
    private final EventService eventService;

    public TrashService(
            CurrentUserService currentUserService,
            TaskService taskService,
            HabitService habitService,
            EventService eventService
    ) {
        this.currentUserService = currentUserService;
        this.taskService = taskService;
        this.habitService = habitService;
        this.eventService = eventService;
    }

    public List<DomainDtos.TrashItemResponse> list() {
        User user = currentUserService.getCurrentUser();
        List<DomainDtos.TrashItemResponse> items = new ArrayList<>();
        items.addAll(taskService.trash(user.getId()));
        items.addAll(habitService.trash(user.getId()));
        items.addAll(eventService.trash(user.getId()));
        items.sort((a, b) -> b.deletedAt().compareTo(a.deletedAt()));
        return items;
    }

    public void restore(String entityType, Long id) {
        User user = currentUserService.getCurrentUser();
        switch (entityType.toLowerCase()) {
            case "task" -> taskService.restore(id, user.getId());
            case "habit" -> habitService.restore(id, user.getId());
            case "event" -> eventService.restore(id, user.getId());
            default -> throw new IllegalArgumentException("Unsupported entity type");
        }
    }

    public void purge(String entityType, Long id) {
        User user = currentUserService.getCurrentUser();
        switch (entityType.toLowerCase()) {
            case "task" -> taskService.purge(id, user.getId());
            case "habit" -> habitService.purge(id, user.getId());
            case "event" -> eventService.purge(id, user.getId());
            default -> throw new IllegalArgumentException("Unsupported entity type");
        }
    }
}
