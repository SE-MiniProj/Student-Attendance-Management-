package com.example.attendance.controller;

import com.example.attendance.dto.SemesterRequest;
import com.example.attendance.model.Semester;
import com.example.attendance.service.SemesterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/semesters")
public class SemesterController {

    private final SemesterService semesterService;

    public SemesterController(SemesterService semesterService) {
        this.semesterService = semesterService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public List<Semester> findAll() {
        return semesterService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public Semester findById(@PathVariable Long id) {
        return semesterService.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Semester create(@Valid @RequestBody SemesterRequest request) {
        return semesterService.create(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Semester update(@PathVariable Long id, @Valid @RequestBody SemesterRequest request) {
        return semesterService.update(id, request);
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public Semester activate(@PathVariable Long id) {
        return semesterService.activate(id);
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public Semester deactivate(@PathVariable Long id) {
        return semesterService.deactivate(id);
    }
}
