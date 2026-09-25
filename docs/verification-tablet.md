# Tablet navigation verification — 25 September 2026

The workshop now uses one tablet with a dedicated play screen and internal Crew, Upgrades, Achievements, and Cats screens. Olympus is a separate sky destination reached by a vertical camera-style transition. The former floating yarn dock is removed. Economy, save format, companion unlocks, and prestige rules are unchanged.

## Navigation contract

- The yarn is interactive only on Workshop. Leaving it cancels held input; passive production continues on every screen.
- Internal screens use a 260 ms entrance transition. The sky journey takes 900 ms, preserves the departing screen, and reverses from its current visual position.
- Animation completion, not a wall-clock timeout, releases the traveling state. Reduced-motion preferences skip or finish the journey.
- Inactive destinations are inert and excluded from the accessibility tree. Home shortcuts move keyboard focus to their destination; Back or Escape returns focus to Workshop navigation.
- The Olympus renderer survives the descent and is then disposed. The hidden workshop does not render continuously.

## Verification

| Check | Result |
| --- | --- |
| `npm test` | 114 passed, 15 files |
| `npm run test:launcher` | 1 passed |
| `npm run build` | Passed; existing 575.41 KB Three.js chunk warning remains |
| `npx playwright test e2e/tablet.spec.ts` | 12 passed across desktop and mobile emulation |
| `npm run test:e2e` | 74 passed (37 desktop + 37 mobile emulation) |
| Independent code review | Approved after transition, focus, and ARIA corrections |

Tests first reproduced missing tablet navigation, overflowing narrow navigation labels, premature completion of a paused journey, and hidden keyboard focus. Added cases cover mid-flight reversal, reduced motion, active-screen input, modal inspection, and unobstructed god cards. Legacy tests now navigate explicitly to Crew before purchasing; their economic and persistence assertions remain.

Responsive cases include 320×568, 375×812, 390×844, 812×375, 844×390, 961×854, 1366×768, and 1440×1000. English/Spanish persistence remains covered. Screenshots were visually inspected at phone and desktop sizes. Tests use isolated browser saves, not the player's save.

## Evidence and limits

- [Desktop tablet](screenshots/tablet-home-desktop.png)
- [Small-phone tablet](screenshots/tablet-home-phone.png)
- [Desktop Olympus](screenshots/tablet-olympus-desktop.png)

Mobile checks are Chrome touch emulation, not physical Android/iOS validation. No new FPS claim, Safari validation, economy balancing, store packaging, or release ZIP is included in this change. RDD was off; assessment could not classify untracked files, so an independent reviewer was used. No remote operations occurred.

Rollback boundary: revert this UI navigation commit and its related browser tests/documentation together; no save migration or economic-data rollback is necessary.

## Animated crew cards — September 25, 2026

The first successful purchase of each crew in a chapter reveals a small animated cat, a catalog-specific prop, and yarn behind its controls. Further purchases retain the existing quantity-based motifs without replaying the entrance. Reloaded owned crews retain their scenery; unowned crews remain empty.

Artwork is original inline vector art and existing icons, bounded to three animated sprites per card. Decorative layers cannot receive pointer events and are hidden from assistive technology. Reduced motion and Battery saver keep them static; changing Battery saver takes effect immediately. There is no save migration or economy change.

Regression coverage includes single and bulk activation, subsequent purchases, reload, live quality changes, reduced motion, and purchase-button hit testing. Desktop and mobile-emulation screenshots were visually inspected for readable controls. Physical-device performance is not claimed.

Validation: 116 unit tests passed (16 files), 76 browser tests passed (desktop and mobile emulation), and the production build passed. The existing Three.js chunk-size warning remains.
