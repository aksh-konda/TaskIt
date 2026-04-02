package com.iamak.taskit.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

import com.iamak.taskit.dto.PlanRequest;
import com.iamak.taskit.dto.PlanResponse;
import com.iamak.taskit.entity.Task;
import com.iamak.taskit.service.TaskPlanningAiService;
import com.iamak.taskit.service.TaskService;


@RestController
@RequestMapping("/ai")
public class TaskAgentController {

    private final TaskService taskService;
    private final TaskPlanningAiService taskPlanningAiService;

    public TaskAgentController(TaskService taskService, TaskPlanningAiService taskPlanningAiService) {
        this.taskService = taskService;
        this.taskPlanningAiService = taskPlanningAiService;
    }

    @PostMapping("/plan")
    public PlanResponse generatePlan(@RequestBody PlanRequest request) {
        LocalDateTime requestedDateTime = request != null ? request.getDateTime() : null;
        List<Task> tasks = this.taskService.getAll();
        List<String> plan = this.taskPlanningAiService.generatePlan(requestedDateTime, tasks);
        return new PlanResponse(plan);
    }
}