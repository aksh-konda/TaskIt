package com.iamak.taskit.service;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.model.User;
import com.iamak.taskit.model.UserPreferences;
import com.iamak.taskit.repository.UserPreferencesRepository;
import com.iamak.taskit.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;

    public ProfileService(
            CurrentUserService currentUserService,
            UserRepository userRepository,
            UserPreferencesRepository userPreferencesRepository
    ) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.userPreferencesRepository = userPreferencesRepository;
    }

    public DomainDtos.ProfileResponse getProfile() {
        User user = currentUserService.getCurrentUser();
        return toResponse(user);
    }

    @Transactional
    public DomainDtos.ProfileResponse updateProfile(DomainDtos.ProfileRequest request) {
        User user = currentUserService.getCurrentUser();
        user.setDisplayName(request.displayName());
        user.setAvatarUrl(request.avatarUrl());
        user.setBio(request.bio());
        if (request.locale() != null && !request.locale().isBlank()) {
            user.setLocale(request.locale());
        }
        if (request.timezone() != null && !request.timezone().isBlank()) {
            user.setTimezone(request.timezone());
        }
        return toResponse(userRepository.save(user));
    }

    public DomainDtos.PreferencesResponse getPreferences() {
        User user = currentUserService.getCurrentUser();
        UserPreferences preferences = userPreferencesRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Preferences not found"));
        return toPreferencesResponse(preferences);
    }

    @Transactional
    public DomainDtos.PreferencesResponse updatePreferences(DomainDtos.PreferencesRequest request) {
        User user = currentUserService.getCurrentUser();
        UserPreferences preferences = userPreferencesRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Preferences not found"));

        if (request.themeId() != null) {
            preferences.setThemeId(request.themeId());
        }
        if (request.motionIntensity() != null) {
            preferences.setMotionIntensity(request.motionIntensity());
        }
        if (request.weekStartDay() != null) {
            preferences.setWeekStartDay(request.weekStartDay());
        }
        if (request.defaultReminderMinutesBefore() != null) {
            preferences.setDefaultReminderMinutesBefore(request.defaultReminderMinutesBefore());
        }
        if (request.notificationsEnabled() != null) {
            preferences.setNotificationsEnabled(request.notificationsEnabled());
        }
        preferences.setQuietHoursStart(request.quietHoursStart());
        preferences.setQuietHoursEnd(request.quietHoursEnd());

        return toPreferencesResponse(userPreferencesRepository.save(preferences));
    }

    private DomainDtos.ProfileResponse toResponse(User user) {
        return new DomainDtos.ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getAvatarUrl(),
                user.getBio(),
                user.getLocale(),
                user.getTimezone()
        );
    }

    private DomainDtos.PreferencesResponse toPreferencesResponse(UserPreferences preferences) {
        return new DomainDtos.PreferencesResponse(
                preferences.getThemeId(),
                preferences.getMotionIntensity(),
                preferences.getWeekStartDay(),
                preferences.getDefaultReminderMinutesBefore(),
                preferences.getNotificationsEnabled(),
                preferences.getQuietHoursStart(),
                preferences.getQuietHoursEnd()
        );
    }
}
