# Android billing foundation

This is a dormant native identity foundation, not a purchase integration. The default build sets
`PURRFECT_BILLING_FOUNDATION_ENABLED` to `false`; it does not apply the Google services plugin,
does not package Firebase Auth, App Check, or Credential Manager, and does not start a billing client, sign in a user,
or initialize analytics.

The Play Billing dependency is present only in the optional prerequisite build. There is no purchase,
restore, entitlement, acknowledgement, or backend code in this slice.

## Optional Firebase prerequisite build

Use `-PpurrfectBillingFoundationEnabled=true` only after supplying a local
`android/app/google-services.json`. The file is ignored by Git. The build checks that the selected
Firebase project, app ID, and client package match the approved Android application; a missing file,
invalid JSON, wrong project, wrong app ID, or wrong package fails with a clear Gradle error. The
check is wired into `preBuild` when enabled. Run `:app:verifyBillingFoundationConfiguration` for
the focused production-file check. The separate `:app:verifyBillingFoundationFixture` task accepts
`-PpurrfectFirebaseConfigFixture=...` for local fixture validation without enabling the feature or
requiring a local Firebase configuration file; it cannot substitute for the production build check.

The safe default command is `./gradlew.bat :app:assembleDebug` with no billing property. The only
opt-in command is `./gradlew.bat :app:assembleDebug -PpurrfectBillingFoundationEnabled=true` from
`android/`; it requires the ignored local configuration file and runs the production-file check.

Even in that optional build, the manifest removes `FirebaseInitProvider`. Nothing invokes the
identity foundation at startup or from the current game. Only a future native account control
may invoke its explicit sign-in/sign-out methods. Those methods initialize Firebase and install
`PlayIntegrityAppCheckProviderFactory` before accessing Auth.

## Implemented native seam

`IdentityCoordinator` is a pure-Java policy with injected SDK operations. The optional
`FirebaseIdentityFoundation` uses Credential Manager 1.3.0 / Google ID 1.1.1 and the existing
Firebase BoM 34.19.0, matching the Firebase Android integration guide. Its source directory and
SDK dependencies are compiled only when the foundation flag is true.

- Construction and status do not initialize Firebase. Status starts `UNINITIALIZED`; persisted
  Google identity is recovered only after explicit activation. Anonymous users are not accepted.
- Explicit sign-in requests an account picker without automatic selection, then exchanges the
  Google credential with Firebase. User cancellation and SDK failures return fixed error codes.
- Identity mutations serialize: sign-in/sign-out while busy returns `BUSY`; callers must wait
  and retry, not assume sign-out succeeded. This avoids racing an uncancellable Firebase exchange.
  Sign-out clears Firebase first, then Credential Manager state; clear failure is reported without
  restoring the Firebase session. Explicit sign-out also clears a persisted session after restart.
- Native-only token acquisition returns both Firebase ID and App Check tokens or neither.
  Session generation and UID checks discard in-flight results after sign-out/account changes.
  Tokens are never logged, serialized, returned to JavaScript, or sent anywhere by this slice.

The class is package-private and process-scoped; all calls/callbacks use the Android main thread.
There is no Capacitor plugin, HTTP client, arbitrary URL method, account UI, purchase flow,
entitlement grant, or backend integration. A future native fixed-destination client must consume
tokens immediately and must not persist them or forward them to JavaScript.

## Remaining activation gates

Verify SHA-1 registration for each intended signing certificate and the corresponding Android
OAuth client, then download the updated Firebase configuration. The supplied local Purrfect
client has a web OAuth client but no Android OAuth entry; SHA-256/App Check registration alone
does not prove Google sign-in readiness. No credentials or remote configuration were changed.

Account UI must enforce explicit user intent, handle Activity destruction/cancellation and busy
retry, and establish account switching/recovery behavior. No UI is reachable today. Device
sign-in, reinstall recovery, and real Play Integrity attestation remain unverified. No debug
App Check provider or bypass is included. Purchase lifecycle, server verification, entitlement
storage/offline expiry, release signing/minification verification, and license-tester evidence
remain separate release gates.

## Sources

- Firebase Android BoM and compatible dependency declaration: https://firebase.google.com/docs/android/learn-more#bom
- App Check Play Integrity dependency and initialization ordering: https://firebase.google.com/docs/app-check/android/play-integrity-provider
- Google services plugin and package-name matching behavior: https://firebase.google.com/docs/android/google-services-plugin-and-file
- Google Play Billing Library dependency: https://developer.android.com/google/play/billing/integrate
- Google sign-in, web client ID, SHA-1 prerequisite, and sign-out: https://firebase.google.com/docs/auth/android/google-signin
- Credential Manager Java callbacks and Activity context: https://developer.android.com/reference/androidx/credentials/CredentialManager
- Native App Check token retrieval: https://firebase.google.com/docs/app-check/android/custom-resource
## Verification (2026-09-26)

- Web suite: 187 tests passed; production web build passed.
- Previous prerequisite slice: JDK 21 default and opt-in debug tests/build passed
  with four existing native policy tests. Current identity verification is recorded below.
- Valid fixture passes without enabling billing; missing path and mismatched
  package fail. Missing production config prevents opt-in builds.
- Independent review found and resolved fixture/config coupling. No blocking
  findings remained. No device attestation or purchase was exercised.

### Native identity slice (2026-09-26)

- RED: coordinator tests initially failed to compile because the coordinator did not exist.
  A later regression test failed because sign-out before activation did not clear persisted
  identity; explicit sign-out now initializes in the same guarded order before clearing it.
- GREEN: 11 identity tests plus 4 existing ads policy tests passed in each full Android
  configuration. Sequential JDK 21 `:app:testDebugUnitTest :app:assembleDebug` runs passed
  without the property and with `-PpurrfectBillingFoundationEnabled=true`.
- `npm test`: 187 tests passed. `npm run build`: passed; existing large Three.js chunk warning.
- Default merged manifest contains no `FirebaseInitProvider`; default `debugRuntimeClasspath`
  contains no Firebase, Credential Manager, or Billing dependencies. `git diff --check` passed.
- Independent review approved this dormant slice with no blocking findings. No device sign-in, attestation,
  release/minified build, backend request, or purchase was exercised.
