package com.iamak.taskit.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.iamak.taskit.dto.Priority;
import com.iamak.taskit.dto.Status;
import com.iamak.taskit.dto.TaskType;
import com.iamak.taskit.dto.task.TaskRequest;
import com.iamak.taskit.dto.task.TaskResponse;
import com.iamak.taskit.entity.AppUser;
import com.iamak.taskit.entity.Task;
import com.iamak.taskit.security.UserPrincipal;
import com.iamak.taskit.service.TaskService;

class TaskControllerTest {

    @Test
    void getAllMapsEntitiesToResponseDtos() {
        TaskService taskService = mock(TaskService.class);
        TaskController controller = new TaskController(taskService);

        AppUser owner = new AppUser();
        owner.setId(99L);
        owner.setEmail("owner@example.com");
        owner.setPasswordHash("hash");

        Task task = new Task();
        task.setId(1L);
        task.setTitle("Task title");
        task.setDescription("Task description");
        task.setStatus(Status.TODO);
        task.setPriority(Priority.MEDIUM);
        task.setType(TaskType.DEEP_WORK);
        task.setDueDate(Instant.parse("2026-04-08T00:00:00Z"));
        task.setEstTime(20);
        task.setActualMinutes(15);
        task.setProgress(25);
        task.setOwner(owner);

        when(taskService.getAll(42L)).thenReturn(List.of(task));

        List<TaskResponse> response = controller.getAll(new UserPrincipal(42L, "user@example.com", "hash"));

        assertEquals(1, response.size());
        assertEquals("Task title", response.get(0).getTitle());
        assertEquals(25, response.get(0).getProgress());
    }

    @Test
    void createTrimsInputAndDoesNotExposeOwner() {
        TaskService taskService = mock(TaskService.class);
        TaskController controller = new TaskController(taskService);

        TaskRequest request = new TaskRequest();
        request.setTitle("  Ship release  ");
        request.setDescription("  Finish release checklist  ");
        request.setStatus(Status.IN_PROGRESS);
        request.setPriority(Priority.HIGH);
        request.setType(TaskType.DEEP_WORK);
        request.setDueDate(Instant.parse("2026-04-08T00:00:00Z"));
        request.setEstTime(30);
        request.setActualMinutes(25);
        request.setProgress(60);

        Task savedTask = new Task();
        savedTask.setId(10L);
        savedTask.setTitle("Ship release");
        savedTask.setDescription("Finish release checklist");
        savedTask.setStatus(Status.IN_PROGRESS);
        savedTask.setPriority(Priority.HIGH);
        savedTask.setType(TaskType.DEEP_WORK);
        savedTask.setDueDate(request.getDueDate());
        savedTask.setEstTime(30);
        savedTask.setActualMinutes(25);
        savedTask.setProgress(60);

        when(taskService.create(any(Task.class), eq(42L)))
                .thenReturn(savedTask);

        TaskResponse response = controller.create(new UserPrincipal(42L, "user@example.com", "hash"), request);
        ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);

        verify(taskService).create(taskCaptor.capture(), eq(42L));

        assertEquals("Ship release", response.getTitle());
        assertEquals("Finish release checklist", response.getDescription());
        assertEquals("Ship release", taskCaptor.getValue().getTitle());
        assertEquals("Finish release checklist", taskCaptor.getValue().getDescription());
        assertNull(taskCaptor.getValue().getOwner());
    }
}
