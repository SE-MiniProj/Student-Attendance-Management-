package com.example.attendance.service;

import com.example.attendance.dto.RegisterRequest;
import com.example.attendance.dto.UpdateUserRequest;
import com.example.attendance.dto.UserResponse;
import com.example.attendance.exception.DuplicateResourceException;
import com.example.attendance.exception.ResourceNotFoundException;
import com.example.attendance.model.Role;
import com.example.attendance.model.User;
import com.example.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;

    public UserService(UserRepository userRepository, AuthService authService) {
        this.userRepository = userRepository;
        this.authService = authService;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAllByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return userRepository.findById(id)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Transactional
    public UserResponse create(RegisterRequest request) {
        User user = authService.register(request);
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (!user.getEmail().equalsIgnoreCase(request.email())
                && userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already exists: " + request.email());
        }

        user.setFullName(request.fullName());
        user.setEmail(request.email());

        if (user.getRole() == Role.STUDENT && request.rollNumber() != null && !request.rollNumber().trim().isEmpty()) {
            String newRoll = request.rollNumber().trim();
            if (!newRoll.equalsIgnoreCase(user.getRollNumber())
                    && userRepository.existsByRollNumber(newRoll)) {
                throw new DuplicateResourceException("Roll number already exists: " + newRoll);
            }
            user.setRollNumber(newRoll);
        }

        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse activate(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setActive(true);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserResponse deactivate(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setActive(false);
        return UserResponse.from(userRepository.save(user));
    }
}
