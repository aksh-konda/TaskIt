package com.iamak.taskit.repository;

import com.iamak.taskit.model.EventItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventItemRepository extends JpaRepository<EventItem, Long> {
    List<EventItem> findByUserIdAndDeletedAtIsNullOrderByStartAtUtcAsc(Long userId);
    List<EventItem> findByUserIdAndDeletedAtIsNotNullOrderByDeletedAtDesc(Long userId);
    Optional<EventItem> findByIdAndUserId(Long id, Long userId);
}
