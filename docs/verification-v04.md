# Purrfect Threads 0.4 — verification

## Delivered behavior

- Exactly one golden paw per eligible restart, regardless of excess yarn. Current-run goal: `100000 * 2^completed chapters`; a reset clears that run's production. Historical production cannot trigger another reset immediately.
- Twelve distinct procedural 3D cat gods, purchased gold/glow state, inspect-before-buy dialogs, and permanent once-only effects. Existing talent IDs and already-earned rewards survive migration.
- Header/title/back/settings alignment, accessible icon-only back control, balance integrated into the header, and restart controls visible beside the workshop dock. Desktop gallery fits without scrolling at 961×854 and 1280×720. Narrow/short layouts can scroll.
- English and Spanish text, singular paw labels, and safe display of large Decimal balances.

## Automated evidence

| Check | Result |
| --- | --- |
| `npm test` | 91/91 unit tests, 12 files |
| `npm run build` | Strict TypeScript and production build passed |
| `npm run test:launcher` | 1/1 passed, local assets and traversal protection |
| `npm run test:e2e` | 50/50 passed, desktop Chrome and Pixel 7 touch emulation |

The complete browser suite passed before a final bounded hardening change: cleanup if renderer initialization fails after context creation, explicit accessory mesh groups, and Decimal-safe paw balance labels. After those changes, `npm run test:e2e -- e2e/olympus.spec.ts` passed **6/6** across both profiles; the 91-test unit suite, strict build, and independent focused review also passed. No economic behavior changed after the complete suite. These six checks repeat included scenarios rather than representing six additional unique scenarios.

New unit coverage includes fixed rewards at large balances, fresh-run eligibility, no immediate repeat reset, three accelerated chapters, exact producer-pair modifiers, additive-within-Hephaestus upgrade scaling, whole-touch Zeus/Dionysus multipliers, twelve-talent achievement threshold, old earned badge preservation, v3-to-v4 migration and reload, renderer sizing/disposal/failed initialization, actual accessory meshes, and ownership material reversal. Tests were observed failing before the corresponding implementations.

Browser cases verify all twelve statue targets and a single statue canvas, no desktop scroll, visible 44px-or-larger yarn target, icon-only back control with accessible name, details without accidental purchases, unaffordable and purchased modal buttons, one-paw payout after a large hoard, focus return, repeated navigation, and a Spanish legacy save retaining its balance/blessing through migration. Existing opening, collection, saving, import, offline credit, reduced motion, mobile controls, and single-writer lifecycle cases remain covered.

## Independent review and manual checks

Independent read-only review identified and closed the stale three-talent achievement threshold and missing explicit WebGL context release. Follow-up checks cover renderer sizing, initialization cleanup, exact talent effects, and legacy preservation. RDD remained disabled; no remote execution, review publication, or push occurred.

The actual in-app-browser player save was reloaded, not reset or seeded: chapter 2, 376 working cats, roughly 2.1M yarn, Welcome Home, the existing golden paw, and Spanish settings were retained. The 961×854 Olympus layout was inspected visually. Zeus's Spanish details opened without purchase, closed back to its statue, and the console contained no warnings/errors at that check. Automated screenshots use isolated fixtures; they do not represent natural progression speed.

## Limits

- No new controlled FPS benchmark was performed. Available PC: AMD Ryzen 5 3400G / Radeon RX 5500 XT. Historical FPS results are not presented as v0.4 measurements.
- No physical phone performance, battery, thermal, or iOS test was performed. Emulation does not validate the 30 FPS hardware target.
- The shared Three.js chunk is approximately 566 kB minified / 142 kB gzip; its >500 kB Vite warning remains visible. Main JS is about 95.5 kB / 29.9 kB gzip; the new Olympus module is about 8.6 kB / 3.4 kB gzip. No new runtime dependency was added.
- The twelve statues use one additional renderer; the miniature workshop retains its original renderer and simulation. The temple backdrop remains an illustration, not a fully modeled 3D temple.
- The fixed reward removes hoarding-based extra payouts, but **chapter duration, long-term balance, retention and revenue are not validated**. The doubling goal is an initial tuning decision, not evidence of addictive or commercially successful play.

See [design decision](decisions/003-fixed-prestige-and-pantheon.md) and [3D asset provenance](assets-v04.md).
