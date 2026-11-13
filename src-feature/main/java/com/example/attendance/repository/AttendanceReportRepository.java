package com.example.attendance.repository;

import com.example.attendance.model.AttendanceRecord;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

/**
 * Read-only queries used by attendance reports. Kept separate from
 * AttendanceRecordRepository so the reporting feature adds files without editing existing ones.
 */
public interface AttendanceReportRepository extends Repository<AttendanceRecord, Long> {

    interface CourseAttendanceRow {
        Long getStudentId();

        String getRollNumber();

        String getName();

        Long getTotal();

        Long getAttended();
    }

    /** One row per student who has at least one record in the course. PRESENT and LATE count as attended. */
    @Query("""
            select r.student.id as studentId,
                   r.student.rollNumber as rollNumber,
                   r.student.name as name,
                   count(r) as total,
                   sum(case when r.status in (com.example.attendance.model.AttendanceStatus.PRESENT,
                                              com.example.attendance.model.AttendanceStatus.LATE)
                            then 1 else 0 end) as attended
            from AttendanceRecord r
            where r.course.id = :courseId
            group by r.student.id, r.student.rollNumber, r.student.name
            """)
    List<CourseAttendanceRow> summarizeByCourse(@Param("courseId") Long courseId);
}
