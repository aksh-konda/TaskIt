package com.iamak.taskit.repository;

import com.iamak.taskit.model.Habit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUserIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long userId);
    List<Habit> findByUserIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(Long userId);
    Optional<Habit> findByIdAndUserId(Long id, Long userId);
}
