package com.example.attendance.dto;

public record LoginResponse(
        String token,
        String role,
        Long userId,
        String fullName
) {
}
