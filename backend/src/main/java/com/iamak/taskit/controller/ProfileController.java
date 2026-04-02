package com.iamak.taskit.controller;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.service.ProfileService;
import org.springframework.web.bind.annotation.*;

@RestController
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/profile")
    public DomainDtos.ProfileResponse getProfile() {
        return profileService.getProfile();
    }

    @PutMapping("/profile")
    public DomainDtos.ProfileResponse updateProfile(@RequestBody DomainDtos.ProfileRequest request) {
        return profileService.updateProfile(request);
    }

    @GetMapping("/preferences")
    public DomainDtos.PreferencesResponse getPreferences() {
        return profileService.getPreferences();
    }

    @PutMapping("/preferences")
    public DomainDtos.PreferencesResponse updatePreferences(@RequestBody DomainDtos.PreferencesRequest request) {
        return profileService.updatePreferences(request);
    }
}
