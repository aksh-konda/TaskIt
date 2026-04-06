package com.iamak.taskit.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import com.iamak.taskit.dto.Status;
import com.iamak.taskit.entity.Task;

@Service
public class TaskPlanningAiService {

    private static final Logger logger = LoggerFactory.getLogger(TaskPlanningAiService.class);
    private static final String BLOCK_SEPARATOR = "----------------------------------------------------------------";

    private static final String SYSTEM_INSTRUCTIONS = """
            You are a strict task execution planner.

            Your job is to decide the ORDER of tasks.

            RULES:
            - Return ONLY a numbered list
            - Each step = task title + short reason
            - Do NOT assign time or dates
            - Do NOT split tasks
            - Keep output short and clear
            - Prioritize tasks already in progress
            - Group similar tasks together
            """;

    private final ChatClient chatClient;

    public TaskPlanningAiService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public List<String> generatePlan(String callId, LocalDateTime dateTime, List<Task> tasks) {
        long startNanos = System.nanoTime();
        LocalDateTime effectiveDateTime = dateTime != null ? dateTime : LocalDateTime.now();
        List<Task> safeTasks = tasks == null ? List.of()
                : tasks.stream()
                        .filter(Objects::nonNull)
                        .filter(task -> task.getStatus() != Status.COMPLETED)
                        .toList();
        String safeCallId = callId != null && !callId.isBlank() ? callId : "unknown-call-id";

        logger.info("[AI_PLAN][{}] ai.generate.start totalTasks={} activeTasks={} planAt={}",
                safeCallId,
                tasks == null ? 0 : tasks.size(),
                safeTasks.size(),
                effectiveDateTime);

        try {
            String prompt = buildPrompt(effectiveDateTime, safeTasks);
            if (logger.isDebugEnabled()) {
                logger.debug(BLOCK_SEPARATOR);
                logger.debug("[AI_PLAN][{}][PROMPT_BEGIN]", safeCallId);
                logger.debug("{}", prompt);
                logger.debug("[AI_PLAN][{}][PROMPT_END]", safeCallId);
            }

            long aiStartNanos = System.nanoTime();
            String content = this.chatClient.prompt()
                    .system(SYSTEM_INSTRUCTIONS)
                    .user(prompt)
                    .call()
                    .content();
            long aiDurationMs = (System.nanoTime() - aiStartNanos) / 1_000_000;

            if (logger.isDebugEnabled()) {
                logger.debug("[AI_PLAN][{}][RESPONSE_BEGIN]", safeCallId);
                logger.debug("{}", content == null ? "null" : content);
                logger.debug("[AI_PLAN][{}][RESPONSE_END]", safeCallId);
                logger.debug(BLOCK_SEPARATOR);
            }

            List<String> parsedPlan = parsePlanLines(safeCallId, content, effectiveDateTime, safeTasks);
            long totalDurationMs = (System.nanoTime() - startNanos) / 1_000_000;

            logger.info("[AI_PLAN][{}] ai.generate.success aiDurationMs={} totalDurationMs={} responseChars={} planSteps={}",
                    safeCallId,
                    aiDurationMs,
                    totalDurationMs,
                    content == null ? 0 : content.length(),
                    parsedPlan.size());

            return parsedPlan;
        } catch (Exception ex) {
            logger.error("[AI_PLAN][{}] ai.generate.error fallback=deterministic", safeCallId, ex);
            return fallbackPlan(safeCallId, effectiveDateTime, safeTasks);
        }
    }

    private String buildPrompt(LocalDateTime dateTime, List<Task> tasks) {
        StringBuilder builder = new StringBuilder();
        builder.append("Planning context time: ")
                .append(dateTime)
                .append("\n")
                .append("Tasks:\n");

        for (Task task : tasks) {
            builder.append("- ")
                    .append(defaultText(task.getTitle()))
                    .append(" | priority: ")
                    .append(task.getPriority())
                    .append(" | status: ")
                    .append(task.getStatus())
                    .append("\n");
        }

        builder.append("""

                Decide the best execution order.
                Return only a numbered list.
                """);

        return builder.toString();
    }

    private List<String> parsePlanLines(String callId, String content, LocalDateTime dateTime, List<Task> tasks) {
        if (content == null || content.isBlank()) {
            logger.warn("[AI_PLAN][{}] AI returned empty plan content; using fallback plan", callId);
            return fallbackPlan(callId, dateTime, tasks);
        }

        List<String> parsed = content.lines()
                .map(String::trim)
                .map(line -> line.replaceFirst("^[0-9]+[.)]\\s*", ""))
                .map(line -> line.replaceFirst("^[-*]\\s*", ""))
                .filter(line -> !line.isBlank())
                .limit(8)
                .toList();

        logger.debug("[AI_PLAN][{}] ai.parse steps={}", callId, parsed.size());

        return parsed.isEmpty() ? fallbackPlan(callId, dateTime, tasks) : parsed;
    }

    private List<String> fallbackPlan(String callId, LocalDateTime dateTime, List<Task> tasks) {
        List<String> plan = new ArrayList<>();
        plan.add("Review priorities and due dates at " + dateTime + ".");

        logger.warn("[AI_PLAN][{}] ai.fallback.start tasks={}", callId, tasks.size());

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

        logger.info("[AI_PLAN][{}] ai.fallback.success planSteps={}", callId, plan.size());

        return plan;
    }

    private String defaultText(String value) {
        return value == null || value.isBlank() ? "Untitled task" : value;
    }
}
