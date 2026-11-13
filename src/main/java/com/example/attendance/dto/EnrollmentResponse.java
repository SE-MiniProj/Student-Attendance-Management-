package com.example.attendance.dto;

import com.example.attendance.model.Enrollment;
import com.example.attendance.model.EnrollmentStatus;

public record EnrollmentResponse(
        Long id,
        Long studentId,
        String studentName,
        String rollNumber,
        Long sectionId,
        String sectionName,
        EnrollmentStatus status
) {
    public static EnrollmentResponse from(Enrollment enrollment) {
        if (enrollment == null) {
            return null;
        }
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getStudent() != null ? enrollment.getStudent().getId() : null,
                enrollment.getStudent() != null ? enrollment.getStudent().getFullName() : null,
                enrollment.getStudent() != null ? enrollment.getStudent().getRollNumber() : null,
                enrollment.getSection() != null ? enrollment.getSection().getId() : null,
                enrollment.getSection() != null ? enrollment.getSection().getSectionName() : null,
                enrollment.getStatus()
        );
    }
}
