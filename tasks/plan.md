# Account integration plan

## Outcome
Connect the shop ACCOUNT card to explicit native Google identity in opt-in Android builds only. Purchases remain unavailable; no identity data or tokens cross into JavaScript.

## Current slice
1. RED/GREEN: account controller and localized card; native cancellation/lifecycle policy.
2. Select native account plugin through conditional source directories (default stub, no reflection or Firebase dependencies).
3. Add explicit connect/disconnect, safe busy/error/cancel states, and pre-sign-in disclosure. No startup authentication or saved-game cloud sync.
4. Verify npm tests/build/sync then default and opt-in Android tests/build sequentially. Independent review and browser verification remain parent-owned.

## Release gates
Local Android OAuth/SHA-1 configuration is now supplied and verified separately. Device sign-in, recovery and App Check proof remain unverified. Privacy policy deployment, account-deletion path, store disclosures, purchase verification and license-tester evidence remain release blockers. No remote privacy/backend edits or real-money purchases are in scope.
