# Shop preview verification — 2026-09-26

## Result
Local preview verified; real-money activation remains disabled. This is not purchase, refund, restore, trusted-clock or Android-device verification. See [the decision and release blockers](decisions/005-shop-billing-preview.md).

## TDD evidence
Commands ran from the project root.

| Stage | Command | Result |
| --- | --- | --- |
| RED: new calculation contract | `npm test -- tests/shop.test.ts` | Failed: missing `src/game/shop` before implementation. |
| RED: removed backdrop | `npx playwright test e2e/shop.spec.ts --workers=1 --project=desktop` | 2 failed: factory background present instead of `none`. |
| GREEN: calculation and fail-closed adapter | `npm test -- tests/shop.test.ts` | 7 passed. |
| RED: review follow-up | `npm test -- tests/shop-ui.test.ts` | 2 failed: art ignored nested base URL; contractor flavor copy absent. |
| Final unit suite | `npm test` | 26 files, 160 tests passed. |
| Final build | `npm run build` | Passed TypeScript and production Vite build. Existing Three.js chunk-size warning remains. |
| Final browser checks | `npx playwright test e2e/shop.spec.ts --workers=1` | 4 passed: English/Spanish on desktop/Pixel 7, port 4173. |
| Whitespace | `git diff --check` | Passed. |

Calculation cases cover exactly 12 hours, expiry overlap, invalid windows, reversed interval clocks, offline cap/efficiency, prestige independence, unchanged taps and fixed rewards, and ignored paid fields in imported saves. The adapter always returns unavailable/null. Browser checks dispatch untrusted pending/canceled/purchased events and verify no grant; these are rejection tests, **not a simulation of real Google Play Billing**.

## UI evidence
- Shop follows Olympus, has a stable warm glow, and is localized.
- Purchase disabled; restore reports unavailable; price labeled USD 2.00 base reference price.
- Browser checks additionally resize to 320×568, 375×812 and 844×390: no document overflow, reachable Shop control, at least 44×44 CSS-pixel hit area. Narrow screens scroll the navigation rather than shrinking targets.
- Free workshop still responds to taps; backdrop pseudo-element has no image.
- Reduced motion enabled in these tests; glow has no animation. Existing dark-mode/native system-font scaling were not newly verified.
- Screenshots visually inspected: `test-results/shop-desktop.png` and `test-results/shop-mobile.png`; Spanish variants end in `-es.png`. The card scrolls vertically on smaller screens.

No dependencies, credentials, native SDK settings or remote resources were changed. No commit, upload or Play Console operation was performed by the implementation agent.
