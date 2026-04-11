package com.iamak.taskit.service;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.iamak.taskit.dto.MemoryType;
import com.iamak.taskit.entity.AppUser;
import com.iamak.taskit.entity.VectorMemory;
import com.iamak.taskit.exception.ResourceNotFoundException;
import com.iamak.taskit.repository.AppUserRepository;
import com.iamak.taskit.repository.VectorMemoryRepository;

@Service
public class SimpleRAGService implements RAGService {

    private final VectorMemoryRepository vectorMemoryRepository;
    private final AppUserRepository appUserRepository;

    public SimpleRAGService(VectorMemoryRepository vectorMemoryRepository, AppUserRepository appUserRepository) {
        this.vectorMemoryRepository = vectorMemoryRepository;
        this.appUserRepository = appUserRepository;
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
        Set<String> queryTerms = tokenize(query);
        return vectorMemoryRepository.findTop100ByUserIdOrderByCreatedAtDesc(userId).stream()
                .sorted(Comparator
                        .comparingInt((VectorMemory memory) -> overlapScore(queryTerms, tokenize(memory.getContent())))
                        .reversed()
                        .thenComparing(VectorMemory::getCreatedAt, Comparator.reverseOrder()))
                .filter(memory -> queryTerms.isEmpty() || overlapScore(queryTerms, tokenize(memory.getContent())) > 0)
                .limit(Math.max(1, limit))
                .toList();
    }

    @Override
    public String embedText(String text) {
        Set<String> terms = tokenize(text);
        return String.join(",", terms);
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
}
