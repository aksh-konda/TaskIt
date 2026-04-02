package com.iamak.taskit.service;

import com.iamak.taskit.entity.Task;
import org.springframework.ai.chat.client.ChatClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class TaskPlanningAiService {

    private static final Logger logger = LoggerFactory.getLogger(TaskPlanningAiService.class);

    private static final String SYSTEM_INSTRUCTIONS = """
            You are a focused productivity assistant.
            Build a realistic execution plan for the user's tasks.
            Return only a plain text numbered list with short, actionable steps.
            Keep the plan concise and ordered by urgency and impact.
            """;

    private final ChatClient chatClient;

    public TaskPlanningAiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public List<String> generatePlan(LocalDateTime dateTime, List<Task> tasks) {
        LocalDateTime effectiveDateTime = dateTime != null ? dateTime : LocalDateTime.now();
        List<Task> safeTasks = tasks != null ? tasks : List.of();

        logger.info("Generating AI plan for {} tasks", safeTasks.size());

        try {
            String content = this.chatClient.prompt()
                    .system(SYSTEM_INSTRUCTIONS)
                    .user(buildPrompt(effectiveDateTime, safeTasks))
                    .call()
                    .content();

            return parsePlanLines(content, effectiveDateTime, safeTasks);
        }
        catch (Exception ex) {
            logger.error("AI planning failed; falling back to deterministic plan", ex);
            return fallbackPlan(effectiveDateTime, safeTasks);
        }
    }

    private String buildPrompt(LocalDateTime dateTime, List<Task> tasks) {
        StringBuilder builder = new StringBuilder();
        builder.append("Current planning time: ")
                .append(dateTime)
                .append("\n")
                .append("Tasks:\n");

        if (tasks.isEmpty()) {
            builder.append("- No tasks currently available.\n");
        }
        else {
            for (Task task : tasks) {
                builder.append("- title: ").append(defaultText(task.getTitle()))
                        .append(", status: ").append(task.getStatus())
                        .append(", priority: ").append(task.getPriority())
                        .append(", dueDate(UTC): ").append(task.getDueDate() == null ? "none" : task.getDueDate().atOffset(ZoneOffset.UTC))
                        .append(", estTime(min): ").append(task.getEstTime() == null ? "unknown" : task.getEstTime())
                        .append(", progress(%): ").append(task.getProgress())
                        .append("\n");
            }
        }

        builder.append("Generate 5 to 8 actionable plan steps.");
        return builder.toString();
    }

    private List<String> parsePlanLines(String content, LocalDateTime dateTime, List<Task> tasks) {
        if (content == null || content.isBlank()) {
            logger.warn("AI returned empty plan content; using fallback plan");
            return fallbackPlan(dateTime, tasks);
        }

        List<String> parsed = content.lines()
                .map(String::trim)
                .map(line -> line.replaceFirst("^[0-9]+[.)]\\s*", ""))
                .map(line -> line.replaceFirst("^[-*]\\s*", ""))
                .filter(line -> !line.isBlank())
                .limit(8)
                .toList();

            logger.debug("Parsed {} AI plan steps", parsed.size());

        return parsed.isEmpty() ? fallbackPlan(dateTime, tasks) : parsed;
    }

    private List<String> fallbackPlan(LocalDateTime dateTime, List<Task> tasks) {
        List<String> plan = new ArrayList<>();
        plan.add("Review priorities and due dates at " + dateTime + ".");

            logger.info("Building fallback plan for {} tasks", tasks.size());

        tasks.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator
                        .comparing((Task t) -> t.getDueDate() == null)
                        .thenComparing(Task::getDueDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .limit(5)
                .forEach(task -> plan.add("Focus on task: " + defaultText(task.getTitle())));

        if (plan.size() == 1) {
            plan.add("Capture your top 3 priorities for today.");
            plan.add("Time-block one focused session for each priority.");
        }

        logger.debug("Fallback plan contains {} steps", plan.size());

        return plan;
    }

    private String defaultText(String value) {
        return value == null || value.isBlank() ? "Untitled task" : value;
    }
}
