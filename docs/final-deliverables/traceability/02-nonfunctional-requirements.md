# Requirements Coverage — Non-Functional Requirements

**Source:** SAMS SRS v1.0, Section 5.  
**Known backlog items:** SCRUM-19 (non-functional test cases), SCRUM-22 (JMeter and OWASP ZAP setup), SCRUM-23 (test environment and seed data). These are test/setup tickets, not proof that a quality target has passed.

| SRS ID | Measurable requirement | Possible validation ticket | Delivery / evidence status |
|---|---|---|---|
| SAMS-NF-001 | 95% of normal interactive page/API requests complete within 3 seconds (excluding large exports) | SCRUM-19; SCRUM-22 (JMeter) | No load-test report supplied. Not verified. |
| SAMS-NF-002 | At least 99.5% monthly availability, excluding approved maintenance | SCRUM-19; monitoring work not identified | No monthly uptime evidence supplied. Not verified. |
| SAMS-NF-003 | Support 500 concurrent authenticated users and 10,000 student records | SCRUM-19; SCRUM-22 (JMeter); SCRUM-23 (test environment) | No capacity-test report supplied. Not verified. |
| SAMS-NF-004 | Current desktop/mobile browsers; keyboard navigation and readable labels | SCRUM-19; usability ticket not identified | No cross-browser/accessibility checklist supplied. Not verified. |
| SAMS-NF-005 | Daily backups and demonstrated restore of a verified backup | Operations/backup ticket not visible | No backup schedule or restore evidence supplied. Not verified. |
| SAMS-NF-006 | Validate inputs and keep committed attendance operations atomic and consistent | SCRUM-21 may contain functional test cases; implementation ticket not identified | No transaction/integrity test evidence supplied. Not verified. |

## Required evidence to attach

- NF-001/NF-003: JMeter script, test environment details, test data size, concurrency, percentile response time and pass/fail result.
- NF-002: monitoring window and uptime calculation.
- NF-004: browser matrix and keyboard/accessibility checklist.
- NF-005: dated backup and restore logs with expected/recovered record counts.
- NF-006: validation and transaction tests, including proof that failed operations leave no partial/orphan records.

Do not change a status to `Passed` until the corresponding evidence exists.
