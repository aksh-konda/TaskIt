package com.iamak.taskit.controller;

import com.iamak.taskit.dto.DomainDtos;
import com.iamak.taskit.service.TrashService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/trash")
public class TrashController {

    private final TrashService trashService;

    public TrashController(TrashService trashService) {
        this.trashService = trashService;
    }

    @GetMapping
    public List<DomainDtos.TrashItemResponse> list() {
        return trashService.list();
    }

    @PostMapping("/restore")
    public void restore(@RequestBody Map<String, Object> payload) {
        String entityType = String.valueOf(payload.get("entityType"));
        Long id = Long.valueOf(String.valueOf(payload.get("entityId")));
        trashService.restore(entityType, id);
    }

    @DeleteMapping("/purge/{entityType}/{id}")
    public void purge(@PathVariable String entityType, @PathVariable Long id) {
        trashService.purge(entityType, id);
    }
}
