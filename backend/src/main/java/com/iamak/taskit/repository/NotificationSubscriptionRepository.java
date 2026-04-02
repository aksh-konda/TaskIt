package com.iamak.taskit.repository;

import com.iamak.taskit.model.NotificationSubscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationSubscriptionRepository extends JpaRepository<NotificationSubscription, Long> {
    List<NotificationSubscription> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<NotificationSubscription> findByIdAndUserId(Long id, Long userId);
}
