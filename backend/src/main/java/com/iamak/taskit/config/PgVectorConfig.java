package com.iamak.taskit.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class PgVectorConfig implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(PgVectorConfig.class);

    private final JdbcTemplate jdbcTemplate;

    @Value("${app.rag.pgvector.enabled:true}")
    private boolean pgVectorEnabled;

    public PgVectorConfig(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        if (!pgVectorEnabled) {
            logger.info("pgvector initialization disabled by configuration");
            return;
        }

        try {
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS vector");
            logger.info("pgvector extension ensured");
        } catch (Exception ex) {
            logger.warn("pgvector extension not available, fallback retrieval will be used: {}", ex.getMessage());
        }
    }
}
