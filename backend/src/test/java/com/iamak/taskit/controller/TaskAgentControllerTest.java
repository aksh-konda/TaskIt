package com.iamak.taskit.controller;

import com.iamak.taskit.dto.PlanRequest;
import com.iamak.taskit.dto.PlanResponse;
import com.iamak.taskit.entity.Task;
import com.iamak.taskit.service.TaskPlanningAiService;
import com.iamak.taskit.service.TaskService;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

        PlanRequest request = new PlanRequest();
        request.setDateTime(requestedDateTime);

        when(taskService.getAll()).thenReturn(tasks);
        when(taskPlanningAiService.generatePlan(requestedDateTime, tasks)).thenReturn(expectedPlan);

        PlanResponse response = controller.generatePlan(request);

        assertEquals(expectedPlan, response.getPlan());
        verify(taskService).getAll();
        verify(taskPlanningAiService).generatePlan(requestedDateTime, tasks);
    }
}