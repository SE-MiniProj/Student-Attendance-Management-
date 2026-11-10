package com.example.attendance.service;

import com.example.attendance.dto.SemesterRequest;
import com.example.attendance.exception.DuplicateResourceException;
import com.example.attendance.exception.ResourceNotFoundException;
import com.example.attendance.model.Semester;
import com.example.attendance.repository.SemesterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SemesterService {

    private final SemesterRepository semesterRepository;

    public SemesterService(SemesterRepository semesterRepository) {
        this.semesterRepository = semesterRepository;
    }

    @Transactional(readOnly = true)
    public List<Semester> findAll() {
        return semesterRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Semester findById(Long id) {
        return semesterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found: " + id));
    }

    @Transactional
    public Semester create(SemesterRequest request) {
        if (semesterRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Semester name already exists: " + request.name());
        }

        Semester semester = new Semester(request.name(), request.startDate(), request.endDate(), true);
        return semesterRepository.save(semester);
    }

    @Transactional
    public Semester update(Long id, SemesterRequest request) {
        Semester semester = findById(id);

        if (!semester.getName().equalsIgnoreCase(request.name())
                && semesterRepository.existsByName(request.name())) {
            throw new DuplicateResourceException("Semester name already exists: " + request.name());
        }

        semester.setName(request.name());
        semester.setStartDate(request.startDate());
        semester.setEndDate(request.endDate());

        return semesterRepository.save(semester);
    }

    @Transactional
    public Semester activate(Long id) {
        Semester semester = findById(id);
        semester.setActive(true);
        return semesterRepository.save(semester);
    }

    @Transactional
    public Semester deactivate(Long id) {
        Semester semester = findById(id);
        semester.setActive(false);
        return semesterRepository.save(semester);
    }
}
