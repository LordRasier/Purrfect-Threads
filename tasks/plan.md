# Billing preparation plan

## Outcome

Prepare a native-only, recoverable Google/Firebase identity foundation while
keeping purchases unavailable. No UI or Capacitor entry point is connected.
The user will deploy the Auraliax backend and run its migration themselves.

## Current slice

1. Test pure identity orchestration before implementation: lazy initialization,
   App Check before Auth, cancellation/retry, mutation serialization, stale tokens.
2. Add a conditional native Credential Manager/Firebase adapter, with no token
   exposure to JavaScript, no HTTP client, no startup registration, and no analytics.
3. Run web tests/build and Android default/opt-in tests/build sequentially; verify
   Firebase auto-initialization is absent from the default merged manifest.
4. Independently review and document implementation separately from device proof.

## Acceptance

- Default builds preserve existing gameplay and disabled purchase UI.
- Opt-in prerequisites use the correct Firebase app/package; invalid config fails
  clearly rather than selecting the other Android client in google-services.json.
- Secrets stay out of Git, Android assets, screenshots, and command output.
- Unit tests, web build, and Android debug build have recorded results.

## Deferred release gates

Account UI/lifecycle integration, device Google sign-in and App Check proof,
SHA-1/Android OAuth signing configuration, purchase flow, server verification, offline expiry,
Play service-account permissions, store product setup, privacy disclosures, and
license-tester end-to-end evidence remain separate work. No production deployment
or real-money purchase is authorized by this local preparation slice.
