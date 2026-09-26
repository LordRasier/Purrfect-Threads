# Native-only Google identity before purchase integration

## Status

Local foundation implemented on 2026-09-26; account UI and device proof are pending.

## Decision

Keep recoverable Google/Firebase identity behind the existing opt-in Android foundation flag.
Compile SDK adapters from a conditional source directory; leave the default app free of Firebase,
Credential Manager, and Billing dependencies. Retain the Firebase auto-init manifest removal.
Only explicit native sign-in/sign-out initializes Firebase, with Play Integrity App Check installed
before Auth. Status is local session state, never payment evidence.

A process-scoped, main-thread coordinator serializes identity changes and rejects token callbacks
from an older session. Tokens remain inside native code. The current app registers no identity
plugin and exposes no account UI; the existing shop stays fail-closed.

## Alternatives

- A JavaScript token bridge is easy to wire but broadens credential exposure; rejected.
- Always package SDKs and branch on a boolean simplifies compilation but weakens default runtime
  isolation; use conditional sources/dependencies instead.
- Wire an account screen now for device testing: useful later, but adds lifecycle/UI scope before
  signing/OAuth prerequisites and native policy review; deferred.

## Consequences

This establishes an internal seam, not a working customer-facing identity or purchase feature.
Future callers must obey the main-thread/explicit-user-action contract and handle `BUSY` without
claiming successful sign-out. A reviewed fixed-destination backend client must consume fresh tokens
internally, verify server responses, and never turn identity alone into entitlement.

See [implementation, official sources, and release gates](../billing-foundation-android.md).
