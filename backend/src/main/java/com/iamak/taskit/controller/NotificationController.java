package com.iamak.taskit.controller;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.model.NotificationSubscription;
import com.iamak.taskit.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/subscriptions")
    public List<NotificationSubscription> listSubscriptions() {
        return notificationService.listSubscriptions();
    }

    @PostMapping("/subscriptions")
    public NotificationSubscription subscribe(@RequestBody DomainDtos.NotificationSubscriptionRequest request) {
        return notificationService.subscribe(request);
    }

    @DeleteMapping("/subscriptions/{id}")
    public void unsubscribe(@PathVariable Long id) {
        notificationService.unsubscribe(id);
    }

    @PostMapping("/test")
    public Map<String, String> test() {
        return notificationService.test();
    }

    @GetMapping("/preferences")
    public DomainDtos.PreferencesResponse preferences() {
        return notificationService.preferences();
    }

    @PutMapping("/preferences")
    public DomainDtos.PreferencesResponse updatePreferences(@RequestBody DomainDtos.PreferencesRequest request) {
        return notificationService.updatePreferences(request);
    }
}
