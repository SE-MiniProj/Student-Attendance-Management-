package com.example.attendance.controller;

import com.example.attendance.dto.AttendanceResponse;
import com.example.attendance.dto.AttendanceSummary;
import com.example.attendance.dto.MarkAttendanceRequest;
import com.example.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public AttendanceResponse mark(@Valid @RequestBody MarkAttendanceRequest request) {
        return attendanceService.mark(request);
    }

    /** All records for one student in one course. */
    @GetMapping("/student/{studentId}/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or (hasRole('STUDENT') and @authService.isCurrentStudent(#studentId, authentication))")
    public List<AttendanceResponse> byStudentAndCourse(@PathVariable Long studentId,
                                                       @PathVariable Long courseId) {
        return attendanceService.findByStudentAndCourse(studentId, courseId);
    }

    /** The class register for one course on one date. */
    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<AttendanceResponse> byCourseAndDate(
            @PathVariable Long courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return attendanceService.findByCourseAndDate(courseId, date);
    }

    @GetMapping("/student/{studentId}/course/{courseId}/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER') or (hasRole('STUDENT') and @authService.isCurrentStudent(#studentId, authentication))")
    public AttendanceSummary summary(@PathVariable Long studentId, @PathVariable Long courseId) {
        return attendanceService.summarize(studentId, courseId);
    }
}
