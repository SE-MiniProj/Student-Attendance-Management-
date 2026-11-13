package com.example.attendance.repository;

import com.example.attendance.model.Semester;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SemesterRepository extends JpaRepository<Semester, Long> {

    Optional<Semester> findByName(String name);

    boolean existsByName(String name);
}
