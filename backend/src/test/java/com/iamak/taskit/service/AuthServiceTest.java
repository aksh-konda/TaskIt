package com.iamak.taskit.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.iamak.taskit.dto.auth.AuthResponse;
import com.iamak.taskit.dto.auth.RefreshRequest;
import com.iamak.taskit.dto.auth.RegisterRequest;
import com.iamak.taskit.entity.AppUser;
import com.iamak.taskit.entity.RefreshToken;
import com.iamak.taskit.exception.BadRequestException;
import com.iamak.taskit.repository.AppUserRepository;
import com.iamak.taskit.repository.RefreshTokenRepository;
import com.iamak.taskit.security.JwtService;

class AuthServiceTest {

    @Test
    void registerNormalizesEmailBeforeCheckingForDuplicates() {
        AppUserRepository appUserRepository = mock(AppUserRepository.class);
        RefreshTokenRepository refreshTokenRepository = mock(RefreshTokenRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        JwtService jwtService = mock(JwtService.class);
        AuthService authService = new AuthService(
                appUserRepository,
                refreshTokenRepository,
                passwordEncoder,
                jwtService,
                3600L);

        RegisterRequest request = new RegisterRequest();
        request.setEmail("  USER@Example.com ");
        request.setPassword("password123");

        when(appUserRepository.existsByEmail("user@example.com")).thenReturn(true);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.register(request));

        assertEquals("Email already registered", exception.getMessage());
        verify(appUserRepository).existsByEmail("user@example.com");
    }

    @Test
    void registerTranslatesDatabaseUniquenessViolations() {
        AppUserRepository appUserRepository = mock(AppUserRepository.class);
        RefreshTokenRepository refreshTokenRepository = mock(RefreshTokenRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        JwtService jwtService = mock(JwtService.class);
        AuthService authService = new AuthService(
                appUserRepository,
                refreshTokenRepository,
                passwordEncoder,
                jwtService,
                3600L);

        RegisterRequest request = new RegisterRequest();
        request.setEmail("USER@example.com");
        request.setPassword("password123");

        when(appUserRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded");
        when(appUserRepository.saveAndFlush(any(AppUser.class))).thenThrow(new DataIntegrityViolationException("duplicate"));

        BadRequestException exception = assertThrows(BadRequestException.class, () -> authService.register(request));

        assertEquals("Email already registered", exception.getMessage());
    }

    @Test
    void refreshUsesLockedTokenLookup() {
        AppUserRepository appUserRepository = mock(AppUserRepository.class);
        RefreshTokenRepository refreshTokenRepository = mock(RefreshTokenRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        JwtService jwtService = mock(JwtService.class);
        AuthService authService = new AuthService(
                appUserRepository,
                refreshTokenRepository,
                passwordEncoder,
                jwtService,
                3600L);

        AppUser user = new AppUser();
        user.setId(7L);
        user.setEmail("user@example.com");

        RefreshToken storedToken = new RefreshToken();
        storedToken.setUser(user);
        storedToken.setTokenHash("stored-hash");
        storedToken.setCreatedAt(Instant.now());
        storedToken.setExpiresAt(Instant.now().plusSeconds(600));

        RefreshRequest request = new RefreshRequest();
        request.setRefreshToken("raw-refresh-token");

        when(refreshTokenRepository.findByTokenHashForUpdate(any())).thenReturn(Optional.of(storedToken));
        when(jwtService.generateAccessToken(user)).thenReturn("access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.refresh(request);

        assertEquals("access-token", response.getAccessToken());
        verify(refreshTokenRepository).findByTokenHashForUpdate(any());
        verify(refreshTokenRepository).save(eq(storedToken));
    }
}
