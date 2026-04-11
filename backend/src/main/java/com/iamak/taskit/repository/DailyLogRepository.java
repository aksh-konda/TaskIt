package com.iamak.taskit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.iamak.taskit.entity.DailyLog;

public interface DailyLogRepository extends JpaRepository<DailyLog, Long> {
    List<DailyLog> findAllByUserIdOrderByLogDateDesc(Long userId);
}
