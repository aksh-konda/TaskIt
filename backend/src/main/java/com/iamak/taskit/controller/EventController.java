package com.iamak.taskit.controller;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.service.EventService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<DomainDtos.EventResponse> list() {
        return eventService.list();
    }

    @PostMapping
    public DomainDtos.EventResponse create(@RequestBody DomainDtos.EventRequest request) {
        return eventService.create(request);
    }

    @PutMapping("/{id}")
    public DomainDtos.EventResponse update(@PathVariable Long id, @RequestBody DomainDtos.EventRequest request) {
        return eventService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        eventService.delete(id);
    }

    @PostMapping("/{id}/mark-done")
    public DomainDtos.EventResponse markDone(@PathVariable Long id) {
        return eventService.markDone(id);
    }
}
