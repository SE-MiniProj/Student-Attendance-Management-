# UAT Scenarios 1–4 (Derived from SRS Section 6)

Record the build SHA, tester, date, actual result, evidence and defect ID for each run. The scenarios below group the SRS Section 6 test suites into user-level acceptance flows; they do not imply that the feature is already implemented.

## UAT-01 — Authentication and role access

**SRS tests:** TC-AUTH-01, TC-AUTH-02. **Requirements:** SAMS-F-001, SAMS-F-002.  
**Participants:** Student, Faculty, Administrator.  
**Preconditions:** Active test accounts exist for each role; role access is configured.

**Steps:**
1. Log in with valid credentials for each test role.
2. Confirm the correct role dashboard/home response is shown.
3. Attempt login with invalid credentials.
4. Attempt to access a protected URL/API belonging to a different role.

**Expected:** Valid users authenticate into the correct role context; invalid credentials are rejected; unauthorized access is denied without protected data disclosure.

**Result:** [Pass / Fail / Blocked / N/A]  **Evidence:** [TBD]  **Defect:** [TBD]

## UAT-02 — Administrator master data and enrollment

**SRS tests:** TC-ADM-01, TC-ADM-02, TC-ADM-03. **Requirements:** SAMS-F-003 to SAMS-F-005.  
**Participants:** Administrator.  
**Preconditions:** Admin test account and clean synthetic dataset.

**Steps:**
1. Create/update a Student and Faculty account; activate/deactivate an account.
2. Create/update a course, section, semester and faculty assignment.
3. Enroll a student in a section and remove an enrollment.
4. Attempt an invalid/duplicate mapping or invalid student ID.

**Expected:** Valid changes persist; deactivated users cannot log in; duplicate/invalid mappings are rejected; roster/enrollment state reflects accepted changes.

**Result:** [Pass / Fail / Blocked / N/A]  **Evidence:** [TBD]  **Defect:** [TBD]

## UAT-03 — Create session, view roster and mark attendance

**SRS tests:** TC-ATT-01, TC-ATT-02, TC-ATT-03. **Requirements:** SAMS-F-006 to SAMS-F-008.  
**Participants:** Faculty.  
**Preconditions:** Faculty is assigned to a section; students are enrolled; session setup exists if supported.

**Steps:**
1. Create an attendance session for an assigned section with date/time and optional topic/period.
2. Open the session roster.
3. Mark sample students Present, Absent, Late and Excused.
4. Save and retrieve the saved attendance statuses.

**Expected:** Session is created only for an assigned section; roster contains active enrolled students; each saved status is retrievable.

**Result:** [Pass / Fail / Blocked / N/A]  **Evidence:** [TBD]  **Defect:** [TBD]

## UAT-04 — Duplicate prevention and authorized correction

**SRS tests:** TC-ATT-04, TC-ATT-05. **Requirements:** SAMS-F-009, SAMS-F-010.  
**Participants:** Faculty and/or Administrator.  
**Preconditions:** An attendance record exists for a test student/session.

**Steps:**
1. Submit the same student/session attendance record a second time.
2. Confirm the duplicate is blocked or handled as an authorized update.
3. Correct an existing record using an authorized account and provide a reason.
4. Inspect the resulting audit history.

**Expected:** Duplicate records are not created; correction is authorized; audit history preserves old/new values, actor, time and reason.

**Result:** [Pass / Fail / Blocked / N/A]  **Evidence:** [TBD]  **Defect:** [TBD]
