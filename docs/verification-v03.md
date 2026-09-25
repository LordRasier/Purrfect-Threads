# Purrfect Threads 0.3 — verification

## Scope and result

The seven requested changes are implemented: growing crew-card decorations, an independently scrolling cozy tablet, always-visible yarn, interactive embroidered achievements, a full-screen Olympus realm, more inspect-before-buy upgrades, cozy music, and saved English/Spanish settings. Olympus keeps the real workshop in a playable dock instead of hiding the yarn or creating another simulation.

## Automated checks

- `npm test`: **69 unit tests passed** across 10 files.
- `npm run build`: strict TypeScript and production compilation passed.
- `npm run test:launcher`: **1 local-server test passed**, including audio MIME type and traversal rejection.
- `npx playwright test`: **42 browser tests passed** (21 scenarios on desktop and Pixel 7 emulation). An additional narrow-viewport recovery regression was then verified separately on each profile with `npx playwright test e2e/experience.spec.ts --project=mobile --grep "save recovery"` and the corresponding `--project=desktop` command: **2 more passed**, for **44 browser checks total**. No application code changed after the complete 42-test run.

The deterministic tests cover critical odds/boundaries, additive probability, whole-manual-reward ×3, no RNG on rejected pulls, one-time multiplier stacking, prestige reset, v1/v2 migration, valid and invalid v3 settings, language coverage/caching, number formatting, and audio unlock/pause/rejection/disposal races.

Browser coverage includes scrolling without losing the yarn, growing card motifs, all 12 compact notes, no purchase on inspection/cancel, explicit confirmation, patch details/focus return, full-screen Olympus/back/Escape, minimum 44px yarn target, Spanish selection and reload, independent music settings, and a keyboard gesture loading bundled music. Existing natural-input opening, offline credit, import/export, backups, duplicate-tab ownership, BFCache and three-prestige simulation tests remain.

Tests were observed failing before implementation. Additional review-driven checks caught untranslated statue captions, missing static Spanish strings, misleading note labels, repeated dictionary work, and keyboard-only audio activation; behavior fixes followed failing regression tests. The prior tab-only prestige test was updated to use **Back to workshop** before opening the collection; assertions were retained, not removed. Likewise, keyboard navigation now deliberately focuses the scrollable tablet before its buttons.

## Review and visual checks

An independent read-only review verified economy, migration, audio, locale and UI integration, then rechecked the fixes. Parent verification re-ran the relevant checks. RDD was disabled; no remote review lifecycle or publication was started.

The live v2 workshop loaded without reset: 374 working cats and chapter 2 were retained. The framed roster and full-screen Olympus were inspected in the actual in-app browser; rendered browser-test screenshots cover the board, patches, Olympus and mobile workshop. Screenshots use seeded fixtures except the live manual inspection; they do not establish natural progression speed.

Responsive/browser coverage: desktop Chrome, Pixel 7 touch emulation, and layouts at 1440×1000, 961×854, 375×812, 812×375 and 320×568. Automated settings checks verify English/Spanish switching and persistence.

## Performance and limitations

- This iteration did not run a new controlled hardware FPS benchmark. The prior v0.2 Ryzen 5 3400G / RX 5500 XT result is historical evidence in `verification-v02.md`, not a v0.3 measurement.
- No physical phone, iOS audio codec support, battery or thermal test was performed. Emulation does not validate the 30 FPS phone target.
- The lazy Three.js chunk is about **580 kB minified / 148 kB gzip**; Vite's >500 kB warning is documented, not hidden. Main JS is about 90 kB / 29 kB gzip. Artwork is 2.38 MB and optional music is 3.24 MB, both bundled locally.
- At most 24 cats, 18 card motifs per producer, bounded particles and one renderer are used. The Olympus background is a bitmap, not a new real-time 3D temple.
- Prices, new multipliers, retention and revenue still require player testing. No ads, payments, paid randomness, analytics, accounts, native packaging or store publishing were added.

See [implementation notes](implementation-v03.md), [asset provenance and generation prompt](assets-v03.md), and [music source/license](music-assets.md).
