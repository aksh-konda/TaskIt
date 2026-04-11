package com.iamak.taskit.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.iamak.taskit.dto.memory.MemoryResponse;
import com.iamak.taskit.security.UserPrincipal;
import com.iamak.taskit.service.RAGService;

@RestController
@RequestMapping("/memory")
public class MemoryController {

    private final RAGService ragService;

    public MemoryController(RAGService ragService) {
        this.ragService = ragService;
    }

    @GetMapping
    public List<MemoryResponse> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "10") int limit) {
        return ragService.retrieveRelevantMemories(principal.getId(), query, limit).stream()
                .map(MemoryResponse::from)
                .toList();
    }
}
