package com.example.attendance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

/**
 * A student whose attendance is low, with the raw counts and the derived percentage.
 *
 * <p>The percentage is computed from {@code attended} and {@code totalClasses}
 * so it can never be out of sync with them.</p>
 */
public record LowAttendanceEntry(
        Long studentId,
        String rollNumber,
        String name,
        long totalClasses,
        long attended
) {

    public LowAttendanceEntry {
        Objects.requireNonNull(studentId, "studentId must not be null");
        Objects.requireNonNull(rollNumber, "rollNumber must not be null");
        Objects.requireNonNull(name, "name must not be null");
        if (totalClasses < 0) {
            throw new IllegalArgumentException("totalClasses must not be negative: " + totalClasses);
        }
        if (attended < 0 || attended > totalClasses) {
            throw new IllegalArgumentException(
                    "attended must be between 0 and totalClasses (" + totalClasses + "): " + attended);
        }
    }

    /** Attendance percentage rounded to 2 decimals; 0.0 when no classes have been held. */
    @JsonProperty("percentage")
    public double percentage() {
        if (totalClasses == 0) {
            return 0.0;
        }
        double raw = (attended * 100.0) / totalClasses;
        return Math.round(raw * 100.0) / 100.0;
    }

    /** Number of classes the student missed. */
    @JsonProperty("absent")
    public long absent() {
        return totalClasses - attended;
    }

    /** True if attendance is strictly below the given threshold (e.g. 75.0). */
    public boolean isBelow(double thresholdPercentage) {
        return percentage() < thresholdPercentage;
    }
}
