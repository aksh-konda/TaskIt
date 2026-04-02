package com.iamak.taskit.dto;

import com.iamak.taskit.model.*;

import java.time.Instant;
import java.util.List;

public class DomainDtos {

    public record RecurrenceDto(
            FrequencyType frequency,
            Integer interval,
            List<String> byWeekdays,
            Integer byMonthDay,
            RecurrenceEndDto end
    ) {
    }

    public record RecurrenceEndDto(
            String type,
            String untilDateLocal,
            Integer occurrences
    ) {
    }

    public record TaskRequest(
            String title,
            String description,
            Priority priority,
            TaskStatus status,
            Instant dueAtUtc,
            Instant scheduledAtUtc,
            Integer estimateMinutes,
            String sourceTimezone,
            RecurrenceDto recurrence
    ) {
    }

    public record TaskResponse(
            Long id,
            String title,
            String description,
            Priority priority,
            TaskStatus status,
            Instant dueAtUtc,
            Instant scheduledAtUtc,
            Instant completedAtUtc,
            Integer estimateMinutes,
            String sourceTimezone,
            Boolean recurrenceEnabled,
            String recurrenceConfigJson,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record HabitRequest(
            String name,
            String description,
            FrequencyType frequencyType,
            Integer targetCountPerPeriod,
            HabitDifficulty difficulty,
            String sourceTimezone,
            RecurrenceDto recurrence
    ) {
    }

    public record HabitResponse(
            Long id,
            String name,
            String description,
            FrequencyType frequencyType,
            Integer targetCountPerPeriod,
            HabitDifficulty difficulty,
            Integer streakCurrent,
            Integer streakBest,
            String lastSatisfiedDateKey,
            Boolean active,
            Boolean recurrenceEnabled,
            String recurrenceConfigJson,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record HabitCheckinRequest(
            Instant completedAtUtc,
            String localDateKey,
            Integer count
    ) {
    }

    public record EventRequest(
            String title,
            String description,
            String location,
            Boolean allDay,
            Instant startAtUtc,
            Instant endAtUtc,
            Integer reminderMinutesBefore,
            String sourceTimezone,
            RecurrenceDto recurrence
    ) {
    }

    public record EventResponse(
            Long id,
            String title,
            String description,
            String location,
            Boolean allDay,
            Instant startAtUtc,
            Instant endAtUtc,
            EventStatus status,
            Integer reminderMinutesBefore,
            String sourceTimezone,
            Boolean recurrenceEnabled,
            String recurrenceConfigJson,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    public record ProfileRequest(
            String displayName,
            String avatarUrl,
            String bio,
            String locale,
            String timezone
    ) {
    }

    public record ProfileResponse(
            Long id,
            String email,
            String displayName,
            String avatarUrl,
            String bio,
            String locale,
            String timezone
    ) {
    }

    public record PreferencesRequest(
            String themeId,
            String motionIntensity,
            String weekStartDay,
            Integer defaultReminderMinutesBefore,
            Boolean notificationsEnabled,
            String quietHoursStart,
            String quietHoursEnd
    ) {
    }

    public record PreferencesResponse(
            String themeId,
            String motionIntensity,
            String weekStartDay,
            Integer defaultReminderMinutesBefore,
            Boolean notificationsEnabled,
            String quietHoursStart,
            String quietHoursEnd
    ) {
    }

    public record NotificationSubscriptionRequest(
            String endpoint,
            String p256dh,
            String auth,
            String userAgent
    ) {
    }

    public record TrashItemResponse(
            String entityType,
            Long id,
            String title,
            Instant deletedAt
    ) {
    }
}
