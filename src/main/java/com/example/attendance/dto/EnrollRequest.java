package com.example.attendance.dto;

import jakarta.validation.constraints.NotNull;

public record EnrollRequest(
        @NotNull Long studentId,
        @NotNull Long sectionId
) {
}
