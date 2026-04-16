package com.iamak.taskit.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iamak.taskit.dto.session.WorkSessionRequest;
import com.iamak.taskit.dto.session.WorkSessionResponse;
import com.iamak.taskit.entity.WorkSession;
import com.iamak.taskit.security.UserPrincipal;
import com.iamak.taskit.service.WorkSessionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/sessions")
public class WorkSessionController {

    private final WorkSessionService workSessionService;

    public WorkSessionController(WorkSessionService workSessionService) {
        this.workSessionService = workSessionService;
    }

    @PostMapping
    public WorkSessionResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WorkSessionRequest request) {
        WorkSession session = new WorkSession();
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());
        session.setFocusScore(request.getFocusScore());
        session.setDistractionCount(request.getDistractionCount());
        session.setNotes(request.getNotes());
        return WorkSessionResponse.from(
                workSessionService.create(session, request.getTaskId(), principal.getId()));
    }

    @GetMapping
    public List<WorkSessionResponse> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return workSessionService.getAll(principal.getId()).stream()
                .map(WorkSessionResponse::from)
                .toList();
    }

    @PutMapping("/{id}")
    public WorkSessionResponse update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody WorkSessionRequest request) {
        WorkSession session = new WorkSession();
        session.setStartTime(request.getStartTime());
        session.setEndTime(request.getEndTime());
        session.setFocusScore(request.getFocusScore());
        session.setDistractionCount(request.getDistractionCount());
        session.setNotes(request.getNotes());

        return WorkSessionResponse.from(
                workSessionService.update(id, session, request.getTaskId(), principal.getId()));
    }

    @DeleteMapping("/{id}")
    public void delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        workSessionService.delete(id, principal.getId());
    }
}
