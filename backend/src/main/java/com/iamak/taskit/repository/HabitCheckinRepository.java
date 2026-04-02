package com.iamak.taskit.repository;

import com.iamak.taskit.model.HabitCheckin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HabitCheckinRepository extends JpaRepository<HabitCheckin, Long> {
    List<HabitCheckin> findByHabitIdAndUserIdOrderByCompletedAtUtcDesc(Long habitId, Long userId);
}
