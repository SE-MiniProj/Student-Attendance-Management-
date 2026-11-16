# SAMS Final Documentation Deliverables

This folder contains the 14 documentation deliverables requested for the Student Attendance Management System.

## Important status note

These documents are prepared from the supplied SAMS SRS v1.0, the evaluation checklist, the Jira screenshots shared in the conversation, and the repository README details visible during preparation. They are **documentation drafts for team review**, not evidence that every SRS requirement is implemented or has passed testing.

The current repository was described as a Spring Boot REST API. Therefore, the user guides below describe the documented API workflow rather than inventing dashboard screens. Confirm each endpoint against the current `main` branch and a running build before final submission. Do not claim that an item is delivered merely because it appears in the SRS.

## Documents

| Requested task | Files |
|---|---|
| User guide: student | `user-guides/student/01-getting-started.md`, `02-view-attendance.md` |
| User guide: faculty | `user-guides/faculty/01-mark-attendance.md`, `02-view-register-and-limitations.md` |
| Release notes | `release-notes/01-build-features.md`, `02-known-gaps.md` |
| Backlog status summary | `backlog/01-observed-status.md`, `02-delivered-vs-not-delivered.md` |
| Requirements coverage | `traceability/01-functional-requirements.md`, `02-nonfunctional-requirements.md`, `03-security-requirements.md` |
| Risk register | `risk-register/01-product-risks.md`, `02-delivery-and-operational-risks.md` |
| User guide: admin | `user-guides/admin/01-student-management.md`, `02-course-and-attendance-operations.md` |
| UAT plan | `uat/01-participants-and-dates.md`, `02-execution-and-exit-criteria.md` |
| UAT scenarios | `uat/scenarios/01-scenarios-1-to-4.md`, `02-scenarios-5-to-8.md` |
| UAT sign-off form | `uat/03-sign-off-template.md` |
| Demo script | `demo/01-two-minute-demo-part-1.md`, `02-two-minute-demo-part-2.md` |
| Glossary | `reference/glossary.md` |
| User FAQ | `reference/user-faq.md` |
| Possible future work | `future-work.md` |

## Before submission

1. Verify API routes and request fields against the current code and the running build.
2. Refresh Jira statuses and ticket mappings. The screenshots previously supplied showed Jira items SCRUM-16 to SCRUM-25 as of **4 November 2026**; those statuses may have changed.
3. Replace all `[TBD]` fields with real UAT participants, dates, test evidence and owners.
4. Run UAT before collecting signatures. Never pre-fill a pass result or sign-off.
5. Make the release notes and backlog status reflect the actual merged build, not planned work.

## Source basis

- `Student Attendance Management System — SRS v1.0`, dated 05-09-2026. Functional requirements SAMS-F-001 to SAMS-F-018; non-functional requirements SAMS-NF-001 to SAMS-NF-006; security requirements SAMS-SR-001 to SAMS-SR-006; Section 6 acceptance-test suite.
- `02TheCheckList.pdf`, especially Sprint 2 finalization and testing/QA checklist items.
- Jira backlog screenshot shared in the conversation (observed 04-11-2026).
- Visible repository screenshot/README description: Spring Boot REST API for students, courses, daily attendance and per-student percentages. This description is not a substitute for source/runtime verification.
