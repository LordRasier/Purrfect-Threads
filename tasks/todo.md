# Billing preparation checklist

- [x] Verify Firebase registration and Play Integrity project link.
- [x] Read backend environment loader and purchase contract.
- [x] Prepare opt-in Android dependencies and configuration validation.
- [x] Run focused tests, full unit suite, web build, Android debug tests/build.
- [x] Document server environment values and secret handling.
- [x] Independently review native configuration and preserve safe defaults.
- [x] Report completed preparation separately from unimplemented billing flow.

## Native identity foundation slice

- [x] Verify official Firebase/Credential Manager APIs and keep RDD off.
- [x] Record RED for absent coordinator and restart sign-out regression; GREEN for eleven policy tests.
- [x] Add opt-in native adapter without a UI/plugin/token bridge or purchase flow.
- [x] Verify web tests/build and default/opt-in Android tests/build.
- [x] Verify default manifest/runtime dependency isolation.
- [x] Independently review this slice (no blocking findings for the dormant scope).
- [ ] Device sign-in/attestation, account UI lifecycle, and signing/OAuth release gates (deferred).

