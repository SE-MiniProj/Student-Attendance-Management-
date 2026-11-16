# Risk Register — Product and Data Risks

**Scale:** Probability and impact are Low / Medium / High. Ratings are initial assessments for team review, not measured project statistics. Owners are intentionally left as `[TBD]` until assigned.

| ID | Risk | Probability | Impact | Mitigation / response | Owner | Trigger / evidence |
|---|---|---|---|---|---|---|
| R-01 | Unauthorized users can access or alter attendance data if authentication/RBAC is incomplete. | Medium | High | Verify server-side authorization for every protected endpoint; test Student/Faculty/Admin positive and negative cases; block release on critical access-control defects. | [TBD] | Any user retrieves another student's data or invokes an unauthorized mutation. |
| R-02 | Incorrect or duplicate attendance entries lead to wrong percentages. | Medium | High | Enforce unique student/course/session-or-date constraints; validate IDs/statuses; test duplicate requests and percentage calculations with known data. | [TBD] | Duplicate record or a percentage differs from the test oracle. |
| R-03 | Attendance corrections lack reason/history, making disputes hard to resolve. | Medium | High | Require correction reason and preserve old/new values, actor and timestamp; verify audit records before accepting correction workflow. | [TBD] | A correction occurs without a complete audit entry. |
| R-04 | Student enrollment or faculty assignment is not checked before attendance marking. | Medium | High | Validate enrollment and assigned-section authorization server-side; test enrolled and non-enrolled cases. | [TBD] | Attendance is accepted for an unassigned faculty member or non-enrolled student. |
| R-05 | Attendance status treatment is inconsistent with the agreed percentage formula. | Medium | High | Document the calculation rule; use test datasets covering PRESENT, ABSENT, LATE and EXCUSED; reconcile UI/API summary with raw records. | [TBD] | Summary disagrees with expected calculation or policy. |
| R-06 | Attendance/audit data is lost or reset due to environment/database configuration. | Medium | High | Confirm the active database profile; do not use volatile in-memory data for persistent UAT; create and restore verified backups. | [TBD] | Data disappears after restart or restore test fails. |
| R-07 | Reports expose data outside the requesting user's authorized scope. | Medium | High | Test report filters and role/object scoping; review exports for unauthorized records and sensitive fields. | [TBD] | Report/export includes records from an unauthorized course/student. |
