package com.example.attendance.service;

import com.example.attendance.dto.SectionRequest;
import com.example.attendance.dto.SectionResponse;
import com.example.attendance.exception.ResourceNotFoundException;
import com.example.attendance.model.Course;
import com.example.attendance.model.Role;
import com.example.attendance.model.Section;
import com.example.attendance.model.Semester;
import com.example.attendance.model.User;
import com.example.attendance.repository.CourseRepository;
import com.example.attendance.repository.SectionRepository;
import com.example.attendance.repository.SemesterRepository;
import com.example.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SectionService {

    private final SectionRepository sectionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final SemesterRepository semesterRepository;

    public SectionService(SectionRepository sectionRepository,
                          CourseRepository courseRepository,
                          UserRepository userRepository,
                          SemesterRepository semesterRepository) {
        this.sectionRepository = sectionRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.semesterRepository = semesterRepository;
    }

    @Transactional(readOnly = true)
    public List<SectionResponse> findAll(Long semesterId, Long courseId) {
        List<Section> sections;
        if (semesterId != null && courseId != null) {
            sections = sectionRepository.findBySemesterIdAndCourseId(semesterId, courseId);
        } else if (semesterId != null) {
            sections = sectionRepository.findBySemesterId(semesterId);
        } else if (courseId != null) {
            sections = sectionRepository.findByCourseId(courseId);
        } else {
            sections = sectionRepository.findAll();
        }
        return sections.stream()
                .map(SectionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public SectionResponse findById(Long id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + id));
        return SectionResponse.from(section);
    }

    @Transactional
    public SectionResponse create(SectionRequest request) {
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + request.courseId()));

        User teacher = userRepository.findById(request.teacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + request.teacherId()));

        if (teacher.getRole() != Role.TEACHER) {
            throw new IllegalArgumentException("User must have TEACHER role");
        }

        Semester semester = semesterRepository.findById(request.semesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found: " + request.semesterId()));

        Section section = new Section(
                course,
                teacher,
                semester,
                request.sectionName(),
                request.room(),
                request.capacity()
        );

        return SectionResponse.from(sectionRepository.save(section));
    }

    @Transactional
    public SectionResponse update(Long id, SectionRequest request) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + id));

        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + request.courseId()));

        User teacher = userRepository.findById(request.teacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + request.teacherId()));

        if (teacher.getRole() != Role.TEACHER) {
            throw new IllegalArgumentException("User must have TEACHER role");
        }

        Semester semester = semesterRepository.findById(request.semesterId())
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found: " + request.semesterId()));

        section.setCourse(course);
        section.setTeacher(teacher);
        section.setSemester(semester);
        section.setSectionName(request.sectionName());
        section.setRoom(request.room());
        section.setCapacity(request.capacity());

        return SectionResponse.from(sectionRepository.save(section));
    }

    @Transactional
    public void delete(Long id) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + id));
        sectionRepository.delete(section);
    }

    @Transactional
    public SectionResponse assignFaculty(Long id, Long teacherId) {
        Section section = sectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + id));

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + teacherId));

        if (teacher.getRole() != Role.TEACHER) {
            throw new IllegalArgumentException("User must have TEACHER role");
        }

        section.setTeacher(teacher);
        return SectionResponse.from(sectionRepository.save(section));
    }
}
