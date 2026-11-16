# Risk Register — Delivery, Testing and Operational Risks

| ID | Risk | Probability | Impact | Mitigation / response | Owner | Trigger / evidence |
|---|---|---|---|---|---|---|
| R-08 | Performance/capacity requirements are not demonstrated before evaluation. | Medium | High | Run JMeter against a representative environment; capture concurrency, dataset size, p95 response time and failure rate. | [TBD] | No signed performance report for SAMS-NF-001/003. |
| R-09 | Availability and recovery requirements are asserted without sufficient monitoring/restore evidence. | Medium | High | Define measurement window; preserve uptime report; perform a backup restore drill and record results. | [TBD] | No evidence for SAMS-NF-002/005. |
| R-10 | Test environment or seed data differs from the final release build. | Medium | Medium | Record build SHA, configuration, database profile and seed dataset for every UAT run; reset and reseed consistently. | [TBD] | UAT results cannot be reproduced. |
| R-11 | Documentation claims planned features as delivered. | High | High | Reconcile every guide/release note with the latest merged build; clearly label unsupported, not delivered and not tested items. | Documentation owner [TBD] | Any guide includes an unverified screen/endpoint/feature. |
| R-12 | UAT participants or dates are not confirmed in time. | Medium | Medium | Name one Student, Faculty and Administrator representative plus facilitator/observer; agree dates and backups with the coordinator. | [TBD] | UAT calendar remains blank near submission. |
| R-13 | Defects are discovered late and sign-off is collected without retest. | Medium | High | Record each defect, severity, owner and retest evidence; do not sign unconditional acceptance with unresolved critical defects. | [TBD] | Critical/high defect remains open at sign-off. |
| R-14 | Jira backlog statuses/ticket mappings become stale or do not match merged PRs. | Medium | Medium | Refresh Jira, link PRs and test evidence, and use delivered/not-delivered definitions consistently. | Scrum Master [TBD] | Jira says Done but no merged implementation or passing acceptance test exists. |
