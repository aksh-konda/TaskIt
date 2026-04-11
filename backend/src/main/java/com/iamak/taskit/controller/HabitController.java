package com.iamak.taskit.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iamak.taskit.dto.habit.HabitLogRequest;
import com.iamak.taskit.dto.habit.HabitRequest;
import com.iamak.taskit.dto.habit.HabitResponse;
import com.iamak.taskit.entity.Habit;
import com.iamak.taskit.security.UserPrincipal;
import com.iamak.taskit.service.HabitService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/habits")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @PostMapping
    public HabitResponse create(@AuthenticationPrincipal UserPrincipal principal, @Valid @RequestBody HabitRequest request) {
        Habit habit = new Habit();
        habit.setName(request.getName().trim());
        habit.setFrequency(request.getFrequency());
        habit.setTarget(request.getTarget());
        habit.setDifficulty(request.getDifficulty());
        return HabitResponse.from(habitService.create(habit, principal.getId()));
    }

    @GetMapping
    public List<HabitResponse> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return habitService.getAll(principal.getId()).stream()
                .map(HabitResponse::from)
                .toList();
    }

    @PostMapping("/{id}/logs")
    public void logHabit(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody HabitLogRequest request) {
        habitService.logHabit(id, principal.getId(), request.getDate(), request.isCompleted());
    }
}
