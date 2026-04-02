package com.iamak.taskit.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record SignupRequest(
            @Email @NotBlank String email,
            @NotBlank String password,
            @NotBlank String displayName,
            String timezone
    ) {
    }

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {
    }

    public record RefreshRequest(
            @NotBlank String refreshToken
    ) {
    }

    public record AuthResponse(
            String accessToken,
            String refreshToken,
            Long expiresInSeconds,
            UserSummary user
    ) {
    }

    public record UserSummary(
            Long id,
            String email,
            String displayName,
            String timezone
    ) {
    }
}
