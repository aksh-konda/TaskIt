package com.iamak.taskit.config;

import com.iamak.taskit.dto.Priority;
import com.iamak.taskit.dto.Status;
import com.iamak.taskit.entity.Task;
import com.iamak.taskit.repository.TaskRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@Profile("docker")
public class DummyTaskDataLoader implements CommandLineRunner {

    private final TaskRepository taskRepository;

    public DummyTaskDataLoader(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(String... args) {
        if (taskRepository.count() > 0) {
            return;
        }

        Instant now = Instant.now().truncatedTo(ChronoUnit.DAYS);

        List<Task> tasks = List.of(
                new Task(
                        null,
                        "Design the sprint board",
                        "Review the current backlog and map the next sprint into clear deliverables.",
                        Status.IN_PROGRESS,
                        Priority.HIGH,
                        now.plus(2, ChronoUnit.DAYS),
                        4,
                        60
                ),
                new Task(
                        null,
                        "Write onboarding checklist",
                        "Document the steps a new teammate needs to get started quickly.",
                        Status.TODO,
                        Priority.MEDIUM,
                        now.plus(5, ChronoUnit.DAYS),
                        3,
                        0
                ),
                new Task(
                        null,
                        "Close completed bug fixes",
                        "Verify the last batch of fixes and move them to done.",
                        Status.COMPLETED,
                        Priority.LOW,
                        now.minus(1, ChronoUnit.DAYS),
                        2,
                        100
                )
        );

        taskRepository.saveAll(tasks);
    }
}
