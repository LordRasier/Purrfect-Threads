# Prototype verification — 24 September 2026

## Result

Version 0.1 implements the browser prototype. Automated checks, manual opening play, and a desktop performance sample are recorded below. **Real-phone performance, long-session retention, commercial viability, and store packaging are not validated.**

## Reproducible checks

| Command | Result | Scope |
| --- | --- | --- |
| `npm test` | 39 passed, 5 files | Economy, progression, persistence, input scheduling, model bounds |
| `npm run test:launcher` | 1 passed | Static files, missing files, traversal rejection, method restrictions |
| `npm run test:e2e` | 28 passed | 14 scenarios each on desktop Chrome and Pixel 7 browser emulation |
| `npm run build` | Passed | Strict TypeScript check and production bundle |
| `npm audit --audit-level=moderate` | 0 vulnerabilities reported | Installed dependency tree at verification time |

Environment: Windows, Node.js 24.12.0, npm 11.6.2. The production build includes all runtime assets locally. The renderer is a lazy-loaded chunk of approximately 579 kB minified / 147 kB gzip. Vite reports its normal >500 kB chunk-size warning; there are no compilation errors. This warning remains visible rather than being suppressed.

## Required behavior covered

- Time-based production at different simulated frame rates; all purchases reject insufficient funds without negative balances.
- ×10/Max versus repeated singles, including Decimal rounding boundaries around 256 owned purchases and very large magnitudes.
- A shared 5 Hz manual/held input rate at 1, 3, 30, 60, and 144 simulated FPS; simultaneous pointer/keyboard sources and release handling.
- Offline 50% production, eight-hour cap, no duplicate credit on load/resume, backward-clock protection, and disjoint active/offline time when writes fail.
- Versioned round trips, malformed saves, valid-backup recovery, corrupt-copy preservation, import validation, exports, and unavailable-storage feedback.
- Exact chapter reset/preservation boundaries, one-time talents/upgrades, Helping Paw, gated Master Tools, retained coats, and three accelerated prestige cycles. The three-cycle simulation uses real production and purchase commands after a 15-yarn starting fixture; it is not a human pacing study.
- Mouse/keyboard and emulated touchscreen beginning-to-first-purchase flow; modal Escape; navigation; reduced motion; visible controls of at least 44×44 CSS pixels at 1440×1000, 375×812, 812×375, and 320×568; no horizontal overflow at those sizes.
- Single-writer ownership: second tab, BFCache return, corrupt-recovery return, a file import paused across departure, and departure while the 3D module is still loading.

BFCache regression cases synthesize the relevant browser lifecycle events. They test ownership logic deterministically, not every browser's eligibility heuristics for placing a page in BFCache. Mobile browser emulation is not a real Android or iOS hardware result. Only Chrome-family browsers were exercised; other modern browsers are compatibility targets, not verified platforms.

## Tests-first and independent review

Economy, persistence, prestige, input, model contracts, and browser interaction expectations were written and observed failing before their implementations/fixes. Review-driven regressions were also reproduced before correction: bulk-buy rounding differences, stale imports, storage-status errors, held input cancellation, BFCache ownership, delayed renderer imports, and collection milestones after reset.

An independent read-only reviewer examined the economic/save boundaries, application lifecycle, and local launcher. Required findings were corrected with regression tests. The final ownership and collection-goal fixes were approved. No remote repository, pull request, deployment, or store operation was performed. RDD mode was off; no RDD lifecycle was started.

## Manual opening play

The compiled build was opened through the included Node launcher on a separate local origin with an empty save, without injected currency or workers. Fifteen UI clicks earned exactly 15 yarn. Adopting the first kitten unlocked Biscuit, displayed one worker and one yarn/second, and automatic production increased the stash to 40. Reload preserved the worker and stash. This check used browser UI actions, not direct calls to the economy.

The desktop and narrow layouts were visually inspected, including the coral yarn ball, chibi mascot, populated workshop, building progression, and shop. Screenshots in `docs/screenshots/` show a deliberately seeded late-game test fixture; they are not evidence of naturally reaching that state during the manual opening test.

## Desktop performance sample

- Machine: **AMD Ryzen 5 3400G / AMD Radeon RX 5500 XT**, Windows.
- Browser: Codex's Chromium-based in-app browser, approximately 946 CSS-pixel-wide app pane, normal animation, 24 visible cats.
- Instrument: actual `requestAnimationFrame` count divided by wall-clock elapsed time, exposed by the scene's read-only DOM metrics; no clamped simulation delta in the denominator.
- Samples: frame count 2,977 at 49,775.9 ms; 8,664 at 144,872.5 ms.
- Measured interval: **5,687 frames / 95.0966 seconds = 59.8 FPS average**.
- Scene at sampling: 355 draw calls, 298,984 triangles. No warning/error logs were observed in that browser session.

This is one foreground desktop sample, not a minimum-FPS, thermal, battery, or percentile benchmark. The approximately 60 FPS PC target was reached in this sample. The 30 FPS real-phone target remains **unverified** because no physical test phone was available. Battery saver limits rendering to 12 cats and lowers pixel ratio; test it on the intended low-end devices before release.

## Deliberate limits and next release gates

1. Playtest the opening, time to first prestige, useful purchase frequency, and the value of returning. Current costs are the approved initial configuration, not a balanced economy claim.
2. Measure actual Android/iOS hardware, browser memory after a long session, touch ergonomics, and audio comfort. The current accessibility checks are targeted, not a full WCAG or screen-reader certification.
3. Validate the finite three-prestige content arc before adding more content. Keep the 10,000-purchase safety ceiling documented.
4. Only then add the separately scoped native shells, signing, store assets, commercial model, and publication workflow. This prototype contains no monetization or retention telemetry.
