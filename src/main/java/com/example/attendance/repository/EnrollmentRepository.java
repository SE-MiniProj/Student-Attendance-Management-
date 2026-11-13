package com.example.attendance.repository;

import com.example.attendance.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    List<Enrollment> findBySectionId(Long sectionId);

    List<Enrollment> findByStudentId(Long studentId);

    Optional<Enrollment> findByStudentIdAndSectionId(Long studentId, Long sectionId);

    boolean existsByStudentIdAndSectionId(Long studentId, Long sectionId);

    void deleteByStudentIdAndSectionId(Long studentId, Long sectionId);
}
