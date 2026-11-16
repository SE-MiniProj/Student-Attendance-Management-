# Student Attendance Management System — User FAQ

## 1. What is SAMS?

The repository description identifies it as a Spring Boot REST API for managing students, courses and daily attendance, including per-student attendance percentages.

## 2. Where do I open the application?

Use the base URL supplied by the project team for the environment being used. Do not assume a local or deployed URL without checking the current configuration.

## 3. How does a student view attendance?

Use the student attendance-history and summary feature actually exposed by the current build. Ask the team for the verified screen or API route and the correct student/course identifiers.

## 4. Which attendance statuses are required?

The SRS requires Present, Absent, Late and Excused (SAMS-F-008). Confirm exact values and their percentage calculation treatment in the implemented build.

## 5. Can the same student's attendance be entered twice?

The SRS requires duplicate prevention for the same student and attendance session (SAMS-F-009). Verify the behavior in the current build and follow the approved correction process if a record already exists.

## 6. What if my attendance is incorrect?

Contact the authorized Faculty/Admin user with the course, date/session and expected status. The SRS requires authorized corrections to include a reason and audit history (SAMS-F-010).

## 7. Is login and role-based access available?

The SRS requires authentication and RBAC (SAMS-F-001/F-002). The repository screenshot does not prove these functions are implemented. Check the current build or ask the project team.

## 8. Can reports be exported?

The SRS requires CSV/PDF report export (SAMS-F-016). Confirm which formats are implemented and tested before relying on them.

## 9. Are low-attendance alerts available?

The SRS includes configurable shortage identification and optional notifications (SAMS-F-014/F-017). Ask whether these features are enabled in the current build.

## 10. Is QR/RFID attendance supported?

The SRS treats QR/RFID/smart-card/biometric hardware as an extension, not mandatory current hardware. See the future-work document.

## 11. Who can correct attendance?

The SRS assigns corrections to authorized Faculty/Admin users, not students.

## 12. Where do I report a defect?

Use the team's assigned Jira/GitHub issue process. Include the build SHA, test data identifiers, steps to reproduce and actual/expected result. Do not include passwords or secret tokens.
