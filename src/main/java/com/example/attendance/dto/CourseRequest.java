package com.example.attendance.dto;

import jakarta.validation.constraints.NotBlank;

public record CourseRequest(
        @NotBlank String code,
        @NotBlank String name,
        String description,
        Integer credits
) {
    public CourseRequest(String code, String name) {
        this(code, name, null, 4);
    }
}
