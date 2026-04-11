package com.iamak.taskit.security;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class JwtStartupValidator {

    private static final String DEV_PROFILE = "dev";
    private static final int MIN_SECRET_BYTES = 32;
    private static final String DEV_SECRET = "dev-insecure-secret-change-me-dev-only";

    private final Environment environment;
    private final String secret;

    public JwtStartupValidator(Environment environment, @Value("${app.jwt.secret:}") String secret) {
        this.environment = environment;
        this.secret = secret;
    }

    @PostConstruct
    void validate() {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("app.jwt.secret must be configured");
        }

        if (secret.getBytes(StandardCharsets.UTF_8).length < MIN_SECRET_BYTES) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 bytes");
        }

        boolean devProfileActive = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(DEV_PROFILE::equalsIgnoreCase);

        if (!devProfileActive && DEV_SECRET.equals(secret)) {
            throw new IllegalStateException("The development JWT secret is only allowed with the dev profile");
        }
    }
}
