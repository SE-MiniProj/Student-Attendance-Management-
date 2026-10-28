package com.example.attendance.service;

import com.example.attendance.dto.LowAttendanceEntry;
import com.example.attendance.repository.AttendanceReportRepository;
import com.example.attendance.repository.AttendanceReportRepository.CourseAttendanceRow;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceReportServiceTest {

    @Mock
    private AttendanceReportRepository reportRepository;

    @Mock
    private CourseService courseService;

    @InjectMocks
    private AttendanceReportService service;

    private record Row(Long studentId, String rollNumber, String name, Long total, Long attended)
            implements CourseAttendanceRow {
        public Long getStudentId() { return studentId; }
        public String getRollNumber() { return rollNumber; }
        public String getName() { return name; }
        public Long getTotal() { return total; }
        public Long getAttended() { return attended; }
    }

    @Test
    void returnsOnlyStudentsBelowThresholdLowestFirst() {
        when(reportRepository.summarizeByCourse(1L)).thenReturn(List.of(
                new Row(1L, "CS001", "Asha", 10L, 9L),   // 90.0
                new Row(2L, "CS002", "Ravi", 8L, 5L),    // 62.5
                new Row(3L, "CS003", "Meera", 10L, 5L)   // 50.0
        ));

        List<LowAttendanceEntry> result = service.lowAttendance(1L, 75);

        assertEquals(2, result.size());
        assertEquals("CS003", result.get(0).rollNumber());
        assertEquals(50.0, result.get(0).percentage());
        assertEquals("CS002", result.get(1).rollNumber());
        assertEquals(62.5, result.get(1).percentage());
    }

    @Test
    void studentExactlyAtThresholdIsNotReported() {
        when(reportRepository.summarizeByCourse(1L)).thenReturn(List.of(
                new Row(1L, "CS001", "Asha", 4L, 3L)     // 75.0
        ));

        assertEquals(0, service.lowAttendance(1L, 75).size());
    }

    @Test
    void rejectsThresholdOutsideZeroToHundred() {
        assertThrows(ResponseStatusException.class, () -> service.lowAttendance(1L, 101));
        assertThrows(ResponseStatusException.class, () -> service.lowAttendance(1L, -1));
    }
}
