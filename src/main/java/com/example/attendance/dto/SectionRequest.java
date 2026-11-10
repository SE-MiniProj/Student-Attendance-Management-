package com.example.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SectionRequest(
        @NotNull Long courseId,
        @NotNull Long teacherId,
        @NotNull Long semesterId,
        @NotBlank String sectionName,
        String room,
        Integer capacity
) {
}
