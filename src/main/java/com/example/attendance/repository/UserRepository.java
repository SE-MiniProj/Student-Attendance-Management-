package com.example.attendance.repository;

import com.example.attendance.model.Role;
import com.example.attendance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByRollNumber(String rollNumber);

    List<User> findByRole(Role role);

    boolean existsByEmail(String email);

    boolean existsByRollNumber(String rollNumber);
}
