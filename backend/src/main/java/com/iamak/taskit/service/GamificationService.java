package com.iamak.taskit.service;

import com.iamak.taskit.model.User;
import com.iamak.taskit.model.UserBadge;
import com.iamak.taskit.model.XpEvent;
import com.iamak.taskit.repository.UserBadgeRepository;
import com.iamak.taskit.repository.XpEventRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GamificationService {

    private final CurrentUserService currentUserService;
    private final XpEventRepository xpEventRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final HabitService habitService;

    public GamificationService(
            CurrentUserService currentUserService,
            XpEventRepository xpEventRepository,
            UserBadgeRepository userBadgeRepository,
            HabitService habitService
    ) {
        this.currentUserService = currentUserService;
        this.xpEventRepository = xpEventRepository;
        this.userBadgeRepository = userBadgeRepository;
        this.habitService = habitService;
    }

    public Map<String, Object> summary() {
        User user = currentUserService.getCurrentUser();
        List<XpEvent> events = xpEventRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        int totalXp = events.stream().mapToInt(XpEvent::getXp).sum();
        int level = computeLevel(totalXp);
        int nextLevelTarget = levelThreshold(level + 1);
        int xpToNextLevel = Math.max(0, nextLevelTarget - totalXp);

        int currentHabitStreak = habitService.list().stream()
                .mapToInt(h -> h.streakCurrent() == null ? 0 : h.streakCurrent())
                .max()
                .orElse(0);

        List<UserBadge> badges = userBadgeRepository.findByUserIdOrderByEarnedAtDesc(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("totalXp", totalXp);
        response.put("level", level);
        response.put("xpToNextLevel", xpToNextLevel);
        response.put("currentStreaks", Map.of("habit", currentHabitStreak, "task", 0));
        response.put("badges", badges.stream().map(b -> Map.of(
                "code", b.getBadge().getCode(),
                "name", b.getBadge().getName(),
                "earnedAt", b.getEarnedAt()
        )).toList());
        return response;
    }

    public List<XpEvent> xpEvents() {
        User user = currentUserService.getCurrentUser();
        return xpEventRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<UserBadge> badges() {
        User user = currentUserService.getCurrentUser();
        return userBadgeRepository.findByUserIdOrderByEarnedAtDesc(user.getId());
    }

    public Map<String, Integer> streaks() {
        int currentHabitStreak = habitService.list().stream()
                .mapToInt(h -> h.streakCurrent() == null ? 0 : h.streakCurrent())
                .max()
                .orElse(0);
        return Map.of("habit", currentHabitStreak, "task", 0);
    }

    private int computeLevel(int totalXp) {
        int level = 1;
        while (totalXp >= levelThreshold(level + 1)) {
            level++;
        }
        return level;
    }

    private int levelThreshold(int level) {
        return (level - 1) * 200;
    }
}
