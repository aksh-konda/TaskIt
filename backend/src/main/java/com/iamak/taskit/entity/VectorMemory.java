package com.iamak.taskit.entity;

import java.time.Instant;

import com.iamak.taskit.dto.MemoryType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vector_memories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VectorMemory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Lob
    @Column(nullable = false)
    private String content;

    // Placeholder for pgvector/Pinecone migration. We keep the field now so
    // memory ingestion and retrieval can be wired before true vector storage.
    @Lob
    private String embedding;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemoryType type;

    private String referenceType;
    private String referenceId;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
