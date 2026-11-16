# UAT Plan — Execution, Evidence and Exit Criteria

## 1. Entry criteria

- The team identifies the exact build commit SHA and deployment configuration.
- The test environment is reachable and uses a known database/profile.
- Synthetic Student, Faculty, Administrator, course, section and attendance test data are prepared where the corresponding feature exists.
- The UAT participants and dates are confirmed.
- The latest SRS and approved acceptance criteria are available.
- Known limitations and deviations are disclosed before testing.

## 2. Execution procedure

1. Facilitator reads the scenario and preconditions aloud.
2. Participant performs the workflow without the developer operating the system for them.
3. Facilitator records the actual result and evidence link/screenshot/log.
4. Mark each scenario `Pass`, `Fail`, `Blocked` or `Not Applicable` with a reason.
5. Raise a defect for any failed scenario and link it to the requirement/test case.
6. Retest after a fix using the same test data and record the new build SHA.

## 3. Evidence to capture

- Build commit SHA and environment configuration (do not include secrets).
- Test data IDs and setup notes.
- Request/response examples or UI screenshots, as applicable.
- Test logs, JMeter results, security scan output, backup/restore evidence and accessibility checklist where relevant.
- Defect IDs and retest results.

## 4. Exit criteria

Use the SRS quality exit criteria as the baseline: all High-priority functional and security requirements must be implemented and pass their referenced tests; no open Critical defects remain; required NFR measurements pass; and the RTM references a test for every listed requirement.

For UAT sign-off, also require:

- All applicable UAT scenarios have a recorded result.
- Failed/blocked scenarios have owners and agreed resolution dates.
- Any accepted deviation is written down and approved by the evaluator/coordinator.
- The sign-off form is completed by the appropriate representatives.

## 5. Status definitions

- **Pass:** expected outcome observed with evidence.
- **Fail:** actual outcome differs from expected result.
- **Blocked:** scenario could not be run due to environment/data/dependency issue.
- **Not Applicable:** feature is formally out of this build's scope and the reason is documented; do not use this to hide a missing required feature.
