package com.iamak.taskit.security;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class JwtStartupValidatorTest {

    @Test
    void rejectsMissingSecret() {
        MockEnvironment environment = new MockEnvironment();
        JwtStartupValidator validator = new JwtStartupValidator(environment, "");

        assertThrows(IllegalStateException.class, validator::validate);
    }

    @Test
    void rejectsDevSecretOutsideDevProfile() {
        MockEnvironment environment = new MockEnvironment();
        JwtStartupValidator validator = new JwtStartupValidator(
                environment,
                "dev-insecure-secret-change-me-dev-only");

        assertThrows(IllegalStateException.class, validator::validate);
    }

    @Test
    void allowsDevSecretWhenDevProfileIsActive() {
        MockEnvironment environment = new MockEnvironment();
        environment.setActiveProfiles("dev");
        JwtStartupValidator validator = new JwtStartupValidator(
                environment,
                "dev-insecure-secret-change-me-dev-only");

        assertDoesNotThrow(validator::validate);
    }
}
