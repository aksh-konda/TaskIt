package com.iamak.taskit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.iamak.taskit.entity.WorkSession;

public interface WorkSessionRepository extends JpaRepository<WorkSession, Long> {
    List<WorkSession> findAllByUserIdOrderByStartTimeDesc(Long userId);
}
