package com.iamak.taskit.controller;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.model.HabitCheckin;
import com.iamak.taskit.service.HabitService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/habits")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @GetMapping
    public List<DomainDtos.HabitResponse> list() {
        return habitService.list();
    }

    @PostMapping
    public DomainDtos.HabitResponse create(@RequestBody DomainDtos.HabitRequest request) {
        return habitService.create(request);
    }

    @PutMapping("/{id}")
    public DomainDtos.HabitResponse update(@PathVariable Long id, @RequestBody DomainDtos.HabitRequest request) {
        return habitService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        habitService.delete(id);
    }

    @PostMapping("/{id}/checkins")
    public HabitCheckin checkin(@PathVariable Long id, @RequestBody DomainDtos.HabitCheckinRequest request) {
        return habitService.checkin(id, request);
    }

    @GetMapping("/{id}/checkins")
    public List<HabitCheckin> checkins(@PathVariable Long id) {
        return habitService.checkins(id);
    }
}
