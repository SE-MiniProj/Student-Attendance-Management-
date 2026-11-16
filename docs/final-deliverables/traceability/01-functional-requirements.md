# Requirements Coverage — Functional Requirements

**Source:** SAMS SRS v1.0, Section 4, SAMS-F-001 to SAMS-F-018.  
**Ticket mapping basis:** Jira backlog screenshot supplied in the conversation (observed 04-11-2026). Only SCRUM-16 to SCRUM-25 were visible; later task assignments were not yet made.

| SRS ID | Requirement summary | Known Jira ticket | Delivery evidence / current conclusion |
|---|---|---|---|
| SAMS-F-001 | Authenticate user with valid credentials and create a role-associated session | SCRUM-16 | In Progress in the supplied screenshot; no merged implementation/test evidence supplied. Not confirmed delivered. |
| SAMS-F-002 | Enforce RBAC for Student, Faculty and Administrator | SCRUM-16 | In Progress in the supplied screenshot; no passing authorization test supplied. Not confirmed delivered. |
| SAMS-F-003 | Admin creates/views/updates/activates/deactivates Student and Faculty accounts | SCRUM-18 | In Progress in the supplied screenshot. Not confirmed delivered. |
| SAMS-F-004 | Admin manages courses, sections, semesters and faculty assignments | SCRUM-17 | In Progress in the supplied screenshot. Not confirmed delivered. |
| SAMS-F-005 | Admin enrolls/removes students from sections, including supported bulk import | Not identified | No matching ticket visible in the supplied screenshot. Create/link ticket and implementation evidence. |
| SAMS-F-006 | Faculty creates attendance session for an assigned section | Not identified | No matching ticket visible. Verify session creation and assigned-section authorization. |
| SAMS-F-007 | Display enrolled roster for the selected session | Not identified | No matching ticket visible. Verify active roster and exclusion of non-enrolled students. |
| SAMS-F-008 | Mark each rostered student Present/Absent/Late/Excused | Not identified | No matching ticket visible. Verify all four statuses in the actual build. |
| SAMS-F-009 | Prevent duplicate records for same student and attendance session | Not identified | No matching ticket visible. Verify the exact session-level uniqueness rule and duplicate test. |
| SAMS-F-010 | Authorized Faculty/Admin correct attendance with reason and audit old/new values, actor and time | Not identified | No matching ticket visible. Verify correction route, required reason and audit record. |
| SAMS-F-011 | Calculate attended classes, total counted classes and percentage per student/course | Not identified | No matching delivery ticket visible. Run calculation tests with known data. |
| SAMS-F-012 | Student views own course-wise percentage and session history only | Not identified | No matching ticket visible. Verify history/summary and cross-student access denial. |
| SAMS-F-013 | Faculty/Admin view class summaries and individual details for authorized sections | Not identified | No matching ticket visible. Verify authorized section scoping. |
| SAMS-F-014 | Identify students below a configurable threshold | Not identified | No matching ticket visible. Verify configured threshold and shortage list. |
| SAMS-F-015 | Generate attendance reports filtered by course/section/student/status/date | Not identified | No matching ticket visible. Verify each permitted filter. |
| SAMS-F-016 | Export authorized report in CSV and PDF with timestamp and filters | Not identified | No matching ticket visible. Verify both formats and contents. |
| SAMS-F-017 | Send/queue low-attendance notification when enabled and threshold crossed | Not identified | No matching ticket visible. Verify only if notification feature is enabled in build. |
| SAMS-F-018 | Record audit events for login failures, attendance changes, user management, threshold changes and exports | Not identified | No matching ticket visible. Verify required audit fields and events. |

## Known Jira ticket meanings

- SCRUM-16: `[F-001, F-002] Implement login and RBAC`.
- SCRUM-17: `Course, section, faculty assignment`.
- SCRUM-18: `User Account Management`.
- SCRUM-19, SCRUM-20 and SCRUM-21 are test-case authoring tasks; they are validation/documentation tickets, not proof that implementation requirements have been delivered.

When the team assigns remaining Jira issues, update every row with the actual issue key, implementation PR, test case ID, result and evidence link. Do not invent missing ticket IDs.
