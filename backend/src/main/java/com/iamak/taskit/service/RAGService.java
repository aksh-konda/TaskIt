package com.iamak.taskit.service;

import java.util.List;

import com.iamak.taskit.dto.MemoryType;
import com.iamak.taskit.entity.VectorMemory;

public interface RAGService {
    VectorMemory storeMemory(Long userId, String content, MemoryType type, String referenceType, String referenceId);
    List<VectorMemory> retrieveRelevantMemories(Long userId, String query, int limit);
    String embedText(String text);
}
