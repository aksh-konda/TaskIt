package com.iamak.taskit.dto.session;

import java.time.Instant;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class WorkSessionRequest {

    private Long taskId;

    @NotNull
    private Instant startTime;

    private Instant endTime;
    private Integer focusScore;
    private Integer distractionCount;

    @Size(max = 4000)
    private String notes;

    public Long getTaskId() {
        return taskId;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public Integer getFocusScore() {
        return focusScore;
    }

    public void setFocusScore(Integer focusScore) {
        this.focusScore = focusScore;
    }

    public Integer getDistractionCount() {
        return distractionCount;
    }

    public void setDistractionCount(Integer distractionCount) {
        this.distractionCount = distractionCount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
