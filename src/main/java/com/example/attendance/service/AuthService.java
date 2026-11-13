package com.example.attendance.service;

import com.example.attendance.dto.LoginRequest;
import com.example.attendance.dto.LoginResponse;
import com.example.attendance.dto.RegisterRequest;
import com.example.attendance.exception.DuplicateResourceException;
import com.example.attendance.model.Role;
import com.example.attendance.model.Student;
import com.example.attendance.model.User;
import com.example.attendance.repository.StudentRepository;
import com.example.attendance.repository.UserRepository;
import com.example.attendance.security.JwtUtil;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isActive()) {
            throw new AccessDeniedException("Account is deactivated");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user);
        return new LoginResponse(token, user.getRole().name(), user.getId(), user.getFullName());
    }

    @Transactional
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already exists: " + request.email());
        }

        if (request.role() == Role.STUDENT) {
            if (request.rollNumber() == null || request.rollNumber().trim().isEmpty()) {
                throw new IllegalArgumentException("Roll number is required for students");
            }
            if (userRepository.existsByRollNumber(request.rollNumber().trim())) {
                throw new DuplicateResourceException("Roll number already exists: " + request.rollNumber());
            }
        }

        String rollNumber = request.role() == Role.STUDENT ? request.rollNumber().trim() : null;
        String hashedPassword = passwordEncoder.encode(request.password());

        User user = new User(
                request.email(),
                hashedPassword,
                request.fullName(),
                request.role(),
                rollNumber,
                true
        );

        User saved = userRepository.save(user);

        // Keep Student table synchronized for STUDENT role
        if (saved.getRole() == Role.STUDENT && saved.getRollNumber() != null) {
            if (!studentRepository.existsByRollNumber(saved.getRollNumber())) {
                studentRepository.save(new Student(saved.getRollNumber(), saved.getFullName(), saved.getEmail()));
            }
        }

        return saved;
    }

    public boolean isCurrentStudent(Long studentId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return false;
        }

        if (user.getRole() == Role.ADMIN || user.getRole() == Role.TEACHER) {
            return true;
        }

        if (user.getId().equals(studentId)) {
            return true;
        }

        Student student = studentRepository.findById(studentId).orElse(null);
        if (student != null) {
            if (student.getEmail() != null && student.getEmail().equalsIgnoreCase(user.getEmail())) {
                return true;
            }
            if (student.getRollNumber() != null && student.getRollNumber().equals(user.getRollNumber())) {
                return true;
            }
        }

        return false;
    }
}
