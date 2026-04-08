package com.iamak.taskit.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.iamak.taskit.entity.Task;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
	List<Task> findAllByOwnerId(Long ownerId);
	Optional<Task> findByIdAndOwnerId(Long id, Long ownerId);
}
