package com.iamak.taskit.dto.session;

import java.time.Instant;

import com.iamak.taskit.entity.WorkSession;

public class WorkSessionResponse {

    private Long id;
    private Long taskId;
    private Instant startTime;
    private Instant endTime;
    private Integer focusScore;
    private Integer distractionCount;
    private String notes;

    public static WorkSessionResponse from(WorkSession session) {
        WorkSessionResponse response = new WorkSessionResponse();
        response.setId(session.getId());
        response.setTaskId(session.getTask() != null ? session.getTask().getId() : null);
        response.setStartTime(session.getStartTime());
        response.setEndTime(session.getEndTime());
        response.setFocusScore(session.getFocusScore());
        response.setDistractionCount(session.getDistractionCount());
        response.setNotes(session.getNotes());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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
