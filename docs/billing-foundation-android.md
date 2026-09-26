# Android billing foundation

This is a build-time prerequisite slice, not a purchase integration. The default build sets
`PURRFECT_BILLING_FOUNDATION_ENABLED` to `false`; it does not apply the Google services plugin,
does not package Firebase Auth or App Check, and does not start a billing client, sign in a user,
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

Even in that optional prerequisite build, the manifest removes `FirebaseInitProvider`. No Firebase
SDK is initialized yet. A later reviewed activation must explicitly initialize Firebase and install
`PlayIntegrityAppCheckProviderFactory` before using Firebase Auth or any protected backend path.
It must also add the purchase lifecycle, server-side verification, and entitlement handling; none
is complete here.

## Sources

- Firebase Android BoM and compatible dependency declaration: https://firebase.google.com/docs/android/learn-more#bom
- App Check Play Integrity dependency and initialization ordering: https://firebase.google.com/docs/app-check/android/play-integrity-provider
- Google services plugin and package-name matching behavior: https://firebase.google.com/docs/android/google-services-plugin-and-file
- Google Play Billing Library dependency: https://developer.android.com/google/play/billing/integrate
## Verification (2026-09-26)

- Web suite: 187 tests passed; production web build passed.
- JDK 21: `:app:testDebugUnitTest :app:assembleDebug` passed with the default
  flag and with `-PpurrfectBillingFoundationEnabled=true` (four existing native
  policy tests passed in each configuration).
- Valid fixture passes without enabling billing; missing path and mismatched
  package fail. Missing production config prevents opt-in builds.
- Independent review found and resolved fixture/config coupling. No blocking
  findings remained. No device attestation or purchase was exercised.
