package com.example.attendance.service;

import com.example.attendance.dto.CourseRequest;
import com.example.attendance.exception.DuplicateResourceException;
import com.example.attendance.exception.ResourceNotFoundException;
import com.example.attendance.model.Course;
import com.example.attendance.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Transactional
    public Course create(CourseRequest request) {
        if (courseRepository.existsByCode(request.code())) {
            throw new DuplicateResourceException("Course code already exists: " + request.code());
        }

        int credits = (request.credits() != null && request.credits() > 0) ? request.credits() : 4;
        Course course = new Course(request.code(), request.name(), request.description(), credits);
        return courseRepository.save(course);
    }

    @Transactional(readOnly = true)
    public List<Course> findAll() {
        return courseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Course findById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + id));
    }

    @Transactional
    public Course update(Long id, CourseRequest request) {
        Course course = findById(id);

        if (!course.getCode().equalsIgnoreCase(request.code())
                && courseRepository.existsByCode(request.code())) {
            throw new DuplicateResourceException("Course code already exists: " + request.code());
        }

        course.setCode(request.code());
        course.setName(request.name());
        if (request.description() != null) {
            course.setDescription(request.description());
        }
        if (request.credits() != null && request.credits() > 0) {
            course.setCredits(request.credits());
        }

        return courseRepository.save(course);
    }

    @Transactional
    public void delete(Long id) {
        Course course = findById(id);
        courseRepository.delete(course);
    }
}
