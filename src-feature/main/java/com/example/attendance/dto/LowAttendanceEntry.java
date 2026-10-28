package com.example.attendance.dto;

public record LowAttendanceEntry(
        Long studentId,
        String rollNumber,
        String name,
        long totalClasses,
        long attended,
        double percentage
) {
}
