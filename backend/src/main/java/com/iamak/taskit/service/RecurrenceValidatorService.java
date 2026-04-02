package com.iamak.taskit.service;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.model.FrequencyType;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
public class RecurrenceValidatorService {

    private static final Set<String> VALID_END_TYPES = Set.of("never", "until_date", "after_occurrences");
    private static final Set<String> VALID_WEEKDAYS = Set.of(
            "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
    );

    public void validate(DomainDtos.RecurrenceDto recurrence) {
        if (recurrence == null) {
            return;
        }
        if (recurrence.frequency() == null) {
            throw new IllegalArgumentException("Recurrence frequency is required");
        }
        if (recurrence.interval() == null || recurrence.interval() < 1) {
            throw new IllegalArgumentException("Recurrence interval must be >= 1");
        }

        if (recurrence.frequency() == FrequencyType.WEEKLY) {
            List<String> weekdays = recurrence.byWeekdays();
            if (weekdays == null || weekdays.isEmpty()) {
                throw new IllegalArgumentException("Weekly recurrence requires byWeekdays");
            }
            for (String day : weekdays) {
                if (day == null || !VALID_WEEKDAYS.contains(day.toLowerCase())) {
                    throw new IllegalArgumentException("Invalid weekday in recurrence: " + day);
                }
            }
        }

        if (recurrence.frequency() == FrequencyType.MONTHLY) {
            Integer dayOfMonth = recurrence.byMonthDay();
            if (dayOfMonth == null || dayOfMonth < 1 || dayOfMonth > 31) {
                throw new IllegalArgumentException("Monthly recurrence requires byMonthDay between 1 and 31");
            }
        }

        DomainDtos.RecurrenceEndDto end = recurrence.end();
        if (end == null) {
            throw new IllegalArgumentException("Recurrence end condition is required");
        }

        String type = end.type();
        if (type == null || !VALID_END_TYPES.contains(type.toLowerCase())) {
            throw new IllegalArgumentException("Invalid recurrence end type");
        }

        if ("until_date".equalsIgnoreCase(type)) {
            if (end.untilDateLocal() == null || end.untilDateLocal().isBlank()) {
                throw new IllegalArgumentException("untilDateLocal is required for until_date end type");
            }
            LocalDate.parse(end.untilDateLocal());
        }

        if ("after_occurrences".equalsIgnoreCase(type)) {
            if (end.occurrences() == null || end.occurrences() < 1) {
                throw new IllegalArgumentException("occurrences must be >= 1 for after_occurrences end type");
            }
        }
    }
}
