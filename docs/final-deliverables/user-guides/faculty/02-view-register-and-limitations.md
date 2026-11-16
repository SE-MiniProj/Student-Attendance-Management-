# Faculty User Guide — View Register and Known Limits

## 1. View a class register

Open the class/session register feature available in the current build.

- Exact screen/route: `[TBD — obtain from source/API docs]`
- Inputs: assigned course/section and session/date, according to the implemented workflow.
- Expected result: the active enrolled roster and saved attendance statuses for the selected class (SAMS-F-007 and SAMS-F-013).

## 2. Review attendance history and summary

Use the implemented student/course history and summary functions to investigate a record or percentage. Verify that the faculty account can access only authorized sections and students.

- History route/screen: `[TBD]`
- Summary route/screen: `[TBD]`

## 3. Corrections

The SRS requires Faculty/Admin corrections to include a reason and preserve old/new values, actor and timestamp (SAMS-F-010). If this workflow is absent from the current build, report it as not delivered rather than describing a manual database change as a feature.

## 4. Verify before publishing this guide

- Faculty role and section permissions work server-side.
- Roster contains all active enrolled students and excludes non-enrolled students.
- All four required attendance statuses can be saved and retrieved.
- Duplicate records are prevented.
- Corrections produce the required audit history.

**Evidence:** screenshots/API responses and test IDs `[TBD]`.
