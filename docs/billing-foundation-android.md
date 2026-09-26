# Android billing integration (internal testing)

The default build remains unavailable: `PURRFECT_BILLING_FOUNDATION_ENABLED=false` excludes Firebase, Credential Manager and Play Billing SDK dependencies. The opt-in build now includes account controls, native purchase/restore, authenticated verification and secure offline settlement. It is not production-ready.

## Build and configuration

Opt in only with `-PpurrfectBillingFoundationEnabled=true` and the ignored local `android/app/google-services.json`. Existing Gradle checks require the approved Firebase project/app/package and run before builds. FirebaseInitProvider remains removed; no new analytics dependency or debug App Check bypass is present. Signing and version changes are separate release responsibilities.

## Native boundary

`CrewBilling` exports only `status`, `refresh`, `purchase`, `restore`, with no arguments. The bridge returns fixed status codes, localized Play price, readiness/active flags and bounded already-settled production seconds. It never exports identity, Firebase/App Check credentials, purchase tokens, account mappings or reusable entitlements. The default source set supplies a Firebase-free unavailable stub.

`BillingFlow` is the pure injected-port orchestrator: callbacks are single-use and tied to session/operation generation. A purchase uses authenticated prepare, current Play ownership, fresh product details, then Play's purchase sheet. Only the backend can verify and consume a token. Pending/cancellation is not payment proof; duplicate delivery never resets expiry or settlement. A consumed purchase/lost HTTP response recovers through prepare's server entitlement revalidation, independently of queryPurchases results. Wrong-account tokens are rejected before verification.

`BillingBackend` uses only `https://www.auraliax.com/v1/purrfect/billing/`, confirmed by the user. It refuses redirects, bounds response sizes and timeouts, and never forwards SDK/HTTP error details or accepts arbitrary destinations. The backend's existing prepare/verify contract is read-only; this change does not deploy or activate it. The parent observed HTTP 404 for the billing entitlement route, so purchase preparation currently fails closed.

## Offline production and recovery

[Decision 009](decisions/009-native-purchase-settlement.md) documents the authority and tradeoffs. Native AES-GCM/Android Keystore cache lives outside backups and exported game saves, bound to UID, boot count, elapsedRealtime and a wall-clock consistency check. It preserves the original server purchase completion and twelve-hour expiry. Cache age is at most twelve hours; reboot/clock anomaly requires online verification. Offline refunds can remain undetected only until reconnect/original expiry.

A native settlement cursor consumes each interval before returning extra-production seconds. Offline bonus keeps the normal first-eight-hour cap and 50% rate (65% with Roman). Game imports cannot replay paid time. Crashes between native settlement and game saving can lose bonus earnings; no two-file atomicity is claimed. Brief production-rate changes use conservative captured rates. A valid same-boot authenticated cache can recover the previously consented persisted Google identity after process death, never a new account/picker. Without that cache startup remains inert. Disconnect clears cache and native identity; it is not account deletion.

## Local verification and release gates

Verification commands: `npm test`, `npm run build`, `npm run android:sync`; JDK 21 sequential default and opt-in `:app:testDebugUnitTest :app:assembleDebug`; opt-in `:app:bundleRelease :app:lintRelease`. See [verification and artifact hash](verification-billing-060.md) for observed results and remaining gates.

Do not treat unit tests, an APK or unsigned AAB as purchase E2E. Remaining gates include backend operator activation, product availability/price, Play signing/install channel, OAuth/attestation on the intended certificate, real license-tester successful/pending/cancel/duplicate/recovery/refund flows, secure-cache behavior across process death/reboot and account switching, independent review, institutional privacy/store disclosures and account-deletion/retention handling. No real-money payment or production release was performed.

## Official sources

- Play lifecycle, product details, pending payments and reconnection: https://developer.android.com/google/play/billing/integrate
- Backend verification and consumption: https://developer.android.com/google/play/billing/security
- Purchase offer selection: https://developer.android.com/reference/com/android/billingclient/api/ProductDetails.OneTimePurchaseOfferDetails
- Android Keystore and background cryptographic operations: https://developer.android.com/privacy-and-security/keystore
- Monotonic clock: https://developer.android.com/reference/android/os/SystemClock
- Boot count: https://developer.android.com/reference/android/provider/Settings.Global#BOOT_COUNT
- Firebase identity: https://firebase.google.com/docs/auth/android/google-signin
- Native App Check: https://firebase.google.com/docs/app-check/android/custom-resource
- Capacitor methods/lifecycle: https://capacitorjs.com/docs/plugins/android

## Operator activation order (internal testers only)

First configure the approved Firebase/App Check/Play service-account prerequisites, product and license testers, and install the correctly signed internal bundle. The operator—not this implementation—then backs up/migrates using the existing backend procedure and enables billing for the internal test window. Execute real-device license-tester purchase, pending, cancellation, restore, expiry and refund checks after that activation. Keep production disabled until those results and privacy/retention/deletion/store obligations are reviewed. Successful local compilation is not an activation approval or a production-readiness claim.
