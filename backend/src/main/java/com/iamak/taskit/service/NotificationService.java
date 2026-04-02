package com.iamak.taskit.service;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.model.NotificationSubscription;
import com.iamak.taskit.model.User;
import com.iamak.taskit.repository.NotificationSubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationSubscriptionRepository subscriptionRepository;
    private final CurrentUserService currentUserService;
    private final ProfileService profileService;

    public NotificationService(
            NotificationSubscriptionRepository subscriptionRepository,
            CurrentUserService currentUserService,
            ProfileService profileService
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.currentUserService = currentUserService;
        this.profileService = profileService;
    }

    public List<NotificationSubscription> listSubscriptions() {
        User user = currentUserService.getCurrentUser();
        return subscriptionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional
    public NotificationSubscription subscribe(DomainDtos.NotificationSubscriptionRequest request) {
        User user = currentUserService.getCurrentUser();
        NotificationSubscription subscription = NotificationSubscription.builder()
                .user(user)
                .endpoint(request.endpoint())
                .p256dh(request.p256dh())
                .auth(request.auth())
                .userAgent(request.userAgent())
                .build();
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public void unsubscribe(Long id) {
        User user = currentUserService.getCurrentUser();
        NotificationSubscription subscription = subscriptionRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));
        subscriptionRepository.delete(subscription);
    }

    public Map<String, String> test() {
        return Map.of("status", "queued", "message", "Test notification queued (provider integration hook ready)");
    }

    public DomainDtos.PreferencesResponse preferences() {
        return profileService.getPreferences();
    }

    public DomainDtos.PreferencesResponse updatePreferences(DomainDtos.PreferencesRequest request) {
        return profileService.updatePreferences(request);
    }
}
