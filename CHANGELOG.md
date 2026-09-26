# Changelog

## 0.6.0 — Internal testing candidate

### Added
- Optional Android Google account connection for purchase recovery.
- Native Google Play purchase and restore integration for the 12-hour Meowtastic Crew boost, subject to server verification and product availability.

### Security
- Paid boost time is validated and settled by Android, separately from exported game saves.
- Purchases remain unavailable when the verification service cannot be reached. Web builds do not offer native payments.

### Release status
- Android version code: 2. This candidate is not a production release.
- Signing, Play upload, product configuration, and real-device license-tester verification must be recorded separately; this changelog does not certify those steps.
