package com.iamak.taskit.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column
    private String location;

    @Column(nullable = false)
    private Boolean allDay;

    @Column(nullable = false)
    private Instant startAtUtc;

    @Column(nullable = false)
    private Instant endAtUtc;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status;

    @Column(nullable = false)
    private Boolean recurrenceEnabled;

    @Column(columnDefinition = "text")
    private String recurrenceConfigJson;

    @Column
    private Integer reminderMinutesBefore;

    @Column(nullable = false)
    private String sourceTimezone;

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
        if (allDay == null) {
            allDay = false;
        }
        if (recurrenceEnabled == null) {
            recurrenceEnabled = false;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
