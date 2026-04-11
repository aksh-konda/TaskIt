package com.iamak.taskit.dto.log;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import com.iamak.taskit.entity.DailyLog;

public class DailyLogResponse {

    private Long id;
    private LocalDate logDate;
    private String mood;
    private Integer energy;
    private BigDecimal sleepHours;
    private String notes;
    private String wins;
    private String blockers;
    private Instant createdAt;

    public static DailyLogResponse from(DailyLog log) {
        DailyLogResponse response = new DailyLogResponse();
        response.setId(log.getId());
        response.setLogDate(log.getLogDate());
        response.setMood(log.getMood());
        response.setEnergy(log.getEnergy());
        response.setSleepHours(log.getSleepHours());
        response.setNotes(log.getNotes());
        response.setWins(log.getWins());
        response.setBlockers(log.getBlockers());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public String getMood() {
        return mood;
    }

    public void setMood(String mood) {
        this.mood = mood;
    }

    public Integer getEnergy() {
        return energy;
    }

    public void setEnergy(Integer energy) {
        this.energy = energy;
    }

    public BigDecimal getSleepHours() {
        return sleepHours;
    }

    public void setSleepHours(BigDecimal sleepHours) {
        this.sleepHours = sleepHours;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getWins() {
        return wins;
    }

    public void setWins(String wins) {
        this.wins = wins;
    }

    public String getBlockers() {
        return blockers;
    }

    public void setBlockers(String blockers) {
        this.blockers = blockers;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
