package com.example.attendance.service;

import com.example.attendance.dto.LowAttendanceEntry;
import com.example.attendance.repository.AttendanceReportRepository;
import com.example.attendance.repository.AttendanceReportRepository.CourseAttendanceRow;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
public class AttendanceReportService {

    private final AttendanceReportRepository reportRepository;
    private final CourseService courseService;

    public AttendanceReportService(AttendanceReportRepository reportRepository,
                                   CourseService courseService) {
        this.reportRepository = reportRepository;
        this.courseService = courseService;
    }

    /**
     * Students in the course whose attendance percentage is below the threshold,
     * lowest percentage first.
     */
    @Transactional(readOnly = true)
    public List<LowAttendanceEntry> lowAttendance(Long courseId, double threshold) {
        if (threshold < 0 || threshold > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "threshold must be between 0 and 100");
        }
        courseService.findById(courseId);

        return reportRepository.summarizeByCourse(courseId).stream()
                .map(AttendanceReportService::toEntry)
                .filter(entry -> entry.percentage() < threshold)
                .sorted(Comparator.comparingDouble(LowAttendanceEntry::percentage))
                .toList();
    }

    private static LowAttendanceEntry toEntry(CourseAttendanceRow row) {
        long total = row.getTotal() == null ? 0 : row.getTotal();
        long attended = row.getAttended() == null ? 0 : row.getAttended();
        double percentage = total == 0 ? 0.0 : Math.round(attended * 10000.0 / total) / 100.0;
        return new LowAttendanceEntry(
                row.getStudentId(), row.getRollNumber(), row.getName(), total, attended, percentage);
    }
}
