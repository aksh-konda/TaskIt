package com.iamak.taskit.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.iamak.taskit.entity.VectorMemory;

public interface VectorMemoryRepository extends JpaRepository<VectorMemory, Long> {
    List<VectorMemory> findTop100ByUserIdOrderByCreatedAtDesc(Long userId);
    List<VectorMemory> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
    List<VectorMemory> findTop50ByUserIdOrderByCreatedAtDesc(Long userId);

    @Query(value = """
            select *
            from vector_memories
            where user_id = :userId
            order by cast(embedding as vector) <-> cast(:queryEmbedding as vector), created_at desc
            limit :limit
            """, nativeQuery = true)
    List<VectorMemory> findMostSimilar(
            @Param("userId") Long userId,
            @Param("queryEmbedding") String queryEmbedding,
            @Param("limit") int limit);
}
