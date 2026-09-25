# Verification — 0.5.0

## Scope

Six illustrated home companions, selected-only economic bonuses, harder permanent unlock challenges, localized progress cards, and the selected portrait on the workshop cushion. Existing earned companions and selection are retained; save schema remains version 4.

## Test-first evidence

- Companion economy: the initial seven failing tests became green after catalog, unlocks, bonuses, and persistence integration. Additional lower-boundary and multi-condition coverage uses real accepted taps and actual purchase/reset/offline commands.
- UI: three failures against the old collection panel became green with six new personalities, challenge/buff copy, card artwork, and Spanish translations.
- Scene: a new GPU-upload assertion caught `Texture.version === 0`; `texture.needsUpdate = true` fixed the missing upload. Stale-load, selected-load failure, and disposal tests pass.
- Integration: a touch-earned unlock originally showed only the achievement toast. Centralized companion announcements now include the name, persist the unlock, and update the cushion without reloading.
- Review regression: importing a richer collection falsely announced imported companions as newly earned. Notification baselines now reset on state replacement; an exact-toast browser assertion verifies this.
- Bulk boundary: a transaction crossing 4,999 → 5,000 cats can auto-select Lola mid-purchase. A nonmutating quote forecast now prices subsequent units with her discount, matching separate buys and Max at the same boundary. The forecast stops checking unlocks once selection is fixed.

## Checks

| Check | Result |
| --- | --- |
| Unit tests | 113/113, 15 files |
| Strict TypeScript and production build | Passed |
| Local launcher | 1/1 passed |
| Browser regression | 62 scenarios verified: 60 passed in the full run; 2 passed on targeted rerun after fixture correction |
| Independent code review | Approved after texture, import-notification, and quote hot-path fixes |
| Native RDD | Off / unmanaged; risk assessment unavailable due to untracked inventory, treated as high and independently reviewed |
| Asset validation | All six WebPs are 512 × 512 with alpha; combined 359,608 bytes |

The initial full browser run found a legacy test fixture that expected 10 yarn/sec while explicitly selecting Kira, whose new bonus correctly produces 11. The storage-failure test now uses an empty collection to isolate offline accounting; both desktop and mobile reruns passed. No production workaround was added for the outdated expectation.

Browser fixtures use isolated saves. New coverage exercises empty fresh cushions, harder challenge requirements, successful portrait loading, keyboard companion selection, live unlocks, reload persistence, Spanish text, and import-notification correctness. Existing suites cover touch input, save recovery, lifecycle ownership, achievements, purchases, and prestige.

Manual inspection of the compiled preview at 961 × 854 confirmed the user's preserved Luigi selection, the new illustration on the cushion, Spanish companion cards, and no captured console warnings/errors. No purchase, selection change, import, or reset was performed in the user's live save.

## Visual evidence

- [Desktop](screenshots/v05-companions-desktop.png)
- [Mobile emulation](screenshots/v05-companions-mobile.png)
- [Artwork and provenance](assets-v05.md)

## Limitations

- Mobile tests are Pixel 7 touch emulation in installed Chrome, not a real-phone benchmark. No new controlled FPS measurement was performed.
- Three.js remains a 575.41 KB minified / 144.43 KB gzip shared chunk; Vite reports its existing 500 KB warning.
- Companion art is 2D, not an articulated 3D character. It faces the camera over the real 3D cushion.
- Harder requirements and modest buffs are authored starting values, not validated retention, balance, revenue, or commercial viability. Playtesting remains necessary.
