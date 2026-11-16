# Faculty User Guide — Mark Attendance

## 1. Purpose and scope

This guide follows the attendance workflow required by the SRS. The repository screenshot describes a Spring Boot REST API for students, courses and daily attendance, but it does not expose the exact attendance endpoint or prove that a faculty dashboard/session workflow is present. Fill in the route/screen only after checking the current source and running build.

## 2. Before marking attendance

- Confirm the correct course/section and class date.
- Confirm that you are authorized for the selected section.
- Confirm that each student is enrolled in the section (SAMS-F-005).
- Use the statuses defined in the SRS: `Present`, `Absent`, `Late`, or `Excused` (SAMS-F-008).

## 3. Mark attendance

Use the attendance-marking screen or API endpoint implemented by the current build.

- Exact screen/route: `[TBD — verify from the current controller/API documentation]`
- Required fields expected by the SRS: selected session/section, date/time, student identifier and attendance status.
- Expected result: the system saves one attendance status for each rostered student/session and makes the saved value retrievable.

Do not use guessed URLs or field names. Capture one successful test request/response and add it to the final guide once verified.

## 4. Duplicate and correction handling

The SRS requires duplicate prevention for the same student/session (SAMS-F-009). It also requires authorized corrections with a reason and an audit history containing old/new values, actor and time (SAMS-F-010). Follow only the correction workflow implemented and approved by the team.

## 5. Build verification fields

- Faculty login route/screen: `[TBD]`
- Assigned-section selection: `[TBD]`
- Session creation: `[TBD]`
- Roster display: `[TBD]`
- Mark attendance: `[TBD]`
- Correct attendance: `[TBD]`
- Verified build SHA/test evidence: `[TBD]`
