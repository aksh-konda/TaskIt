package com.iamak.taskit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "habits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FrequencyType frequencyType;

    @Column(nullable = false)
    private Integer targetCountPerPeriod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HabitDifficulty difficulty;

    @Column(nullable = false)
    private Boolean recurrenceEnabled;

    @Column(columnDefinition = "text")
    private String recurrenceConfigJson;

    @Column(nullable = false)
    private Integer streakCurrent;

    @Column(nullable = false)
    private Integer streakBest;

    @Column
    private String lastSatisfiedDateKey;

    @Column(nullable = false)
    private Boolean active;

    @Column
    private Instant deletedAt;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (recurrenceEnabled == null) {
            recurrenceEnabled = false;
        }
        if (streakCurrent == null) {
            streakCurrent = 0;
        }
        if (streakBest == null) {
            streakBest = 0;
        }
        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
