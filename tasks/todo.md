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
- [ ] Device sign-in/attestation remains deferred; account UI and local OAuth are addressed below.


## Account UI connection slice
- [x] RED/GREEN controller, bilingual disclosure and native lifecycle regressions.
- [x] Default-unavailable native stub and opt-in Google account plugin.
- [x] Explicit shop connect/disconnect without billing or token/UID/email exposure.
- [x] Web tests/build/sync and default/opt-in Android tests/build (199 web; 19 native each).
- [ ] Parent independent review and browser verification.
- [x] Local OAuth configuration updated (device proof still required).
- [ ] Deployed privacy/account-deletion and real-device verification gates before release.

## Purchase vertical slice
- [x] Confirm fixed backend host from user: https://www.auraliax.com/ (routes currently unavailable).
- [x] RED for absent native cache policy; approve same-boot authenticated offline recovery.
- [x] Native transport, secure settlement cache and BillingClient lifecycle.
- [x] Purchase/restore UI and accurate privacy/offline disclosures.
- [x] Web tests/build/sync (215); default/opt-in Android tests/debug (42 each); opt-in R8 bundle and release lint (0 errors/19 warnings).
- [x] Independent source review and web browser checks (parent/reviewer reported no source blockers).
- [ ] Real-device license-tester purchase/recovery/refund proof (not performed).
