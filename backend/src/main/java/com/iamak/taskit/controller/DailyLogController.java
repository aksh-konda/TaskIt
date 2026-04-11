package com.iamak.taskit.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iamak.taskit.dto.log.DailyLogRequest;
import com.iamak.taskit.dto.log.DailyLogResponse;
import com.iamak.taskit.entity.DailyLog;
import com.iamak.taskit.security.UserPrincipal;
import com.iamak.taskit.service.DailyLogService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/daily-logs")
public class DailyLogController {

    private final DailyLogService dailyLogService;

    public DailyLogController(DailyLogService dailyLogService) {
        this.dailyLogService = dailyLogService;
    }

    @PostMapping
    public DailyLogResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DailyLogRequest request) {
        DailyLog log = new DailyLog();
        log.setLogDate(request.getLogDate());
        log.setMood(request.getMood());
        log.setEnergy(request.getEnergy());
        log.setSleepHours(request.getSleepHours());
        log.setNotes(request.getNotes());
        log.setWins(request.getWins());
        log.setBlockers(request.getBlockers());
        return DailyLogResponse.from(dailyLogService.create(log, principal.getId()));
    }

    @GetMapping
    public List<DailyLogResponse> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return dailyLogService.getAll(principal.getId()).stream()
                .map(DailyLogResponse::from)
                .toList();
    }
}
