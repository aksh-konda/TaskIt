package com.iamak.taskit.repository;

import com.iamak.taskit.model.XpEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface XpEventRepository extends JpaRepository<XpEvent, Long> {
    List<XpEvent> findByUserIdOrderByCreatedAtDesc(Long userId);
}
