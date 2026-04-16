package com.iamak.taskit.service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.iamak.taskit.dto.MemoryType;
import com.iamak.taskit.entity.AppUser;
import com.iamak.taskit.entity.VectorMemory;
import com.iamak.taskit.exception.ResourceNotFoundException;
import com.iamak.taskit.repository.AppUserRepository;
import com.iamak.taskit.repository.VectorMemoryRepository;

@Service
public class SimpleRAGService implements RAGService {

    private static final Logger logger = LoggerFactory.getLogger(SimpleRAGService.class);

    private final VectorMemoryRepository vectorMemoryRepository;
    private final AppUserRepository appUserRepository;
    private final EmbeddingModel embeddingModel;

    @Value("${app.rag.embedding.fallback-dimensions:64}")
    private int fallbackDimensions;

    public SimpleRAGService(
            VectorMemoryRepository vectorMemoryRepository,
            AppUserRepository appUserRepository,
            ObjectProvider<EmbeddingModel> embeddingModelProvider) {
        this.vectorMemoryRepository = vectorMemoryRepository;
        this.appUserRepository = appUserRepository;
        this.embeddingModel = embeddingModelProvider.getIfAvailable();
    }

    @Override
    public VectorMemory storeMemory(Long userId, String content, MemoryType type, String referenceType, String referenceId) {
        if (content == null || content.isBlank()) {
            return null;
        }

        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        VectorMemory memory = new VectorMemory();
        memory.setUser(user);
        memory.setContent(content.trim());
        memory.setEmbedding(embedText(content));
        memory.setType(type);
        memory.setReferenceType(referenceType);
        memory.setReferenceId(referenceId);
        return vectorMemoryRepository.save(memory);
    }

    @Override
    public List<VectorMemory> retrieveRelevantMemories(Long userId, String query, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 20));
        String safeQuery = query == null ? "" : query.trim();

        if (safeQuery.isBlank()) {
            return vectorMemoryRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId).stream()
                    .limit(safeLimit)
                    .toList();
        }

        String queryEmbedding = embedText(safeQuery);

        try {
            List<VectorMemory> similar = vectorMemoryRepository.findMostSimilar(userId, queryEmbedding, safeLimit);
            if (!similar.isEmpty()) {
                return similar;
            }
        } catch (Exception ex) {
            logger.warn("rag.pgvector.query.failed userId={} reason={}", userId, ex.getMessage());
        }

        Set<String> queryTerms = tokenize(query);
        return vectorMemoryRepository.findTop50ByUserIdOrderByCreatedAtDesc(userId).stream()
                .sorted(Comparator
                        .comparingInt((VectorMemory memory) -> overlapScore(queryTerms, tokenize(memory.getContent())))
                        .reversed()
                        .thenComparing(VectorMemory::getCreatedAt, Comparator.reverseOrder()))
                .filter(memory -> queryTerms.isEmpty() || overlapScore(queryTerms, tokenize(memory.getContent())) > 0)
                .limit(safeLimit)
                .toList();
    }

    @Override
    public String embedText(String text) {
        if (embeddingModel != null) {
            try {
                float[] embedded = embeddingModel.embed(text);
                if (embedded != null && embedded.length > 0) {
                    return toPgVectorLiteral(embedded);
                }
            } catch (Exception ex) {
                logger.warn("rag.embedding.model.failed reason={}", ex.getMessage());
            }
        }

        return fallbackEmbedding(text);
    }

    private Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return Set.of();
        }

        return Arrays.stream(text.toLowerCase(Locale.ROOT).split("[^a-z0-9]+"))
                .filter(term -> !term.isBlank())
                .collect(Collectors.toSet());
    }

    private int overlapScore(Set<String> left, Set<String> right) {
        return (int) left.stream()
                .filter(right::contains)
                .count();
    }

    private String toPgVectorLiteral(float[] values) {
        StringBuilder builder = new StringBuilder("[");
        for (int i = 0; i < values.length; i++) {
            if (i > 0) {
                builder.append(',');
            }
            builder.append(values[i]);
        }
        builder.append(']');
        return builder.toString();
    }

    private String fallbackEmbedding(String text) {
        int dimensions = Math.max(8, Math.min(fallbackDimensions, 256));
        double[] vector = new double[dimensions];

        tokenize(text).forEach(term -> {
            int index = Math.abs(term.hashCode()) % dimensions;
            vector[index] += 1.0d;
        });

        double norm = Math.sqrt(Arrays.stream(vector).map(value -> value * value).sum());
        float[] normalized = new float[dimensions];

        for (int i = 0; i < dimensions; i++) {
            normalized[i] = norm == 0.0d ? 0.0f : (float) (vector[i] / norm);
        }

        return toPgVectorLiteral(normalized);
    }
}
