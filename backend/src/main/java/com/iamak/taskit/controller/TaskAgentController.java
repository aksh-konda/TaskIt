package com.iamak.taskit.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.iamak.taskit.entity.Task;
import com.iamak.taskit.service.TaskService;


@RestController
@RequestMapping("/ai")
public class TaskAgentController {

    private TaskService taskService;

    public TaskAgentController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/plan")
    public PlanResponse generatePlan(@RequestBody PlanRequest request) {
        List<Task> tasks = this.taskService.getAll();
        List<String> plan = createAIPlan(request.getDateTime(), tasks);
        return new PlanResponse(plan);
    }

    private List<String> createAIPlan(LocalDateTime dateTime, List<Task> tasks) {
        List<String> plan = new ArrayList<>();
        // Add your AI planning logic here
        plan.add("Review tasks for " + dateTime);
        plan.add("Prioritize by deadline");
        plan.add("Set time blocks");
        for (Task task : tasks) {
            plan.add("Include task: " + task.getTitle());
        }
        return plan;
    }

    static class PlanRequest {
        private LocalDateTime dateTime;

        public LocalDateTime getDateTime() {
            return dateTime;
        }

        public void setDateTime(LocalDateTime dateTime) {
            this.dateTime = dateTime;
        }
    }

    static class PlanResponse {
        private List<String> plan;

        public PlanResponse(List<String> plan) {
            this.plan = plan;
        }

        public List<String> getPlan() {
            return plan;
        }

        public void setPlan(List<String> plan) {
            this.plan = plan;
        }
    }
}