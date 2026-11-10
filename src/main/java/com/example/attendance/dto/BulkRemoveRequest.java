package com.example.attendance.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record BulkRemoveRequest(
        @NotNull List<Long> studentIds,
        @NotNull Long sectionId
) {
}
