# Release Notes — Known Gaps, Deviations and Verification Status

**Applies to build SHA:** `[TBD]`  
**Verification status:** Pending current source and runtime review.

## Areas that must be checked against the SRS

| Area | SRS reference | Current evidence status |
|---|---|---|
| Authentication and role-based access | SAMS-F-001, F-002; SAMS-SR-002 to SR-004, SR-006 | Not verified from the repository screenshot. |
| User account lifecycle | SAMS-F-003 | Not verified. |
| Courses, sections, faculty assignment and enrollment | SAMS-F-004, F-005 | Not verified. |
| Attendance sessions and roster | SAMS-F-006, F-007 | Not verified. |
| Four attendance statuses and duplicate prevention | SAMS-F-008, F-009 | Not verified in the running build. |
| Controlled corrections and audit trail | SAMS-F-010, F-018; SAMS-SR-005 | Not verified. |
| Percentage calculation and student view | SAMS-F-011, F-012 | Mentioned in the README project description; correctness/access control not runtime-verified. |
| Reports, shortage list, CSV/PDF export and notifications | SAMS-F-013 to F-017 | Not verified. |
| Performance, availability, accessibility, backup/restore and integrity | SAMS-NF-001 to NF-006 | No test reports supplied. |
| TLS, password hashing, authorization, session/CSRF and login throttling | SAMS-SR-001 to SR-006 | No security evidence supplied. |

## Deviations

Record each requirement not delivered in the current build, the reason, owner, impact, mitigation and whether the evaluator has accepted the deviation. Do not silently remove an SRS requirement from the coverage matrix.

## Publication gate

Release notes must describe only the exact release build. Attach the build SHA, test run date, passing test IDs and known defects. A repository description or Jira status alone is not proof of implementation.
