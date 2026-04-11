package com.iamak.taskit.dto.memory;

import java.time.Instant;

import com.iamak.taskit.dto.MemoryType;
import com.iamak.taskit.entity.VectorMemory;

public class MemoryResponse {

    private Long id;
    private String content;
    private MemoryType type;
    private String referenceType;
    private String referenceId;
    private Instant createdAt;

    public static MemoryResponse from(VectorMemory memory) {
        MemoryResponse response = new MemoryResponse();
        response.setId(memory.getId());
        response.setContent(memory.getContent());
        response.setType(memory.getType());
        response.setReferenceType(memory.getReferenceType());
        response.setReferenceId(memory.getReferenceId());
        response.setCreatedAt(memory.getCreatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public MemoryType getType() {
        return type;
    }

    public void setType(MemoryType type) {
        this.type = type;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
