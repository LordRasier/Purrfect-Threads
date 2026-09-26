# Shop preview: paid activation remains disabled

## Status
Local preview implemented on 2026-09-26. **Not a working purchase integration or a monetization release.**

## Decision
Expose a bilingual Shop after Olympus, with an optional Meowtastic Crew / Equipo Miautástico product and USD 2.00 **base reference price**. Keep purchase disabled and restore explicitly unavailable on both web and Android. The free game remains unchanged. The factory backdrop is no longer rendered.

The repository has Capacitor and advertising support, but no Play Billing bridge, product catalog configuration, account backend, purchase verification, or entitlement storage. Adding a button that grants power would misrepresent payment and trust editable client data. No new SDK, credentials, external service, remote operation, or Android configuration was added.

## Local calculation contract

`src/game/shop.ts` contains calculation inputs, **not payment evidence**. `CrewEntitlement` is an immutable time window for the proposed product ID `meowtastic_crew_12h`; that ID has not been configured or verified in Play Console.

- A single boost doubles automatic output for exactly 12 real hours from confirmed payment. There is no stacking or extension.
- `advance` and `applyOffline` accept an optional entitlement. They integrate base output plus the interval overlapping the boost, including partial expiry. No entitlement is supplied by the running preview.
- Taps (including the production-derived Helping Paws bonus) and the fixed +5 falling-cat reward use unboosted values.
- Existing offline rules remain: the first eight hours after the checkpoint earn 50%, or 65% with selected Roman. The 12-hour entitlement clock does not pause or extend because of that cap.
- Entitlement is separate from game progress, so prestige does not reset the calculation input. Game save import cannot create one; `decode` ignores unknown paid fields. There is no paid persistence or restore implementation yet.

`src/platform/billing.ts` is a fail-closed adapter: purchases and restore return `unavailable`; entitlement always returns `null`. It accepts no purchase events, receipt objects, local flags, or save data. The shape of a TypeScript object is not authentication.

## Launch blockers

Before enabling purchases, implement and independently verify all of the following:

1. **Play product and native flow.** Configure the consumable one-time product, USD 2.00 base price and regional offers in the authorized Play application. Implement a supported Google Play Billing bridge; query fresh product details and display the actual formatted local price. Handle cancel, pending, disconnection and unavailable products without granting anything. Query purchases on connection/resume and account for completed pending payments.
2. **Server authority.** Establish authenticated account binding and verify tokens server-side against the expected app, product and purchaser. Grant only verified `PURCHASED` transactions, deduplicate tokens, record the confirmed purchase time once, and durably grant before consuming/acknowledging. Delayed callbacks and restores must not restart the 12-hour clock. An account-level atomic active-entitlement check must reject another purchase while active, including concurrent devices; client disabling alone is insufficient.
3. **Persistence, offline time and recovery.** Restore the same server entitlement across restart, reinstall and devices, separately from exportable saves. Before `loadGame` credits offline earnings, authenticate the cached entitlement and establish a trusted time policy. A signed cache alone does not prevent device-clock rollback or replay. Define bounded offline validity, trusted clock anchors, reboot/rollback handling and reconciliation; never claim a JavaScript timestamp is fraud-proof. Wire the verified entitlement into online/offline calculation, the displayed rate and active countdown only after this boundary exists.
4. **Refunds and testing.** Reconcile refund/revocation notifications and voided purchases; remove remaining access and define handling for already-earned offline value. Test license-tester purchase, pending-to-paid, cancel, duplicate callbacks, process death, reinstall, offline expiry, clock rollback, refund and multi-device purchase races. Recheck privacy/Data safety disclosures and release signing. Do not enable through a client debug flag.

These are pending requirements, not implemented guarantees. Offline play necessarily delays learning about refunds; the final offline entitlement policy needs an explicit product/security decision.

## Alternatives
- Client-only receipt or editable save flag: less infrastructure, but insecure grants, replay and refund/restore gaps; rejected.
- Live native billing without secure verification: can charge a customer before reliable fulfillment exists; rejected.
- Safe preview: honest and playable now, but cannot collect payment; selected.

## Official evidence
Google recommends backend token verification and deduplication, grants only for `PURCHASED`, and server-side consumption/acknowledgment. It also documents revocation handling for voided purchases. [Billing security](https://developer.android.com/google/play/billing/security).

The billing integration guide covers product details, purchase callbacks, querying purchases and pending transactions. These flows must be implemented before activating the product. [Play Billing integration](https://developer.android.com/google/play/billing/integrate). Reviewed 2026-09-26; no Play Console access was performed.

## Art provenance
`public/art/meowtastic-contractors.png` was generated with the built-in image-generation tool on 2026-09-26: three original chibi contractors with sunglasses, yellow hard hats and denim; ginger cat with blueprints, gray cat with tools, and black-and-white cat with plans/toolbox; soft pastel pencil style, transparent background. The image is decorative product artwork, not a payment provider logo. No third-party character reference was used.

### Exact generation prompt

Premium game store illustration: exactly three adorable chibi contractor cats posing confidently together like a super-cool efficient crew, all wearing small dark sunglasses, tiny yellow worker hard hats and blue denim overalls. Warm cozy vintage 2D cartoon, soft pastel colored pencil texture, clean expressive rounded shapes, NOT photorealistic. One ginger cat holding rolled architectural blueprints, one fluffy gray cat with tool belt and small wrench, one black-and-white cat holding open blueprint plans and a toolbox beside its paws. Cute subtle smug smiles, professional but hilariously self-important team, full bodies, anatomically coherent paws, no human hands. Strong compact group composition, readable at small size, cream peach sage muted blue palette. Isolated on truly transparent background with no scene, no text, no lettering, no watermark, no frame. Wide 3:2 composition, generous clear margins, premium polished cozy game character art.
