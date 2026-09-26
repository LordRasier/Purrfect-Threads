# Secure native purchase and offline settlement

## Status
Accepted for opt-in internal testing, 2026-09-26. Supersedes the no-purchase and entirely inert restart clauses of decisions 007/008 only for authenticated, previously consented purchase-cache recovery. Default builds remain unavailable.

## Context
The existing backend owns Google verification, immutable completion/expiry timestamps, account mappings and consumption. Its entitlement response is HTTPS-authenticated but not signed for arbitrary offline distribution. Exported game saves and the device wall clock cannot authorize paid production.

## Decision
- Fix the native destination to `https://www.auraliax.com/v1/purrfect/billing/`; reject redirects and all bridge-supplied credentials, destinations, products or accounts. Firebase ID and App Check credentials stay native; Google purchase tokens are neither logged nor stored on-device.
- Use BillingClient 9.1.0 with pending purchases, automatic reconnection, fresh ProductDetails, server-provided obfuscated account ID, and server-only consumption. Prepare revalidates the backend ledger, so consumed purchases recover even when Play no longer lists a token. Pending, cancelled, wrong-account and unavailable states never authorize a new grant.
- Cache only a server-confirmed immutable 12-hour window, native UID, elapsedRealtime/wall anchors, boot count and settlement cursor. Encrypt/authenticate with an Android Keystore AES-GCM key and AtomicFile under noBackupFilesDir. No game save carries entitlement authority.
- Require matching identity, same boot, nondecreasing elapsedRealtime, no wall-clock discrepancy over five seconds, and a maximum twelve-hour cache age. Reboot, cache/key failure, identity changes or clock anomalies require online revalidation. Revalidation never changes the original purchase expiry. Authoritative inactive/refunded responses clear the cache; temporary transport failure cannot create or extend one.
- Consume paid-time intervals durably before returning bounded foreground/offline extra-production seconds. Offline settlement uses the first eight hours and the existing 50%/65% efficiency. Imports cannot replay paid time from an editable savedAt. An expired cached window may still settle the historical overlap once.
- At startup only an authenticated, structurally valid same-boot purchase cache permits recovery of an already persisted Google identity, with a native UID recheck. No new identity, anonymous sign-in or picker is initiated. No-cache/default startup remains inert.

## Consequences
Offline refunds cannot be observed immediately: reconnection revalidates, and offline exposure cannot exceed the original grant's remaining twelve-hour window. This limitation, reboot requirement and optional account processing are disclosed in both languages. Cache freshness never renews merely because it was read.

Settlement and the editable game save are not one transaction. A crash after native settlement but before saving bonus earnings may lose that bonus; it cannot replay the interval. Requests capture the game/rate and stale callbacks after account/save replacement are dropped. Rate changes during a settlement interval conservatively use the lower observed production rate rather than retroactively multiplying earlier time at an upgraded rate. This can slightly under-credit the brief polling interval; it never over-credits it.

## Verification boundary
Injected-port coordinator tests cover unavailable prepare, pending, cancellation, duplicate callbacks, identity switches during prepare/verify, timeout/stale callbacks and recovery. Native policy tests cover clocks, reboot, identity, original expiry and once-only settlement. Real Keystore, Play UI, Firebase attestation and purchase/refund behavior still require physical-device license-tester evidence. The backend currently returns 404 for billing routes; no production or real-charge readiness is implied.

The backend does not distinguish normal expiry from revocation in an inactive response. Inactive responses clear native authority immediately, even during background/timeout. An in-flight inactive result may therefore discard unsettled historical bonus; preserving ambiguous authority would permit a known refund to grant paid time. The twelve-hour cache freshness limit can also require online recovery after a longer absence; no bonus is invented when recovery cannot authenticate the historical window.
