package com.iamak.taskit.dto.habit;

import java.time.Instant;

import com.iamak.taskit.entity.Habit;

public class HabitResponse {

    private Long id;
    private String name;
    private String frequency;
    private String target;
    private String difficulty;
    private Instant createdAt;

    public static HabitResponse from(Habit habit) {
        HabitResponse response = new HabitResponse();
        response.setId(habit.getId());
        response.setName(habit.getName());
        response.setFrequency(habit.getFrequency());
        response.setTarget(habit.getTarget());
        response.setDifficulty(habit.getDifficulty());
        response.setCreatedAt(habit.getCreatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
