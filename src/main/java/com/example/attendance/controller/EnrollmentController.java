package com.example.attendance.controller;

import com.example.attendance.dto.BulkEnrollResult;
import com.example.attendance.dto.BulkRemoveRequest;
import com.example.attendance.dto.EnrollRequest;
import com.example.attendance.dto.EnrollmentResponse;
import com.example.attendance.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/enrollments")
@PreAuthorize("hasRole('ADMIN')")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/section/{sectionId}")
    public List<EnrollmentResponse> findBySection(@PathVariable Long sectionId) {
        return enrollmentService.findBySectionId(sectionId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EnrollmentResponse enroll(@Valid @RequestBody EnrollRequest request) {
        return enrollmentService.enroll(request.studentId(), request.sectionId());
    }

    @DeleteMapping("/{enrollmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long enrollmentId) {
        enrollmentService.removeEnrollment(enrollmentId);
    }

    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BulkEnrollResult bulkEnroll(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "sectionId", required = false) Long sectionId) {
        return enrollmentService.bulkEnroll(file, sectionId);
    }

    @DeleteMapping("/bulk")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void bulkRemove(@Valid @RequestBody BulkRemoveRequest request) {
        enrollmentService.bulkRemove(request.studentIds(), request.sectionId());
    }
}
