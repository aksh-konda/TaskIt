package com.iamak.taskit.entity;

import com.iamak.taskit.dto.Status;
import com.iamak.taskit.dto.Priority;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    private Instant dueDate;

    private Integer estTime;

    private int progress;
}
