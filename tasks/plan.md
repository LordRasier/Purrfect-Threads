# Native purchase integration plan

## Outcome
Complete an opt-in internal-test purchase path for Meowtastic Crew while default builds remain unavailable. Firebase/App Check/Play credentials stay native; server verification owns paid grants and consumption. No production release, real charges or remote server access.

## Implementation
1. Pure tested purchase callback, lease, wire and lifecycle policies.
2. Fixed HTTPS transport, authenticated no-backup cache and native BillingClient adapters.
3. Native exactly-once paid-time settlement, safe background deferral and localized purchase/restore/status/privacy UI.
4. Strict RED/GREEN, web verification and sequential default/opt-in Android debug, R8 release and lint checks.

## Release gates
The user confirmed https://www.auraliax.com/; billing routes currently return 404. Operator activation, Play product/tester configuration, user-controlled signing/upload and license-tester/device proof remain necessary. Privacy institution/store declarations and retention/account deletion need review before production. Independent review and browser checks are parent-owned; no remote credentials are used by this implementation.
