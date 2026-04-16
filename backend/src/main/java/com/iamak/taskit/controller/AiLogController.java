package com.iamak.taskit.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iamak.taskit.dto.ai.AiLogResponse;
import com.iamak.taskit.security.UserPrincipal;
import com.iamak.taskit.service.AiLogService;

@RestController
@RequestMapping("/ai-logs")
public class AiLogController {

    private final AiLogService aiLogService;

    public AiLogController(AiLogService aiLogService) {
        this.aiLogService = aiLogService;
    }

    @GetMapping
    public List<AiLogResponse> list(@AuthenticationPrincipal UserPrincipal principal) {
        return aiLogService.listRecent(principal.getId()).stream()
                .map(AiLogResponse::from)
                .toList();
    }
}
