package com.iamak.taskit.config;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.iamak.taskit.dto.Priority;
import com.iamak.taskit.dto.Status;
import com.iamak.taskit.entity.Task;
import com.iamak.taskit.repository.TaskRepository;

@Component
@Profile("dev")
public class DummyTaskDataLoader implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DummyTaskDataLoader.class);

    private final TaskRepository taskRepository;

    public DummyTaskDataLoader(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(String... args) {
        if (taskRepository.count() > 0) {
            logger.info("Skipping dummy task seed because tasks already exist");
            return;
        }

        Instant now = Instant.now().truncatedTo(ChronoUnit.DAYS);

        List<Task> tasks = List.of(
                new Task(
                        null,
                        "Fix LLM plan endpoint",
                        "Debug and ensure AI returns a usable ordered task plan.",
                        Status.IN_PROGRESS,
                        Priority.HIGH,
                        now.plus(1, ChronoUnit.DAYS),
                        1800,
                        40
                ),
                new Task(
                        null,
                        "Apply to 3 backend jobs",
                        "Search and apply to at least 3 relevant backend developer roles.",
                        Status.TODO,
                        Priority.HIGH,
                        now.plus(1, ChronoUnit.DAYS),
                        1800,
                        0
                ),
                new Task(
                        null,
                        "Gym workout (push day)",
                        "Complete chest, shoulders, and triceps workout.",
                        Status.TODO,
                        Priority.MEDIUM,
                        now.plus(0, ChronoUnit.DAYS),
                        3600,
                        0
                ),
                new Task(
                        null,
                        "Update resume project section",
                        "Add AI task planner project with description and tech stack.",
                        Status.TODO,
                        Priority.HIGH,
                        now.plus(2, ChronoUnit.DAYS),
                        2400,
                        0
                ),
                new Task(
                        null,
                        "Reduce screen time in morning",
                        "Avoid phone usage for first 30 minutes after waking up.",
                        Status.TODO,
                        Priority.MEDIUM,
                        now.plus(0, ChronoUnit.DAYS),
                        900,
                        0
                )
        );

        taskRepository.saveAll(tasks);
        logger.info("Seeded {} dummy tasks for the dev profile", tasks.size());
    }
}