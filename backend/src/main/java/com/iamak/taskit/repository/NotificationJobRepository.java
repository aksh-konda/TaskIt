package com.iamak.taskit.repository;

import com.iamak.taskit.model.NotificationJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationJobRepository extends JpaRepository<NotificationJob, Long> {
    List<NotificationJob> findByUserIdOrderByScheduledForUtcDesc(Long userId);
}
