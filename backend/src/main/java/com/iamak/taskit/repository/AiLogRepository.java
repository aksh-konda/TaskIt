package com.iamak.taskit.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.iamak.taskit.entity.AiLog;

public interface AiLogRepository extends MongoRepository<AiLog, String> {
    List<AiLog> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
