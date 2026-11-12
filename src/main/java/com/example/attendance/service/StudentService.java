package com.example.attendance.service;

import com.example.attendance.dto.StudentRequest;
import com.example.attendance.exception.DuplicateResourceException;
import com.example.attendance.exception.ResourceNotFoundException;
import com.example.attendance.model.Student;
import com.example.attendance.model.User;
import com.example.attendance.repository.StudentRepository;
import com.example.attendance.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public StudentService(StudentRepository studentRepository, UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Student create(StudentRequest request) {
        if (studentRepository.existsByRollNumber(request.rollNumber())) {
            throw new DuplicateResourceException("Roll number already exists: " + request.rollNumber());
        }
        if (studentRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already exists: " + request.email());
        }
        return studentRepository.save(new Student(request.rollNumber(), request.name(), request.email()));
    }

    @Transactional(readOnly = true)
    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    /**
     * The Student record that belongs to a signed-in student account. Attendance is
     * keyed by Student id, which differs from the User id, so clients need this link.
     * Matched by roll number (set when the account is registered), then by email.
     */
    @Transactional(readOnly = true)
    public Student findForUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        if (user.getRollNumber() != null) {
            Student byRoll = studentRepository.findByRollNumber(user.getRollNumber()).orElse(null);
            if (byRoll != null) {
                return byRoll;
            }
        }
        return studentRepository.findByEmailIgnoreCase(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No student record for: " + email));
    }

    @Transactional(readOnly = true)
    public Student findById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + id));
    }

    @Transactional
    public Student update(Long id, StudentRequest request) {
        Student student = findById(id);
        student.setRollNumber(request.rollNumber());
        student.setName(request.name());
        student.setEmail(request.email());
        return studentRepository.save(student);
    }

    @Transactional
    public void delete(Long id) {
        studentRepository.delete(findById(id));
    }
}
