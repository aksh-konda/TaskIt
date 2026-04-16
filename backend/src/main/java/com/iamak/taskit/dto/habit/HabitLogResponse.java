package com.iamak.taskit.dto.habit;

import java.time.LocalDate;

import com.iamak.taskit.entity.HabitLog;

public class HabitLogResponse {

    private Long id;
    private LocalDate date;
    private boolean completed;
    private String skipReason;

    public static HabitLogResponse from(HabitLog log) {
        HabitLogResponse response = new HabitLogResponse();
        response.setId(log.getId());
        response.setDate(log.getDate());
        response.setCompleted(log.isCompleted());
        response.setSkipReason(log.getSkipReason());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public String getSkipReason() {
        return skipReason;
    }

    public void setSkipReason(String skipReason) {
        this.skipReason = skipReason;
    }
}
