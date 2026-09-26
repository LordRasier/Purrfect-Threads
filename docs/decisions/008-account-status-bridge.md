# Connect opt-in native identity through a status-only account bridge

## Status

Implemented locally on 2026-09-26; device proof and privacy/deletion release gates pending.
Extends [the native foundation decision](007-native-identity-foundation.md).

## Decision

Register a narrow `GoogleAccount` Capacitor plugin with explicit connect/disconnect and inert
status methods. Gradle selects the real native implementation only for the existing opt-in flag;
the same class name selects an unavailable stub in default builds. No reflection or SDK runtime
is added to the default app. Web also returns unavailable.

The shop discloses account identifier processing before sign-in and keeps account status separate
from billing. The bridge returns fixed status/outcome codes, never user identifiers or credentials.
No startup account creation, cloud save sync, purchase linking or entitlement grant is performed.

Destruction releases the UI completion immediately, but does not unlock an in-flight Firebase
mutation. When the exchange settles, an abandoned identity is cleared before allowing retry.
This prevents an old Activity from signing in after the next account operation has started.

## Alternatives

- Reflection avoids a stub source directory but moves configuration failures to runtime; rejected.
- Unlock immediately on destruction: responsive but unsafe because Firebase credential exchange
  cannot be cancelled and could overwrite a newer session; retain busy until settlement instead.
- Pass UID/email/tokens to JavaScript: unnecessary for the account card and expands exposure;
  return only status codes.

## Consequences

Cancellation may briefly leave a recreated Activity busy; the card provides status refresh.
Disconnect is not deletion. Opt-in builds require privacy/account-deletion and physical-device
verification before production distribution. Purchases remain unavailable regardless of identity.

See [implementation and release gates](../billing-foundation-android.md).
