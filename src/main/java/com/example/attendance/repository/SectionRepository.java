package com.example.attendance.repository;

import com.example.attendance.model.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SectionRepository extends JpaRepository<Section, Long> {

    List<Section> findByCourseId(Long courseId);

    List<Section> findByTeacherId(Long teacherId);

    List<Section> findBySemesterId(Long semesterId);

    List<Section> findBySemesterIdAndCourseId(Long semesterId, Long courseId);
}
