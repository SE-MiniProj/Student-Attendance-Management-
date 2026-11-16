# Student User Guide — View Attendance and Percentage

## 1. View course attendance history

Use the attendance-history function exposed by the current build.

- Screen or API route: `[TBD — copy the exact route from the current controller/API documentation]`
- Required inputs: student ID and course/section ID, as applicable.
- Expected result: attendance records for the authenticated student and selected course.

Do not substitute an arbitrary student ID. The SRS requires students to view only their own details (SAMS-F-012).

## 2. View attendance summary

Use the attendance-summary function exposed by the current build.

- Screen or API route: `[TBD — verify in source and runtime]`
- Expected result: attended classes, total counted classes and attendance percentage for the student/course (SAMS-F-011).

## 3. Attendance statuses

The SRS defines `Present`, `Absent`, `Late` and `Excused` as the attendance statuses that Faculty may record (SAMS-F-008). Confirm the exact casing and calculation treatment in the implemented build before interpreting a percentage.

## 4. Troubleshooting

| Symptom | What to check |
|---|---|
| No records returned | Confirm the student and course IDs; ask faculty/admin whether attendance has been recorded. |
| Another student's data appears | Stop immediately and report a possible security/data-scoping defect. |
| Percentage looks unexpected | Compare the source records with the SRS calculation rule and ask faculty/admin to verify the entries. |
| Request rejected | Record the exact response/status and report the input used; do not repeatedly retry a potentially mutating request. |

## 5. Corrections

The SRS permits authorized Faculty/Admin users to correct a saved attendance record with a reason and preserve old/new values, actor and time (SAMS-F-010). Students should report errors rather than edit records themselves.

**Verified route(s), screenshots and build SHA:** `[TBD after testing the current build]`.
