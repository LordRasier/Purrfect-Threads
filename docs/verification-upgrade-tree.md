# Upgrade tree verification

Implemented locally on `feat/android-offline-package`, baseline `a049a13`. Source frozen after the touch-sequence fix and final checks. No commits, remote actions, billing changes, native packaging changes, or artwork changes.

## TDD evidence

| Check | Observed result |
| --- | --- |
| Initial RED: `npm test -- tests/upgrade-tree.test.ts` | 10 failures before root, gates, migration, and gated hold implementation. |
| Initial GREEN: `npm test -- tests/upgrade-tree.test.ts tests/input.test.ts` | 13 passed. |
| Initial browser RED | Unpurchased hold repeated; status margins were 0 rather than 16px. A later hint assertion caught an old refresh setter overwriting the gated keyboard hint. |
| Expansion RED: `npm test -- tests/producer-upgrades.test.ts` | 12 failures before fifty producer upgrades existed. |
| Expansion GREEN: `npm test -- tests/producer-upgrades.test.ts tests/upgrade-tree.test.ts tests/localization.test.ts` | 29 passed after catalog/engine changes. |
| Board RED: focused `small icon` browser test | Old renderer lacked new pin positions; the first interactive implementation later exposed hover returning after drag release. |
| Cleanup RED: desktop `small icon` browser test | A sub-threshold gesture released outside the viewport left drag state active and subsequent hover timed out. |
| Touch RED: mobile `small icon` with real `tap()` | A tap after finger pan emitted pointer/touch events but no compatibility click. Immediate activation during pointerup also failed; deferring explicit tap activation until the native sequence ends fixed fresh and post-drag taps. |
| Layout RED: `npm test -- tests/upgrade-tree.test.ts` | Inner fan notes violated the explicit clearance test; increasing the inner radius fixed it. |
| Final `npm test` | 184 passed across 28 files. |
| Final `npm run build` | Passed; existing Three.js chunk-size warning only. |
| Final `npx playwright test e2e/upgrade-tree.spec.ts --workers=1 --project=desktop --project=mobile` | 8 passed on local port 4173. |
| `git diff --check` | Passed. |

The initial implementation also passed all 34 pre-existing browser regressions in the `game`, `lifecycle`, `experience`, and `expansion` specs. Those broader cases were not rerun after the 63-node refinement; the focused tree suite and full unit suite were rerun. Existing count fixtures now expect 63 UI nodes while the retained milestone catalog still has thirteen. Historical screenshot artifacts from the earlier broader run were restored, not included as unrelated changes.

## Coverage and UI inspection

The final screenshots are retained at `test-results/upgrade-tree-desktop.png` and `test-results/upgrade-tree-mobile.png` and manually inspected. The central root, small icon notes, pastel colors, red strings, and keyboard focus are visible. The board intentionally pans on phones instead of shrinking 48px touch targets; distant branches are not all visible at once.

Tests verify all 63 notes, graph connectivity/no cycles, non-overlap and canvas bounds, and both endpoints of all 62 strings within 2px of pins. They cover mouse drag, actual emulated finger drag/tap, suppressed drag activation, outside-viewport release, body-portal hover/focus tooltips, focused-node centering, Escape dismissal and navigation cleanup. A click counter verifies fresh/post-drag touch taps activate exactly once, and the yarn balance verifies no accidental purchase. Fresh and legacy reloads, root purchase/hold input, prerequisite dialogs, no document-width overflow, and 16px shop-status margins are checked. Spanish details remain reachable at 375×667 and 740×375 with reduced motion enabled.

Unit tests exercise all ten producer branches independently with Forge of Paws active, five additive percentage points rather than compounding, ascending/scaled prices, skipped-tier rejection, all-63 purchase/save/reset, and Olympus persistence. Version 1–5 migration preserves old owned leaves, counters, yarn and production; version 6 never re-grants upgrades.

## Review boundary and limitations

Self-review found no remaining scoped correctness or accessibility blocker. Static catalog markup introduces no new dependency or remote data. Parent review/assessment remains required. Automated arithmetic does not establish economic balance: fifty small bonuses coexist with twelve larger legacy milestones, and purchase-count achievement pacing changes. Actual perceived value and pacing need playtesting. Touch behavior is browser-emulated, not tested on a physical Android device. Save v6 cannot be opened by older releases; the compatibility tradeoff is documented in decision 006.
