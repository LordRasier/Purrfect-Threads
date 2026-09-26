# Android billing foundation

The shop now exposes explicit Google account controls in opt-in Android builds, not purchases. The default build sets
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

Even in that optional build, the manifest removes `FirebaseInitProvider`. Opening the shop reads
inert status; only pressing Connect or Disconnect initializes Firebase and installs
`PlayIntegrityAppCheckProviderFactory` before accessing Auth. No account is created at startup.

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

The foundation is package-private and process-scoped; all calls/callbacks use the Android main
thread. `GoogleAccountPlugin` exports only `status`, `connect`, and `disconnect`; replies contain
fixed `status` and `outcome` codes. UID, email, Google credentials, Firebase tokens and App Check
tokens never cross the bridge. The default source set selects a Firebase-free unavailable stub,
not reflection. There is no HTTP client, arbitrary URL method, purchase or entitlement grant.

## Account lifecycle and disclosure

The bilingual ACCOUNT card explains Google/Firebase identifier processing, no saved-game sync,
and unavailable alpha purchases before the explicit action. Disconnect signs out; it does not
delete the Firebase account. To switch accounts, disconnect first and then connect again.

Destruction cancels/releases the pending UI callback immediately. A Credential Manager picker
receives its cancellation signal. An uncancellable Firebase exchange retains the mutation lock
until it settles; any late identity is signed out before another account operation can start.
The coordinator drops the destroyed owner's completion, so the process singleton does not retain
its Activity/plugin. Activity references in the SDK driver are weak. Native busy state offers a
manual status refresh; it never claims that sign-out succeeded before completion.

After process restart, status does not activate Firebase or silently recover an account. The user
must explicitly connect to recover any persisted Google identity. This is not proof of purchases
or server-side purchase linking. The existing billing port remains unavailable on every platform.

## Remaining release gates

The ignored local Firebase configuration now includes the expected Android OAuth client entries
for the two registered SHA-1 fingerprints. Local configuration is not device proof. Verify every
intended signing certificate, real-device Google sign-in/cancel/disconnect, Activity recreation,
process restart/reinstall recovery, and real Play Integrity attestation. No debug App Check bypass
is included, and this account UI never requests an attestation token.

**Do not release the opt-in account build as production-ready:** the deployed privacy policy and
in-app privacy text still require account-processing review/update, and account deletion needs an
implemented/disclosed path. Those remote/privacy changes are intentionally outside this slice.
Purchase lifecycle, backend verification, entitlement storage/offline expiry, release signing/R8,
Play product configuration and license-tester evidence remain separate gates. No BillingClient
connection, remote backend request, real-money purchase, or production deployment is authorized.
## Sources

- Capacitor v8 explicit Android plugin methods and responses: https://capacitorjs.com/docs/plugins/android

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

### Account bridge slice (2026-09-26)

- RED/GREEN: absent controller/UI/plugin boundary files failed focused Vitest runs, then passed
  (7 controller, 3 localized UI, 2 source-boundary checks). Native destruction/cancellation tests
  first failed for missing `cancelPending`; a stale-disconnect regression then failed behaviorally
  before generation checks were added. Final native suite: 15 identity + 4 ads tests per variant.
- `npm test`: 199 passed. `npm run build`: passed. `npm run android:sync`: passed afterward.
- JDK 21, sequential `:app:testDebugUnitTest :app:assembleDebug`: default passed (17 seconds),
  then `-PpurrfectBillingFoundationEnabled=true` passed (39 seconds). No device tests were run.
- Default merged manifest: no FirebaseInitProvider. Default debugRuntimeClasspath: no Firebase,
  Credential Manager, or Play Billing dependencies. `git diff --check`: passed.
- Sync replaced ignored packaged web assets only; no tracked generated-file diff. The final local
  debug APK is the opt-in build. Existing Vite large-chunk and Gradle deprecation warnings remain.
- Parent-owned independent review and browser checks are pending at this handoff. Native SDK/UI
  integration, actual Google sign-in, and Activity recreation still require physical-device proof.
