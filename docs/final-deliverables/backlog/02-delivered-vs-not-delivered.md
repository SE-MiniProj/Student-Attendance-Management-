# Backlog Summary — Delivered vs Not Delivered

**Status basis:** Jira screenshot supplied in this conversation, last observed **04-11-2026**. It is not a live status check. The new documentation tasks in the latest message had not yet been assigned Jira/GitHub keys.

| Work item | Ticket visible | Last observed status | Delivery status | One-line reason |
|---|---|---|---|---|
| Login and RBAC | SCRUM-16 | In Progress | Not confirmed delivered | The only Jira evidence supplied showed work in progress; no merged PR or passing auth tests were provided. |
| Course, section and faculty assignment | SCRUM-17 | In Progress | Not confirmed delivered | The issue was in progress; no implementation/test evidence supplied. |
| User account management | SCRUM-18 | In Progress | Not confirmed delivered | The issue was in progress; no implementation/test evidence supplied. |
| Non-functional test cases | SCRUM-19 | Testing | Test documentation in progress | The status does not prove NFR measurements passed. |
| Security test cases | SCRUM-20 | Testing | Test documentation in progress | The status does not prove security controls passed. |
| Remaining functional test cases | SCRUM-21 | Testing | Test documentation in progress | The status does not prove functional requirements passed. |
| JMeter and OWASP ZAP setup | SCRUM-22 | In Progress | Not confirmed delivered | Tool setup was still in progress in the supplied screenshot. |
| Test environment and seed data | SCRUM-23 | In Progress | Not confirmed delivered | Environment setup was still in progress in the supplied screenshot. |
| User stories and acceptance criteria | SCRUM-24 | To Do | Submitted for review, acceptance unknown | The documents were later submitted in PR #25; the PR's current review/merge state must be checked. |
| Wireframes | SCRUM-25 | To Do | Submitted for review, acceptance unknown | The PDF was later submitted in PR #25; the PR's current review/merge state must be checked. |
| Student/faculty/admin guides, release notes, status/coverage, risks, UAT, demo, glossary, FAQ, future work | Not assigned yet | Not available | Not yet tracked in Jira | The latest task message said these would be assigned later; create/link tickets when provided. |

## Rules for the final summary

- **Delivered:** merged implementation/documentation exists and relevant acceptance evidence passes.
- **Submitted:** PR exists but has not been accepted/merged.
- **In testing:** test work is underway; this is not a pass.
- **Not delivered:** required capability is absent or not evidenced in the release build.
- **Not verified:** insufficient evidence to decide; state what evidence is missing.

Refresh this table from the live Jira board and merged PR list on the day of submission. Keep one concise reason for every not-delivered/not-verified item.
