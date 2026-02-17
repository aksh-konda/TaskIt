package com.iamak.taskit.repository;

import com.iamak.taskit.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {
}
