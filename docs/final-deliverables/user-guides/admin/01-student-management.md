# Administrator User Guide — Student Management

## 1. Scope

This guide describes the student-management workflow required by the SRS. The repository screenshot shows a Spring Boot REST API project, but does not provide enough code/API detail to confirm the exact route names, request fields or whether a separate admin dashboard exists.

## 2. Before making changes

- Use the application URL and API client approved by the project team.
- Confirm you are using the correct environment and test data.
- Confirm that the current user is authorized to administer student records.
- Use synthetic records during development/UAT.

## 3. Student account workflow

The SRS requires an Administrator to create, view, update, activate and deactivate Student and Faculty accounts (SAMS-F-003). Use the actual user-management screen/API implemented in the current build.

- Create student route/screen: `[TBD — verify from source]`
- List/retrieve student route/screen: `[TBD]`
- Update student route/screen: `[TBD]`
- Activate/deactivate route/screen: `[TBD]`
- Faculty account operations: `[TBD]`

## 4. Safe procedure

1. Search for an existing account before creating a new one.
2. Validate the student identifier and required profile fields.
3. Save the record and re-open it to confirm persistence.
4. Update only approved fields and retain the change/ticket reference.
5. Deactivate rather than delete where the application supports it and the SRS workflow requires it.
6. Confirm deactivated users cannot authenticate.

## 5. Audit and privacy

The SRS requires audit records for user management and security-relevant actions (SAMS-F-018 and SAMS-SR-005). It also requires role-based and object-level permissions. Verify these controls before using real student data.

**Verification evidence/build SHA:** `[TBD]`.
