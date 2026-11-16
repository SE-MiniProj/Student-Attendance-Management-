# Student User Guide — Getting Started

## 1. Purpose

This guide describes the student workflow required by the SAMS SRS. The repository screenshot identifies the project as a Spring Boot REST API for student, course and daily attendance information, including per-student attendance percentages. The screenshot does **not** show the exact endpoint paths, a student dashboard, or a login flow, so those details are deliberately not invented here.

## 2. What you need

- The application URL and API base path confirmed by the project team.
- Your student identifier and the relevant course/section identifier.
- An approved API client or user interface actually included in the current build.
- A test account only if authentication is implemented and enabled in the current build.

## 3. Current-build boundary

The SRS requires students to view only their own course-wise attendance percentage and attendance history (SAMS-F-012), with role/object-level access control (SAMS-F-002 and SAMS-SR-003). The repository screenshot alone does not prove that a student login or role-specific portal is implemented. Confirm the feature in the current source and running build before using real student information.

## 4. Student workflow

1. Obtain the correct student ID and course/section from the authorized faculty member or administrator.
2. Open the attendance history feature exposed by the current build. Record the exact route or screen name in this guide after verifying it.
3. Select the relevant course/section and review the returned attendance records.
4. Open the attendance summary feature and compare the percentage with the underlying records.
5. Report missing or incorrect entries to faculty/admin with the course, date and expected status.
6. Do not attempt to modify attendance records unless the application explicitly provides an authorized student action (the SRS assigns corrections to Faculty/Admin).

## 5. Privacy and support

Do not access or share another student's attendance. If another student's information is visible in your session, stop and report it as a possible access-control defect. Never include passwords, tokens or private student details in screenshots or support messages.

**Build verification fields:** student home screen/route `[TBD]`; attendance history screen/route `[TBD]`; summary screen/route `[TBD]`; verified build SHA `[TBD]`.
