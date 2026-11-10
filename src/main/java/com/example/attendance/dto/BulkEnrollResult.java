package com.example.attendance.dto;

import java.util.List;

public record BulkEnrollResult(
        int enrolled,
        int skipped,
        List<String> errors
) {
}
