# Purrfect Threads 0.2 — verification

## Requested changes

All six browser comments are implemented: compact one-row hiring, ten crew types, a separate cozy upgrade board, a separate 36-achievement scrapbook, a three-statuette Olympus for permanent talents, 75-yarn first hire, and richer original scene geometry. Save migration preserves existing player progress.

## Automated verification

- `npm test`: 49 unit tests passed across six files.
- `npm run build`: strict TypeScript check and production compilation passed. The lazy 3D chunk remains approximately 580 kB minified / 148 kB gzip; Vite's >500 kB warning is documented, not suppressed.
- `npm run test:launcher`: one test passed.
- `npm run test:e2e`: 32 browser tests passed, 16 scenarios each on desktop Chrome and Pixel 7 emulation.

New tests cover the 74/75-pull affordability boundary, all ten purchases, 36 unique categorized achievements, command-triggered persistent unlocks, repeat upgrade rejection, counters, v1 migration, invalid v2 data, UTF-8 copy, compact row alignment/height, the separate board and Olympus, achievement filtering, and simultaneous achievement/action feedback.

Regression tests were updated for the authorized price change, not removed. Existing lifecycle, save recovery, offline, touch/keyboard, bulk-equivalence, and three-prestige tests remain. Model tests now verify named detail groups and ensure geometry merging emits no warnings/errors. Tests were observed failing before new behavior/fixes, including the notification overwrite and a two-pixel narrow-layout overflow.

An early attempt to run two Playwright commands concurrently collided in the shared trace output directory; this caused a test-artifact ENOENT unrelated to gameplay. Subsequent required browser checks run serially. The independent reviewer approved economics/migration, scene geometry, and the final UI fixes.

## Visual and manual checks

The live browser successfully loaded the old save into v2, retaining 74 working cats and the existing chapter/talent/collection state. The compact roster, chalkboard, and Olympus were visually inspected at the user's approximately 961×854 layout. No browser warning/error logs were observed after the final scene merge fix.

`docs/screenshots/v02-*.png` contains seeded test fixtures for the roster, board, Olympus, and achievement filter. They demonstrate layout, not natural progression speed. Browser regression coverage includes 1440×1000, 961×854, 375×812, 812×375, and 320×568, keyboard navigation, and Pixel 7 touch emulation.

## Current desktop performance sample

On the same Windows PC (AMD Ryzen 5 3400G / Radeon RX 5500 XT), the in-app browser rendered 24 visible cats with the richer scene at **59.9 FPS average** over a 45.0459-second foreground interval. Actual frame metrics increased from 4,763 at 79,561.9 ms to 7,460 at 124,607.8 ms: 2,697 / 45.0459 = 59.87. The sample included opening the achievement scrapbook; scene counters reported 363 draw calls and 312,916 triangles. No browser warnings/errors were observed. This is an average sample, not a minimum-FPS or thermal benchmark.

## Remaining limits

- No physical phone has been measured. Mobile emulation does not validate the 30 FPS hardware target, battery life, or thermal performance.
- The 75-pull opening and ten-tier economy are initial values. Retention, enjoyment, progression pacing, and commercial performance need player tests.
- Original permanent talents and chapter upgrade effects remain unchanged. The first five crew identities retain stable save IDs despite friendlier display names.
- No ads, payments, analytics, downloaded asset packs, network accounts, native packaging, or remote publication were introduced.
- Previous v0.1 verification remains in `verification.md` as historical evidence, not a current-version performance claim.
