# Billing 0.6.0 local verification

## Scope
Opt-in internal-test candidate, not real-device purchase E2E or production release. RDD remained off. No server edits, remote credentials, real charges, commits or signing were performed by the implementation agent.

## RED to GREEN evidence
- Missing BillingLease, BillingFlow, BillingLifecycle and BillingWire first failed focused native test compilation; implementation then passed their focused tests.
- Callback tests exercise actual injected purchase orchestration: unavailable server; pending/wrong-account; session change during prepare/verify; duplicate callbacks; cancelled/timed-out stale callbacks; restore-before-repurchase; stale payment update; backgrounded delayed launch.
- Lifecycle regressions failed behaviorally for delayed pre-pause cutoff, equal-millisecond cutoff and repeated unconsumed pause boundaries. The pure policy now preserves the earliest away boundary until a strictly later cutoff consumes it, and cannot settle while paused.
- The native expired grant/cursor tests preserve original expiry, same-boot and clock consistency, once-only settlement and the first-eight-hour offline cap. Wire tests cover strict ISO time parsing, bounded API24-compatible reads and revoked-versus-pending/overlap responses.
- Missing web controller/credit delivery/UI behavior first failed focused Vitest runs. A stale rejected prior-session promise failed by clearing a newer request's pending state; both catch and notification are now session-generation guarded.
- Hidden-credit delivery waits for baseline offline settlement before saving, preserving normal offline earnings. Native inactive/revoked responses erase authority immediately even while paused or after request timeout.

## Final checks
- `npm test`: 215 tests across 37 files passed.
- `npm run build`: passed; existing large Three.js chunk warning.
- `npm run android:sync`: passed after the final web edit.
- JDK 21 default `:app:testDebugUnitTest :app:assembleDebug`: passed.
- JDK 21 opt-in `:app:testDebugUnitTest :app:assembleDebug -PpurrfectBillingFoundationEnabled=true`: passed.
- Each native suite has 42 tests: ads 4, identity 16, purchase flow 8, lease 6, lifecycle 5, wire 3.
- Independent reviewer cleared required source findings; parent reported 13 focused spot-check tests and desktop/mobile unavailable-state browser checks passed. Parent independently verified the AAB hash/unsigned state and copied it to outputs/Purrfect-Threads-0.6.0-unsigned.aab. Physical-device SDK/cache/payment proof remains unperformed.

## Remaining gates
The unsigned R8 bundle and release lint checks passed; artifact details follow. The user must sign the bundle and the operator must configure/activate the backend for license testers before payment E2E. Purchase routes currently return 404. Privacy/store, retention/account deletion and production release are not completed.

## Release artifact
- `:app:bundleRelease :app:lintRelease -PpurrfectBillingFoundationEnabled=true`: passed in 6m28s. R8 minification and resource shrinking remained enabled; no keep-rule bypass or Gradle configuration weakening.
- Lint: **0 errors, 19 warnings**, no NewApi. Warning categories: existing identity NoCredentialException classification and resource-name lookup, Gradle update advisory, drawable-v24 redundancy, 11 unused resources and four icon warnings. They were not hidden or suppressed.
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`, 27,044,699 bytes.
- SHA-256: `46556AF0B50BA20465D5D3DD45144158DEF7041E35F74DE2FFA524300F9A2473`.
- JDK21 `jarsigner -verify`: **jar is unsigned**. No signing credentials were read or used.
- Release merged manifest: versionCode 2 / versionName 0.6.0, `com.android.vending.BILLING` present, FirebaseInitProvider absent. These version changes are parent-owned.
- R8 mapping: `android/app/build/outputs/mapping/release/mapping.txt` (48,079,104 bytes).
- `git diff --check`: passed; only repository CRLF conversion notices.

## Suggested dependency-safe commit units
1. `feat: add verified purchase and settlement policies`: BillingFlow/BillingLease/BillingLifecycle/BillingWire and their native tests; standalone pure policies compile without SDK integration.
2. `feat: integrate native verified Play purchases`: fixed backend/cache/Play/runtime/plugin adapters, unavailable stub, MainActivity registration, identity recovery seam/tests, and native source-boundary tests. Depends on unit 1 and leaves default UI unavailable until unit 3.
3. `feat: connect purchase UI to native paid settlement`: billing controller and captured credit delivery, main/view/shop/account wiring, bilingual privacy/localization, web regression tests, ADR/verification/tasks. Depends on unit 2.
4. Parent-owned release version and changelog unit. No commits were created by the implementation agent.
