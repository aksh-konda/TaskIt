package com.iamak.taskit.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.iamak.taskit.dto.PlanRequest;
import com.iamak.taskit.dto.PlanResponse;
import com.iamak.taskit.entity.Task;
import com.iamak.taskit.security.UserPrincipal;
import com.iamak.taskit.service.TaskPlanningAiService;
import com.iamak.taskit.service.TaskService;


@RestController
@RequestMapping("/ai")
public class TaskAgentController {

    private static final Logger logger = LoggerFactory.getLogger(TaskAgentController.class);
    private static final String SESSION_SEPARATOR = "----------------------------------------------------------------";

    private final TaskService taskService;
    private final TaskPlanningAiService taskPlanningAiService;

    public TaskAgentController(TaskService taskService, TaskPlanningAiService taskPlanningAiService) {
        this.taskService = taskService;
        this.taskPlanningAiService = taskPlanningAiService;
    }

    @PostMapping("/plan")
    public PlanResponse generatePlan(@AuthenticationPrincipal UserPrincipal principal, @RequestBody PlanRequest request) {
        String callId = UUID.randomUUID().toString();
        long startNanos = System.nanoTime();
        LocalDateTime requestedDateTime = request != null ? request.getDateTime() : null;

        logger.info(SESSION_SEPARATOR);
        logger.info("[AI_PLAN][{}] request.start endpoint=/ai/plan requestedDateTime={}", callId,
                requestedDateTime != null ? requestedDateTime : "null");

        try {
            List<Task> tasks = this.taskService.getAll(principal.getId());
            int taskCount = tasks != null ? tasks.size() : 0;
            logger.debug("[AI_PLAN][{}] tasks.loaded count={}", callId, taskCount);

            List<String> plan = this.taskPlanningAiService.generatePlan(callId, requestedDateTime, tasks);
            int planSteps = plan != null ? plan.size() : 0;

            long elapsedMs = (System.nanoTime() - startNanos) / 1_000_000;
            logger.info("[AI_PLAN][{}] request.success planSteps={} durationMs={}", callId, planSteps, elapsedMs);
            logger.info(SESSION_SEPARATOR);

            return new PlanResponse(plan);
        }
        catch (Exception ex) {
            long elapsedMs = (System.nanoTime() - startNanos) / 1_000_000;
            logger.error("[AI_PLAN][{}] request.error durationMs={}", callId, elapsedMs, ex);
            logger.info(SESSION_SEPARATOR);
            throw ex;
        }
    }
}