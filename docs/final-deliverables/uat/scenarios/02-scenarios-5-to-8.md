# UAT Scenarios 5–8 (Derived from SRS Section 6)

## UAT-05 — Attendance calculation and student view

**SRS tests:** TC-CALC-01, TC-STU-01. **Requirements:** SAMS-F-011, SAMS-F-012.  
**Participants:** Student; Faculty may observe.  
**Preconditions:** Known attendance dataset with a mix of statuses exists.

**Steps:**
1. Retrieve the student's course-wise attendance count and percentage.
2. Calculate the expected result independently from the test data and agreed status rules.
3. Open attendance history for the course.
4. Attempt to retrieve another student's details using the test student context.

**Expected:** Counts and percentage match the test oracle and update after a valid attendance change; the Student can view own data only.

**Result:** [Pass / Fail / Blocked / N/A]  **Evidence:** [TBD]  **Defect:** [TBD]

## UAT-06 — Reports, shortage, filters, export and notifications

**SRS tests:** TC-RPT-01 to TC-RPT-04, TC-NOTIF-01. **Requirements:** SAMS-F-013 to SAMS-F-017.  
**Participants:** Faculty, Administrator and Student if notification is enabled.  
**Preconditions:** Test attendance dataset includes students above and below the configured threshold; notification feature is enabled if included in the build.

**Steps:**
1. View class-wise summary and an individual student's attendance details.
2. Generate a report using course/section/student/status/date filters.
3. Identify students below the configured threshold.
4. Export the report as CSV and PDF where those formats are implemented.
5. If notifications are enabled, cause a controlled test threshold crossing and inspect the notification event.

**Expected:** Results match the applied filters and underlying data; shortage list matches threshold calculation; exported files open and match the report; enabled notification records the student/course/current percentage.

**Result:** [Pass / Fail / Blocked / N/A]  **Evidence:** [TBD]  **Defect:** [TBD]

## UAT-07 — Audit, security, performance and capacity

**SRS tests:** TC-AUD-01, TC-SEC-01 to TC-SEC-06, TC-PERF-01 and TC-PERF-02. **Requirements:** SAMS-F-018, SAMS-SR-001 to SAMS-SR-006, SAMS-NF-001, SAMS-NF-003.  
**Participants:** Administrator, test lead and developer/security tester.  
**Preconditions:** Security test accounts and representative load dataset are ready; JMeter/OWASP ZAP configuration is approved.

**Steps:**
1. Inspect audit entries for login failures, attendance creation/correction, user changes and exports.
2. Verify production HTTPS/TLS settings, password hash storage, protected endpoint authorization, session protections and failed-login throttling.
3. Run the agreed load profile and capture the 95th-percentile response time and capacity result.

**Expected:** Audit entries contain required metadata without passwords; security checks pass; performance targets meet SRS thresholds. Do not mark a control passed without the corresponding report.

**Result:** [Pass / Fail / Blocked / N/A]  **Evidence:** [TBD]  **Defect:** [TBD]

## UAT-08 — Reliability, backup/restore, integrity and usability

**SRS tests:** TC-REL-01, TC-OPS-01, TC-DATA-01, TC-UX-01. **Requirements:** SAMS-NF-002, SAMS-NF-004, SAMS-NF-005, SAMS-NF-006.  
**Participants:** Test lead, Administrator and representative Student/Faculty users.  
**Preconditions:** Monitoring window, backup/restore environment and supported browser matrix are prepared.

**Steps:**
1. Review uptime evidence for the measured period.
2. Restore a verified backup and compare expected records.
3. Submit invalid attendance input and simulate a failed/rolled-back operation.
4. Complete keyboard navigation and readable-label checks on supported browsers/devices.

**Expected:** Availability target is met; restore recovers expected dataset; invalid/failed operations do not leave partial/orphan data; usability/accessibility checklist passes.

**Result:** [Pass / Fail / Blocked / N/A]  **Evidence:** [TBD]  **Defect:** [TBD]
