package com.iamak.taskit.auth;

import com.iamak.taskit.dto.AuthDtos;
import com.iamak.taskit.model.*;
import com.iamak.taskit.repository.AuthIdentityRepository;
import com.iamak.taskit.repository.RefreshTokenRepository;
import com.iamak.taskit.repository.UserPreferencesRepository;
import com.iamak.taskit.repository.UserRepository;
import com.iamak.taskit.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final AuthIdentityRepository authIdentityRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final int accessTokenMinutes;
    private final int refreshTokenDays;

    public AuthService(
            UserRepository userRepository,
            UserPreferencesRepository userPreferencesRepository,
            AuthIdentityRepository authIdentityRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            @Value("${taskit.jwt.access-token-minutes}") int accessTokenMinutes,
            @Value("${taskit.jwt.refresh-token-days}") int refreshTokenDays
    ) {
        this.userRepository = userRepository;
        this.userPreferencesRepository = userPreferencesRepository;
        this.authIdentityRepository = authIdentityRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.accessTokenMinutes = accessTokenMinutes;
        this.refreshTokenDays = refreshTokenDays;
    }

    @Transactional
    public AuthDtos.AuthResponse signup(AuthDtos.SignupRequest request) {
        userRepository.findByEmail(request.email().trim().toLowerCase())
                .ifPresent(user -> {
                    throw new IllegalArgumentException("Email already exists");
                });

        String timezone = request.timezone();
        if (timezone == null || timezone.isBlank()) {
            timezone = "UTC";
        } else {
            ZoneId.of(timezone);
        }

        User user = User.builder()
                .email(request.email().trim().toLowerCase())
                .displayName(request.displayName().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
                .locale("en-US")
                .timezone(timezone)
                .build();
        User saved = userRepository.save(user);

        userPreferencesRepository.save(UserPreferences.builder()
                .user(saved)
                .themeId("graphite-cyan")
                .motionIntensity("normal")
                .weekStartDay("monday")
                .defaultReminderMinutesBefore(15)
                .notificationsEnabled(true)
                .build());

        authIdentityRepository.save(AuthIdentity.builder()
                .user(saved)
                .provider(AuthProvider.LOCAL)
                .providerUserId(saved.getEmail())
                .providerEmail(saved.getEmail())
                .build());

        return buildAuthResponse(saved);
    }

    @Transactional
    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password())
        );
        User user = userRepository.findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        return buildAuthResponse(user);
    }

    @Transactional
    public AuthDtos.AuthResponse refresh(AuthDtos.RefreshRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (token.getExpiresAt().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new IllegalArgumentException("Refresh token expired");
        }

        User user = token.getUser();
        refreshTokenRepository.delete(token);
        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        refreshTokenRepository.deleteByToken(refreshToken);
    }

    public AuthDtos.UserSummary me(User user) {
        return new AuthDtos.UserSummary(user.getId(), user.getEmail(), user.getDisplayName(), user.getTimezone());
    }

    private AuthDtos.AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = UUID.randomUUID().toString() + UUID.randomUUID();

        refreshTokenRepository.deleteByUserId(user.getId());
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(Instant.now().plusSeconds(refreshTokenDays * 86400L))
                .build());

        return new AuthDtos.AuthResponse(
                accessToken,
                refreshToken,
                accessTokenMinutes * 60L,
                new AuthDtos.UserSummary(user.getId(), user.getEmail(), user.getDisplayName(), user.getTimezone())
        );
    }
}
