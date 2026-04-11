package com.iamak.taskit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.iamak.taskit.entity.HabitLog;

public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {
    List<HabitLog> findAllByHabitIdOrderByDateDesc(Long habitId);
}
