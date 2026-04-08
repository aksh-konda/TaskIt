package com.iamak.taskit.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.iamak.taskit.dto.auth.AuthResponse;
import com.iamak.taskit.dto.auth.LoginRequest;
import com.iamak.taskit.dto.auth.LogoutRequest;
import com.iamak.taskit.dto.auth.RefreshRequest;
import com.iamak.taskit.dto.auth.RegisterRequest;
import com.iamak.taskit.entity.AppUser;
import com.iamak.taskit.entity.RefreshToken;
import com.iamak.taskit.exception.BadRequestException;
import com.iamak.taskit.repository.AppUserRepository;
import com.iamak.taskit.repository.RefreshTokenRepository;
import com.iamak.taskit.security.JwtService;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AppUserRepository appUserRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SecureRandom secureRandom = new SecureRandom();
    private final long refreshTtlSeconds;

    public AuthService(
            AppUserRepository appUserRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            @Value("${app.jwt.refresh-ttl-seconds}") long refreshTtlSeconds) {
        this.appUserRepository = appUserRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTtlSeconds = refreshTtlSeconds;
    }

    public AuthResponse register(RegisterRequest request) {
        logger.info("auth.register.request email={}", request.getEmail());
        if (appUserRepository.existsByEmail(request.getEmail())) {
            logger.warn("auth.register.duplicate email={}", request.getEmail());
            throw new BadRequestException("Email already registered");
        }

        AppUser user = new AppUser();
        user.setEmail(request.getEmail().toLowerCase());
        user.setDisplayName(request.getDisplayName());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        AppUser saved = appUserRepository.save(user);
        logger.info("auth.register.success userId={}", saved.getId());

        return issueTokens(saved);
    }

    public AuthResponse login(LoginRequest request) {
        logger.info("auth.login.request email={}", request.getEmail());
        AppUser user = appUserRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            logger.warn("auth.login.invalid-password userId={}", user.getId());
            throw new BadRequestException("Invalid credentials");
        }

        logger.info("auth.login.success userId={}", user.getId());
        return issueTokens(user);
    }

    public AuthResponse refresh(RefreshRequest request) {
        logger.info("auth.refresh.request");
        String rawToken = request.getRefreshToken();
        String tokenHash = hashToken(rawToken);
        RefreshToken stored = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (stored.isRevoked() || stored.isExpired(Instant.now())) {
            logger.warn("auth.refresh.expired userId={}", stored.getUser().getId());
            throw new BadRequestException("Refresh token expired");
        }

        stored.setRevokedAt(Instant.now());
        refreshTokenRepository.save(stored);

        logger.info("auth.refresh.success userId={}", stored.getUser().getId());

        return issueTokens(stored.getUser());
    }

    public void logout(LogoutRequest request) {
        logger.info("auth.logout.request");
        String tokenHash = hashToken(request.getRefreshToken());
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            if (!token.isRevoked()) {
                token.setRevokedAt(Instant.now());
                refreshTokenRepository.save(token);
                logger.info("auth.logout.success userId={}", token.getUser().getId());
            }
        });
    }

    private AuthResponse issueTokens(AppUser user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = generateRefreshToken();

        RefreshToken stored = new RefreshToken();
        stored.setUser(user);
        stored.setTokenHash(hashToken(refreshToken));
        stored.setCreatedAt(Instant.now());
        stored.setExpiresAt(Instant.now().plusSeconds(refreshTtlSeconds));
        refreshTokenRepository.save(stored);

        logger.debug("auth.tokens.issued userId={}", user.getId());

        return new AuthResponse(accessToken, refreshToken);
    }

    private String generateRefreshToken() {
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hashed);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }
}
