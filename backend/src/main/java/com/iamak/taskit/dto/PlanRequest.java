package com.iamak.taskit.dto;

import java.time.LocalDateTime;

public class PlanRequest {
    private LocalDateTime dateTime;

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }
}