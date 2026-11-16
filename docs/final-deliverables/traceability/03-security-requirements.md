# Requirements Coverage — Security Objectives and Requirements

**Source:** SAMS SRS v1.0, Section 5.1.  
**Known Jira evidence:** SCRUM-16 (login/RBAC), SCRUM-20 (security test cases), SCRUM-22 (OWASP ZAP/JMeter setup), SCRUM-23 (test environment). The screenshot showed SCRUM-20 in Testing and SCRUM-22/23 In Progress on 04-11-2026.

## Security objectives

| Objective | Meaning | Evidence required |
|---|---|---|
| SO-1 — Confidentiality and least privilege | Protect credentials/attendance information and limit access to role-required data | Passing tests for authentication, role and object-level authorization, and protected API endpoints. |
| SO-2 — Integrity and accountability | Prevent unauthorized/untraceable attendance changes and retain evidence of sensitive actions | Tests for controlled corrections, audit event completeness and tamper resistance. |

## Security requirements traceability

| SRS ID | Requirement | Known ticket / validation route | Current evidence status |
|---|---|---|---|
| SAMS-SR-001 | Production traffic/API uses HTTPS with TLS 1.2+ | SCRUM-20 / SCRUM-22 (security validation); implementation ticket not identified | No TLS scan/configuration evidence supplied. Not verified. |
| SAMS-SR-002 | Passwords are never plaintext; use approved adaptive salted password hashing | SCRUM-20 (test); implementation ticket not identified | No database/hash inspection supplied. Not verified. |
| SAMS-SR-003 | Server-side authorization on every protected page/API using role and object permissions | SCRUM-16; SCRUM-20 (test) | SCRUM-16 was In Progress in supplied snapshot. No passing negative authorization test supplied. |
| SAMS-SR-004 | Secure/HttpOnly cookies where used, session expiration, logout invalidation and CSRF protection | SCRUM-16 may be related; explicit implementation ticket not identified | No cookie/session/CSRF test evidence supplied. Not verified. |
| SAMS-SR-005 | Tamper-resistant audit entries with actor, timestamp, action, target, outcome and metadata; no passwords | SCRUM-20 (test); implementation ticket not identified | No audit-record inspection supplied. Not verified. |
| SAMS-SR-006 | Rate-limit or temporarily throttle/lock repeated failed logins | SCRUM-20 (test); implementation ticket not identified | No repeated-failure test evidence supplied. Not verified. |

## Ticket mapping caution

SCRUM-20 is titled “Write security test-cases”; SCRUM-22 is “Set Up JMeter and OWASP ZAP.” These tickets can validate controls but do not themselves implement the controls. Add the actual implementation ticket and merged PR for each security requirement once identified.
