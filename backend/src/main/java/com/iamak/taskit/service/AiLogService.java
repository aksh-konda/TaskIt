package com.iamak.taskit.service;

import java.time.Instant;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.iamak.taskit.entity.AiLog;
import com.iamak.taskit.repository.AiLogRepository;

@Service
public class AiLogService {

    private static final Logger logger = LoggerFactory.getLogger(AiLogService.class);

    private final AiLogRepository aiLogRepository;

    public AiLogService(AiLogRepository aiLogRepository) {
        this.aiLogRepository = aiLogRepository;
    }

    public void logPlannerCall(Long userId, String input, List<String> retrievedContext, String output) {
        try {
            AiLog aiLog = new AiLog();
            aiLog.setUserId(userId);
            aiLog.setInput(input);
            aiLog.setRetrievedContext(retrievedContext);
            aiLog.setOutput(output);
            aiLog.setCreatedAt(Instant.now());
            aiLogRepository.save(aiLog);
        } catch (Exception ex) {
            // Mongo is optional in early environments; AI flow should still continue.
            logger.warn("ai.log.persist.failed userId={} reason={}", userId, ex.getMessage());
        }
    }

    public List<AiLog> listRecent(Long userId) {
        try {
            return aiLogRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId);
        } catch (Exception ex) {
            logger.warn("ai.log.list.failed userId={} reason={}", userId, ex.getMessage());
            return List.of();
        }
    }
}
