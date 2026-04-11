package com.iamak.taskit.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.iamak.taskit.entity.Habit;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findAllByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Habit> findByIdAndUserId(Long id, Long userId);
}
