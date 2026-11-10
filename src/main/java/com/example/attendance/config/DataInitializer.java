package com.example.attendance.config;

import com.example.attendance.model.Course;
import com.example.attendance.model.Role;
import com.example.attendance.model.Section;
import com.example.attendance.model.Semester;
import com.example.attendance.model.Student;
import com.example.attendance.model.User;
import com.example.attendance.repository.CourseRepository;
import com.example.attendance.repository.SectionRepository;
import com.example.attendance.repository.SemesterRepository;
import com.example.attendance.repository.StudentRepository;
import com.example.attendance.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final SemesterRepository semesterRepository;
    private final SectionRepository sectionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           StudentRepository studentRepository,
                           CourseRepository courseRepository,
                           SemesterRepository semesterRepository,
                           SectionRepository sectionRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.semesterRepository = semesterRepository;
        this.sectionRepository = sectionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            // 1. Admin
            User admin = new User(
                    "admin@college.edu",
                    passwordEncoder.encode("Admin@123"),
                    "System Admin",
                    Role.ADMIN,
                    null,
                    true
            );
            userRepository.save(admin);

            // 2. Teacher
            User teacher = new User(
                    "teacher@college.edu",
                    passwordEncoder.encode("Teacher@123"),
                    "Dr. Smith",
                    Role.TEACHER,
                    null,
                    true
            );
            teacher = userRepository.save(teacher);

            // 3. Student
            User student = new User(
                    "student@college.edu",
                    passwordEncoder.encode("Student@123"),
                    "John Doe",
                    Role.STUDENT,
                    "CS2024001",
                    true
            );
            student = userRepository.save(student);

            // Populate Student table for compatibility with existing endpoints
            if (!studentRepository.existsByRollNumber("CS2024001")) {
                studentRepository.save(new Student("CS2024001", "John Doe", "student@college.edu"));
            }

            // 4. Default Semester
            Semester semester = semesterRepository.findByName("2026-ODD").orElseGet(() ->
                    semesterRepository.save(new Semester("2026-ODD", "2026-08-01", "2026-12-15", true))
            );

            // 5. Default Course
            Course course = courseRepository.findAll().stream()
                    .filter(c -> "CS101".equalsIgnoreCase(c.getCode()))
                    .findFirst()
                    .orElseGet(() -> courseRepository.save(
                            new Course("CS101", "Introduction to Computer Science", "Basic CS principles", 4)
                    ));

            // 6. Default Section
            if (sectionRepository.count() == 0) {
                Section section = new Section(course, teacher, semester, "A", "Room 101", 60);
                sectionRepository.save(section);
            }
        }
    }
}
