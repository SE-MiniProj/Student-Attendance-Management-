# Administrator User Guide — Courses and Attendance Operations

## 1. Course, section and faculty assignment

The SRS requires administrators to manage courses, sections, semesters and faculty assignments (SAMS-F-004), and enroll/remove students in sections (SAMS-F-005).

Use only the course/section/assignment screens or API routes actually present in the current build. Record their exact paths after verification:

- Create/edit course: `[TBD]`
- Create/edit section and semester: `[TBD]`
- Assign faculty to a section: `[TBD]`
- Enroll/remove student: `[TBD]`

## 2. Attendance and reports

The SRS describes administrator access to authorized class summaries, student details, shortage lists, filtered reports, exports and audit records (SAMS-F-013 to SAMS-F-018). For each function, add the verified route/screen and a screenshot or test evidence link:

- Class summary: `[TBD]`
- Shortage list/threshold configuration: `[TBD]`
- Filtered report: `[TBD]`
- CSV/PDF export: `[TBD]`
- Audit log review: `[TBD]`

## 3. Important safeguards

- Do not assign faculty to invalid or duplicate sections.
- Confirm a student is enrolled before attendance is recorded.
- Restrict reports and exports to authorized scopes.
- Require a reason for attendance corrections and verify the audit trail.
- Do not change the attendance threshold without recording the authorized change.

## 4. Build verification

The repository screenshot confirms a Spring Boot REST API project and its broad purpose, but not the detailed route list above. Complete all `[TBD]` fields from the current source and running application before publishing this guide.
