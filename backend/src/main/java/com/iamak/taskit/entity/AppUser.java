package com.iamak.taskit.entity;

import java.time.Instant;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Entity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String displayName;
    private String timezone;
    private LocalTime wakeTime;
    private LocalTime sleepTime;

    @ElementCollection
    @CollectionTable(name = "user_goals", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "goal")
    private List<String> goals = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_focus_areas", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "focus_area")
    private List<String> focusAreas = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_peak_hours", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "peak_hour")
    private List<Integer> peakHours = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_low_hours", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "low_hour")
    private List<Integer> lowHours = new ArrayList<>();

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
