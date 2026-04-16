package com.iamak.taskit.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.iamak.taskit.dto.MemoryType;
import com.iamak.taskit.entity.AppUser;
import com.iamak.taskit.entity.DailyLog;
import com.iamak.taskit.exception.ResourceNotFoundException;
import com.iamak.taskit.repository.AppUserRepository;
import com.iamak.taskit.repository.DailyLogRepository;

@Service
public class DailyLogService {

    private final DailyLogRepository dailyLogRepository;
    private final AppUserRepository appUserRepository;
    private final RAGService ragService;

    public DailyLogService(
            DailyLogRepository dailyLogRepository,
            AppUserRepository appUserRepository,
            RAGService ragService) {
        this.dailyLogRepository = dailyLogRepository;
        this.appUserRepository = appUserRepository;
        this.ragService = ragService;
    }

    public DailyLog create(DailyLog log, Long userId) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        log.setUser(user);
        DailyLog saved = dailyLogRepository.save(log);
        ragService.storeMemory(
                userId,
                buildSummary(saved),
                MemoryType.LOG,
                "daily_log",
                String.valueOf(saved.getId()));
        return saved;
    }

    public List<DailyLog> getAll(Long userId) {
        return dailyLogRepository.findAllByUserIdOrderByLogDateDesc(userId);
    }

    public DailyLog update(Long id, DailyLog update, Long userId) {
        DailyLog existing = dailyLogRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Daily log not found"));

        existing.setLogDate(update.getLogDate());
        existing.setMood(update.getMood());
        existing.setEnergy(update.getEnergy());
        existing.setSleepHours(update.getSleepHours());
        existing.setNotes(update.getNotes());
        existing.setWins(update.getWins());
        existing.setBlockers(update.getBlockers());

        DailyLog saved = dailyLogRepository.save(existing);
        ragService.storeMemory(
                userId,
                buildSummary(saved),
                MemoryType.LOG,
                "daily_log",
                String.valueOf(saved.getId()));
        return saved;
    }

    public void delete(Long id, Long userId) {
        DailyLog existing = dailyLogRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Daily log not found"));
        dailyLogRepository.delete(existing);
    }

    private String buildSummary(DailyLog log) {
        StringBuilder summary = new StringBuilder("Daily reflection");
        if (log.getMood() != null) {
            summary.append(", mood ").append(log.getMood());
        }
        if (log.getEnergy() != null) {
            summary.append(", energy ").append(log.getEnergy());
        }
        if (log.getBlockers() != null && !log.getBlockers().isBlank()) {
            summary.append(". Blockers: ").append(log.getBlockers().trim());
        }
        if (log.getWins() != null && !log.getWins().isBlank()) {
            summary.append(". Wins: ").append(log.getWins().trim());
        }
        if (log.getNotes() != null && !log.getNotes().isBlank()) {
            summary.append(". Notes: ").append(log.getNotes().trim());
        }
        return summary.toString();
    }
}
