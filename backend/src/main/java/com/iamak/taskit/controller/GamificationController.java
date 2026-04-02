package com.iamak.taskit.controller;

import com.iamak.taskit.service.GamificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gamification")
public class GamificationController {

    private final GamificationService gamificationService;

    public GamificationController(GamificationService gamificationService) {
        this.gamificationService = gamificationService;
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        return gamificationService.summary();
    }

    @GetMapping("/streaks")
    public Map<String, Integer> streaks() {
        return gamificationService.streaks();
    }

    @GetMapping("/badges")
    public List<?> badges() {
        return gamificationService.badges();
    }

    @GetMapping("/xp-events")
    public List<?> xpEvents() {
        return gamificationService.xpEvents();
    }
}
