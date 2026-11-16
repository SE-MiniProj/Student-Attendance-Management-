# Possible Future Work Beyond the Current Project

This section lists potential enhancements only. None should be presented as implemented in the current release unless supported by a merged code change and test evidence.

## 1. QR-code attendance

A faculty member could create a time-limited attendance session and display a QR code. Students could scan it using a device camera. The design would need anti-replay protection, expiry, one-student/one-session rules, and a fallback method for device/network failures.

## 2. RFID or smart-card attendance

A future version could integrate RFID or smart-card readers through a documented device/API interface. Device procurement, identity binding, lost-card handling and privacy controls would need separate evaluation. The SRS explicitly treats RFID/QR/smart-card hardware as an extension and says no special-purpose hardware is mandatory for the current system.

## 3. Institutional ERP integration

The SRS mentions optional institutional/ERP API integration for importing student, faculty, course and enrollment data. Future work could define secure API contracts, synchronization schedules, conflict resolution, audit logging and failure/retry behavior.

## 4. Mobile application or progressive web app

A responsive mobile interface or dedicated app could provide student attendance history, faculty marking flows and administrator operations. This requires accessibility testing, secure token/session design, device support and offline-sync rules if offline operation is desired.

## 5. Additional reporting and notifications

Potential extensions include low-attendance alerts, configurable thresholds, PDF/CSV exports and scheduled notifications. The SRS includes these as requirements or optional functions; the team must distinguish an SRS requirement not yet delivered from genuinely new future scope.

## 6. Production readiness and operations

Further work could include database migrations, backup/restore automation, monitoring, stronger performance testing, audit-log retention, and deployment behind a production TLS reverse proxy.

## 7. Prioritization suggestion

1. Close security, data-integrity, attendance-correction and backup gaps first.
2. Complete SRS-required reporting, threshold and export capabilities.
3. Add ERP integration after data ownership and synchronization contracts are agreed.
4. Add QR/RFID and mobile application only after the core workflows are stable and privacy/security risks are reviewed.

## Scope boundary

QR/RFID, mobile application and additional ERP integrations are future enhancements beyond the documented minimum build. ERP API integration is mentioned as optional in the SRS; biometric hardware design is explicitly out of scope for the current project.
