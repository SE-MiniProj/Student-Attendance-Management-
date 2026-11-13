package com.example.attendance.dto;

import com.example.attendance.model.Section;

public record SectionResponse(
        Long id,
        Long courseId,
        String courseCode,
        String courseName,
        Long teacherId,
        String teacherName,
        Long semesterId,
        String semesterName,
        String sectionName,
        String room,
        Integer capacity
) {
    public static SectionResponse from(Section section) {
        if (section == null) {
            return null;
        }
        return new SectionResponse(
                section.getId(),
                section.getCourse() != null ? section.getCourse().getId() : null,
                section.getCourse() != null ? section.getCourse().getCode() : null,
                section.getCourse() != null ? section.getCourse().getName() : null,
                section.getTeacher() != null ? section.getTeacher().getId() : null,
                section.getTeacher() != null ? section.getTeacher().getFullName() : null,
                section.getSemester() != null ? section.getSemester().getId() : null,
                section.getSemester() != null ? section.getSemester().getName() : null,
                section.getSectionName(),
                section.getRoom(),
                section.getCapacity()
        );
    }
}
