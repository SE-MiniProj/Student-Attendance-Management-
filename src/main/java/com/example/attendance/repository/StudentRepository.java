package com.example.attendance.repository;

import com.example.attendance.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByRollNumber(String rollNumber);

    boolean existsByEmail(String email);

    Optional<Student> findByRollNumber(String rollNumber);

    Optional<Student> findByEmailIgnoreCase(String email);
}
