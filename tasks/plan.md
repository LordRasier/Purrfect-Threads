# Billing preparation plan

## Outcome

Prepare the Android SDK/build prerequisites and a server environment handoff while
keeping purchases unavailable. The user authorized local preparation and will
deploy the Auraliax backend and run its migration themselves.

## Current slice

1. Add opt-in Android Firebase/App Check/Billing prerequisites without enabling
   purchases, analytics, automatic sign-in, or changing AdMob behavior.
2. Validate the Purrfect Firebase configuration and compile/test the Android app.
3. Document exact server variables and safe one-time secret generation. Do not
   access the server, copy credentials, or activate billing.
4. Review the changes and report measured results and remaining release gates.

## Acceptance

- Default builds preserve existing gameplay and disabled purchase UI.
- Opt-in prerequisites use the correct Firebase app/package; invalid config fails
  clearly rather than selecting the other Android client in google-services.json.
- Secrets stay out of Git, Android assets, screenshots, and command output.
- Unit tests, web build, and Android debug build have recorded results.

## Deferred release gates

Native recoverable identity, purchase flow, server verification, offline expiry,
Play service-account permissions, store product setup, privacy disclosures, and
license-tester end-to-end evidence remain separate work. No production deployment
or real-money purchase is authorized by this local preparation slice.
