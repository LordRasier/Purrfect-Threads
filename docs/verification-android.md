# Android preparation verification — 2026-09-25

## Passed
- `npm test`: 125 tests, 18 files.
- `npm run test:launcher`: 1 test.
- `npm run test:e2e`: 84 desktop/mobile browser tests, including offline EN/ES privacy.
- `npm run android:sync`: TypeScript, production Vite build and native asset synchronization.
- Gradle `assembleDebug` and `lintDebug`; final app lint: 0 errors, 18 warnings (template resources and dependency-version notices). Capacitor's own lint baseline remains upstream-owned.
- `:app:assembleDebugAndroidTest`: instrumentation test package compiles; **not executed**.
- `npm audit --omit=dev`: 0 vulnerabilities. Three moderate development-tooling findings remain documented in ADR 004.
- APK inspection with Android `aapt`: API 24 minimum, target 36, version 0.5.0/code 1; no Internet or sensitive permissions. The only requested permission is AndroidX's app-scoped signature permission `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`.
- Final merged manifest: backup disabled, extraction exclusions present, cleartext disabled, application icon replaced with the existing approved artwork.

## TDD evidence
- Package safeguard tests initially failed for enabled backup and missing extraction rules, then passed.
- Browser privacy test initially failed because Settings lacked the entry; both locale flows now pass offline.
- Export adapter tests initially failed because the adapter was absent; native success, cancellation and write-error propagation now pass. Existing browser export/import/recovery regressions pass.

## Artifact
`../Purrfect-Threads-Android-debug.apk` is a **debug-signed testing build**, not a Google Play release.
SHA-256: `DF844D468FE4170C0D0B02A739FCE22DAC45F1294A094D79DDA1026F92EDA0D9`.

## Unverified / release blockers
A dedicated API 36 emulator remained offline and did not finish booting. Its processes were stopped; no existing user emulator or phone was modified. Native rendering, document picker round-trip, restart persistence, audio lifecycle and system Back still require a working emulator or physical phone. Browser mobile emulation is not native-device verification.

Confirm the provisional package ID before first upload. Production signing, final Data safety/audience forms, public policy deployment and store submission remain pending. Institutional privacy is still a draft; no website merge, deployment or Play publication was performed in this increment.

## Review and rollback
Reviewed correctness (cancel/error paths and ownership recheck after asynchronous export), narrow platform boundary, export payload limits and no retained file grants, bundled trusted policy markup, and small offline-only dependency surface. No game economy or save schema changes.
Rollback boundary: revert this Android preparation commit to remove the native shell, native export adapter and Settings policy, retaining the prior browser game. No database migration or user-save conversion is involved.

## Build recovery
The first Gradle attempt overlapped with `cap sync`, which deletes/regenerates the Cordova compatibility directory. A missing generated AAR metadata file caused failure. Sequential sync-then-build succeeded; never run these concurrently.
