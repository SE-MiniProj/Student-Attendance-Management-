package com.example.attendance.service;

import com.example.attendance.dto.BulkEnrollResult;
import com.example.attendance.dto.EnrollmentResponse;
import com.example.attendance.exception.DuplicateResourceException;
import com.example.attendance.exception.ResourceNotFoundException;
import com.example.attendance.model.Enrollment;
import com.example.attendance.model.EnrollmentStatus;
import com.example.attendance.model.Role;
import com.example.attendance.model.Section;
import com.example.attendance.model.User;
import com.example.attendance.repository.EnrollmentRepository;
import com.example.attendance.repository.SectionRepository;
import com.example.attendance.repository.UserRepository;
import com.opencsv.CSVReader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final SectionRepository sectionRepository;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             UserRepository userRepository,
                             SectionRepository sectionRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.sectionRepository = sectionRepository;
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponse> findBySectionId(Long sectionId) {
        if (!sectionRepository.existsById(sectionId)) {
            throw new ResourceNotFoundException("Section not found: " + sectionId);
        }
        return enrollmentRepository.findBySectionId(sectionId).stream()
                .map(EnrollmentResponse::from)
                .toList();
    }

    @Transactional
    public EnrollmentResponse enroll(Long studentId, Long sectionId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

        if (student.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("User must have STUDENT role");
        }

        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + sectionId));

        if (enrollmentRepository.existsByStudentIdAndSectionId(studentId, sectionId)) {
            throw new DuplicateResourceException("Student is already enrolled in this section");
        }

        Enrollment enrollment = new Enrollment(student, section, EnrollmentStatus.ACTIVE);
        return EnrollmentResponse.from(enrollmentRepository.save(enrollment));
    }

    @Transactional
    public void removeEnrollment(Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: " + enrollmentId));
        enrollmentRepository.delete(enrollment);
    }

    @Transactional
    public BulkEnrollResult bulkEnroll(MultipartFile csvFile, Long defaultSectionId) {
        int enrolled = 0;
        int skipped = 0;
        List<String> errors = new ArrayList<>();

        try (Reader reader = new InputStreamReader(csvFile.getInputStream(), StandardCharsets.UTF_8);
             CSVReader csvReader = new CSVReader(reader)) {

            String[] line;
            int lineNumber = 0;

            while ((line = csvReader.readNext()) != null) {
                lineNumber++;
                if (line.length == 0 || (line.length == 1 && line[0].trim().isEmpty())) {
                    continue;
                }

                String firstCol = line[0].trim();
                // Skip header line if present
                if (firstCol.equalsIgnoreCase("rollNumber") || firstCol.equalsIgnoreCase("roll_number")) {
                    continue;
                }

                String rollNumber = firstCol;
                Long sectionId = null;

                if (line.length > 1 && !line[1].trim().isEmpty()) {
                    try {
                        sectionId = Long.parseLong(line[1].trim());
                    } catch (NumberFormatException nfe) {
                        errors.add("Line " + lineNumber + ": Invalid sectionId '" + line[1] + "'");
                        continue;
                    }
                } else if (defaultSectionId != null) {
                    sectionId = defaultSectionId;
                } else {
                    errors.add("Line " + lineNumber + ": Missing sectionId for roll number " + rollNumber);
                    continue;
                }

                User student = userRepository.findByRollNumber(rollNumber).orElse(null);
                if (student == null) {
                    errors.add("Line " + lineNumber + ": Student not found with roll number " + rollNumber);
                    continue;
                }

                if (student.getRole() != Role.STUDENT) {
                    errors.add("Line " + lineNumber + ": User with roll number " + rollNumber + " is not a STUDENT");
                    continue;
                }

                Section section = sectionRepository.findById(sectionId).orElse(null);
                if (section == null) {
                    errors.add("Line " + lineNumber + ": Section not found with id " + sectionId);
                    continue;
                }

                if (enrollmentRepository.existsByStudentIdAndSectionId(student.getId(), section.getId())) {
                    skipped++;
                } else {
                    enrollmentRepository.save(new Enrollment(student, section, EnrollmentStatus.ACTIVE));
                    enrolled++;
                }
            }

        } catch (Exception e) {
            errors.add("Failed to process CSV file: " + e.getMessage());
        }

        return new BulkEnrollResult(enrolled, skipped, errors);
    }

    @Transactional
    public void bulkRemove(List<Long> studentIds, Long sectionId) {
        if (!sectionRepository.existsById(sectionId)) {
            throw new ResourceNotFoundException("Section not found: " + sectionId);
        }

        for (Long studentId : studentIds) {
            enrollmentRepository.deleteByStudentIdAndSectionId(studentId, sectionId);
        }
    }
}
