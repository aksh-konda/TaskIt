package com.iamak.taskit.config;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.iamak.taskit.dto.Priority;
import com.iamak.taskit.dto.Status;
import com.iamak.taskit.dto.TaskType;
import com.iamak.taskit.entity.AppUser;
import com.iamak.taskit.entity.Task;
import com.iamak.taskit.repository.AppUserRepository;
import com.iamak.taskit.repository.TaskRepository;

@Component
@Profile("dev")
public class DummyTaskDataLoader implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DummyTaskDataLoader.class);

    private final TaskRepository taskRepository;
        private final AppUserRepository appUserRepository;
        private final PasswordEncoder passwordEncoder;

        public DummyTaskDataLoader(TaskRepository taskRepository, AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.taskRepository = taskRepository;
                this.appUserRepository = appUserRepository;
                this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (taskRepository.count() > 0) {
            logger.info("Skipping dummy task seed because tasks already exist");
            return;
        }

        Instant now = Instant.now().truncatedTo(ChronoUnit.DAYS);

        AppUser user = appUserRepository.findByEmail("dev@taskit.local")
                .orElseGet(() -> {
                    AppUser created = new AppUser();
                    created.setEmail("dev@taskit.local");
                    created.setDisplayName("TaskIt Dev");
                    created.setPasswordHash(passwordEncoder.encode("devpass123"));
                    return appUserRepository.save(created);
                });

        List<Task> tasks = List.of(
                task(user, "Fix LLM plan endpoint", "Debug and ensure AI returns a usable ordered task plan.", Status.IN_PROGRESS, Priority.HIGH, TaskType.DEEP_WORK, now.plus(1, ChronoUnit.DAYS), 30, 40),
                task(user, "Apply to 3 backend jobs", "Search and apply to at least 3 relevant backend developer roles.", Status.TODO, Priority.HIGH, TaskType.SHALLOW, now.plus(1, ChronoUnit.DAYS), 30, 0),
                task(user, "Gym workout (push day)", "Complete chest, shoulders, and triceps workout.", Status.TODO, Priority.MEDIUM, TaskType.BREAK, now.plus(0, ChronoUnit.DAYS), 60, 0),
                task(user, "Update resume project section", "Add AI task planner project with description and tech stack.", Status.TODO, Priority.HIGH, TaskType.DEEP_WORK, now.plus(2, ChronoUnit.DAYS), 40, 0),
                task(user, "Reduce screen time in morning", "Avoid phone usage for first 30 minutes after waking up.", Status.TODO, Priority.MEDIUM, TaskType.HABIT, now.plus(0, ChronoUnit.DAYS), 15, 0)
        );

        taskRepository.saveAll(tasks);
        logger.info("Seeded {} dummy tasks for the dev profile", tasks.size());
    }

    private Task task(
            AppUser user,
            String title,
            String description,
            Status status,
            Priority priority,
            TaskType type,
            Instant dueDate,
            Integer estimatedMinutes,
            int progress) {
        Task task = new Task();
        task.setOwner(user);
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(status);
        task.setPriority(priority);
        task.setType(type);
        task.setDueDate(dueDate);
        task.setEstTime(estimatedMinutes);
        task.setProgress(progress);
        return task;
    }
}
