package com.iamak.taskit.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.iamak.taskit.entity.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
}
