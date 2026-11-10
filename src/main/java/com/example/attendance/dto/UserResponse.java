package com.example.attendance.dto;

import com.example.attendance.model.Role;
import com.example.attendance.model.User;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        Role role,
        String rollNumber,
        boolean active
) {
    public static UserResponse from(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getRollNumber(),
                user.isActive()
        );
    }
}
