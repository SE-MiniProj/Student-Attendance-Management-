package com.example.attendance.dto;

import jakarta.validation.constraints.NotBlank;

public record SemesterRequest(
        @NotBlank String name,
        @NotBlank String startDate,
        @NotBlank String endDate
) {
}
