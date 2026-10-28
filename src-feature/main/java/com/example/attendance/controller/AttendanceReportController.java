package com.example.attendance.controller;

import com.example.attendance.dto.LowAttendanceEntry;
import com.example.attendance.service.AttendanceReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class AttendanceReportController {

    private final AttendanceReportService reportService;

    public AttendanceReportController(AttendanceReportService reportService) {
        this.reportService = reportService;
    }

    /** GET /api/reports/courses/1/low-attendance?threshold=75 */
    @GetMapping("/courses/{courseId}/low-attendance")
    public List<LowAttendanceEntry> lowAttendance(@PathVariable Long courseId,
                                                  @RequestParam(defaultValue = "75") double threshold) {
        return reportService.lowAttendance(courseId, threshold);
    }
}
