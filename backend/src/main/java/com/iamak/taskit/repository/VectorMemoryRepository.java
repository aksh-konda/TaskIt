package com.iamak.taskit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.iamak.taskit.entity.VectorMemory;

public interface VectorMemoryRepository extends JpaRepository<VectorMemory, Long> {
    List<VectorMemory> findTop100ByUserIdOrderByCreatedAtDesc(Long userId);
    List<VectorMemory> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
