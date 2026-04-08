package com.iamak.taskit.controller;

import com.iamak.taskit.dto.PlanRequest;
import com.iamak.taskit.dto.PlanResponse;
import com.iamak.taskit.entity.Task;
import com.iamak.taskit.security.UserPrincipal;
import com.iamak.taskit.service.TaskPlanningAiService;
import com.iamak.taskit.service.TaskService;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class TaskAgentControllerTest {

    @Test
    void generatePlanDelegatesToPlanningService() {
        TaskService taskService = mock(TaskService.class);
        TaskPlanningAiService taskPlanningAiService = mock(TaskPlanningAiService.class);
        TaskAgentController controller = new TaskAgentController(taskService, taskPlanningAiService);

        List<Task> tasks = List.of(new Task());
        List<String> expectedPlan = List.of("Step one", "Step two");
        LocalDateTime requestedDateTime = LocalDateTime.of(2026, 4, 2, 9, 0);
        UserPrincipal principal = new UserPrincipal(42L, "dev@taskit.local", "hash");

        PlanRequest request = new PlanRequest();
        request.setDateTime(requestedDateTime);

        when(taskService.getAll(42L)).thenReturn(tasks);
        when(taskPlanningAiService.generatePlan(anyString(), any(), any())).thenReturn(expectedPlan);

        PlanResponse response = controller.generatePlan(principal, request);

        assertEquals(expectedPlan, response.getPlan());
        verify(taskService).getAll(42L);
        verify(taskPlanningAiService).generatePlan(anyString(), any(), any());
    }
}