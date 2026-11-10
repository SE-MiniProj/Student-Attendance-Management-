package com.example.attendance.controller;

import com.example.attendance.dto.SectionRequest;
import com.example.attendance.dto.SectionResponse;
import com.example.attendance.service.SectionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/sections")
public class SectionController {

    private final SectionService sectionService;

    public SectionController(SectionService sectionService) {
        this.sectionService = sectionService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public List<SectionResponse> findAll(
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) Long courseId) {
        return sectionService.findAll(semesterId, courseId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public SectionResponse findById(@PathVariable Long id) {
        return sectionService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public SectionResponse create(@Valid @RequestBody SectionRequest request) {
        return sectionService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public SectionResponse update(@PathVariable Long id, @Valid @RequestBody SectionRequest request) {
        return sectionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        sectionService.delete(id);
    }

    @PatchMapping("/{id}/assign-faculty")
    @PreAuthorize("hasRole('ADMIN')")
    public SectionResponse assignFaculty(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Object teacherIdObj = body.get("teacherId");
        if (teacherIdObj == null) {
            throw new IllegalArgumentException("teacherId is required");
        }
        Long teacherId;
        if (teacherIdObj instanceof Number num) {
            teacherId = num.longValue();
        } else {
            teacherId = Long.parseLong(teacherIdObj.toString());
        }
        return sectionService.assignFaculty(id, teacherId);
    }
}
