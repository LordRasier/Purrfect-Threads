# Purrfect Threads — 0.5.0

A browser-first, single-player yarn clicker: pull a coral yarn ball, adopt a crew of cats, build a miniature textile workshop, and begin new chapters with permanent talents.

## Play the compiled game

1. Extract the complete release folder. Keep `dist/` and `tools/` together.
2. With **Node.js 24 or newer** installed, double-click **START-GAME.cmd** on Windows, or run `node tools/serve.mjs` from this folder.
3. Open **http://127.0.0.1:4180/**. Keep the terminal open while playing; Ctrl+C stops it.

No package installation or internet connection is needed to play the included build. Do not open `dist/index.html` directly: browsers restrict module loading from `file://`. The launcher binds only to the local computer; it does not publish the game. Use a modern browser with WebGL2 and Web Locks support. The HTML clicker remains playable if 3D initialization fails.

## What changed in 0.5.0

- Six illustrated home companions: **Kira, Mario, Roman, Luigi, Lola, and Biscocho**, with personalities and markings based on the user's pets. Kira uses the supplied tabby reference.
- The selected unlocked companion appears on the workshop's 3D cushion. A new game leaves it empty. **Only the selected companion grants a bonus**; collecting more cats does not stack buffs.
- Harder permanent challenges span tapping, crew growth, upgrades, offline production, and restarts. Collection cards show requirements, progress, and each bonus in English and Spanish.
- Existing earned companions and their selection remain unlocked at the same save indices. New conditions apply to companions not already earned; no player progress is confiscated.
- Six local transparent illustrations add 341,084 bytes. No new runtime dependency, account, download-at-playtime, or monetization was added.

| Companion | Unlock challenge | Selected bonus |
| --- | --- | --- |
| Kira | 250 current cats AND 1,000 lifetime touches | All passive output +10% |
| Mario | 12 cumulative chapter-upgrade purchases | Whole manual reward +25% |
| Roman | 100,000 cumulative offline yarn | Offline earns 65% instead of 50% |
| Luigi | 3 completed restarts | Kitten, Basket and Corner output +30% |
| Lola | 5,000 current cats | Crew prices −5%, applied before rounding |
| Biscocho | 5 completed restarts AND 5,000 lifetime touches | Triple-touch chance +5 percentage points |

Unlocks survive resets, even if the current population falls. The first unlocked companion is selected automatically; later unlocks never replace an existing selection. Roman's bonus applies only to future absences after selection, not retroactively to the absence that unlocks him. Offline time remains capped at eight hours.

See [0.5 verification](docs/verification-v05.md) and [companion artwork](docs/assets-v05.md).

### Retained from 0.4.1

- Twelve original, funny 2D cat illustrations stand on real-time 3D pedestals. Each god has distinct expressions and myth-themed accessories.
- Owned pedestals retain their golden glow; inspection, purchases, saves, and progression are unchanged.
- Locally bundled transparent WebP artwork totals 763 KB and loads only when Olympus opens. No new dependencies or online requests are required.
- See [art provenance and prompts](docs/assets-v041.md) and [verification](docs/verification-v041.md).

### Retained from 0.4

- Exactly **one golden paw per completed restart**, never more for hoarding yarn. Produce `100,000 × 2^completed chapters` yarn in the current run to unlock a restart. Spending does not reduce this run goal; resetting clears it.
- Twelve Greek cat gods with permanent talents. Select a god to inspect its effect, then confirm purchase. Owned pedestals turn gold and glow.
- Compact Olympus header, icon-only back control, balance in the header, and restart controls beside the playable workshop dock. Twelve statues fit tested desktop sizes without scrolling; phones scroll.
- Existing v1–v3 saves migrate to v4 with earned paws, talents, achievements, collection, and settings preserved. Hoarded unclaimed rewards are not carried over. **v4 saves cannot be opened by older releases.** Export a backup before changing versions.

### Retained from 0.3

- A cozy tablet scrolls independently. The yarn stays visible on desktop and phones; Olympus keeps a playable miniature workshop dock.
- Every crew card gains thematic background motifs with purchases (up to 18 decorations per row to bound rendering cost).
- All 36 achievements are now embroidered, tilted patches. Tap one for its condition and progress; category filters remain available.
- Twelve small sticky-note upgrades open a detail sheet before purchase. Triple-yarn bonuses have explicit odds, never affect passive production, and use no paid randomness.
- Mount Pawlympus is a separate full-screen realm with original generated temple artwork, permanent cat statuettes, and a back button / Escape navigation.
- Cozy background music, independent music/effects sliders, master mute, and English/Spanish language selection. Audio begins after interaction and pauses while the game is hidden.

Legacy v1/v2 saves default music to 20% and language to English. Other settings are preserved. Legacy v1 achievement counters can only recover facts still present in the save.

### Chapter upgrades

| Upgrade | Yarn cost | Effect |
| --- | ---: | --- |
| Soft Paws | 100 | Manual base ×2 |
| Lucky Bell | 300 | +5 percentage points of triple-touch chance |
| Happy Workers | 1,000 | Automatic ×1.5 |
| Four-leaf Paw | 1,500 | +5 percentage points of triple-touch chance |
| Velvet Mittens | 5,000 | Manual base ×1.5 |
| Tea Break | 8,000 | Automatic ×1.25 |
| Better Tools | 10,000 | Automatic ×2 |
| Master Tools | 25,000 | Artisan and Cloud output ×2; needs Master Knitters |
| Golden Whiskers | 50,000 | +10 percentage points of triple-touch chance |
| Purring Engine | 100,000 | Automatic ×1.5 |
| Silky Threads | 500,000 | Manual base ×2 |
| Moonlit Shift | 1,000,000 | Automatic ×2 |

Chapter chance bonuses add to a maximum of 20% (25% while Biscocho is selected). A successful roll multiplies the **whole manual reward**, including Helping Paw, by three. Other multipliers stack multiplicatively. All chapter upgrades reset on prestige; permanent talents do not. These prices are authored starting values, not validated commercial balance.

## Controls and progression

- Click/tap the yarn; hold the pointer or Space to pull five times per second. Manual input shares the same rate limit.
- Buy cats or complete teams with yarn. Use ×1, ×10, or Max. Each purchase increases that team's next price by 15%, rounded up.
- Buy chapter upgrades, meet six collectible companions, and choose a new protagonist.
- At 100,000 current-run yarn, the first restart unlocks and awards one golden paw. Each next run doubles its production goal; excess yarn cannot increase the reward. The confirmation explains what resets and what remains.
- Golden paws buy one-time permanent talents. **Welcome Home applies on your next chapter reset**, not immediately. Master Knitters unlocks a separate chapter upgrade that must be purchased again after resetting.
- Settings include language, separate music/effects volumes, reduced motion, visual quality, and save import/export. Tab navigation and visible focus support keyboard play.

## Protect your workshop

Progress saves every five seconds and after purchases, settings changes, and chapter resets. One tab per origin owns the save; other tabs explain how to resume safely. Offline production is 50% of the saved rate (65% with Roman selected) for up to eight hours per absence.

Saves belong to the browser **and address/port**. Changing from `127.0.0.1` to `localhost`, changing ports, clearing browser data, or switching browsers does not transfer your progress. Export a JSON backup first. Imports validate the data and export the current game before replacing it. Invalid primary saves recover from the previous valid backup; if neither copy is valid, a recovery screen preserves the data instead of silently resetting. Do not treat browser storage as a permanent backup.

## Develop and verify

```sh
npm ci
npm run dev
npm test
npm run test:launcher
npm run test:e2e
npm run build
```

Browser tests use installed **Google Chrome** through Playwright's `chrome` channel. The test server runs on port 4173. `npm run build` performs strict TypeScript checking and writes `dist/`. Test cases use isolated saves, not the player's live workshop. The source and package lock are included; `node_modules/` is intentionally excluded from the release.

| Location | Responsibility |
| --- | --- |
| `src/game/` | Pure economy, catalog, progression, input scheduling, save validation |
| `src/scene/` | Original procedural Three.js cats, yarn, scenery, animation |
| `src/ui/` | HTML controls, responsive styles, English/Spanish copy, SVG icons |
| `src/main.ts` | Single-writer lifecycle, audio/input/render integration |
| `tests/`, `e2e/` | Unit, local-launcher, and browser regression tests |
| `docs/verification-v05.md` | Exact checks, measurements, and limitations |

English copy is collected in `src/ui/copy.ts`, Spanish translations in `src/ui/localization.ts`, and the content catalog in `src/game/catalog.ts`. Original models share geometry/materials; only 24 cats render at once (12 in Battery saver mode). Additional workers are represented by teams, buildings, and counters. Bundled music and Olympus artwork work offline; see [asset provenance](docs/assets-v03.md).

## Prototype boundaries

This is version 0.5.0, not a storefront release. Three prestige cycles are tested, but pacing, retention, and willingness to pay are **not validated**. Content is finite; production continues afterward. A defensive ceiling of 10,000 purchases per team type bounds bulk-buy work and imported saves. `break_infinity.js` supports very large approximate numbers, not arbitrary exact arithmetic.

No ads, microtransactions, analytics, accounts, servers, cloud saves, installers, store signing, or publishing are included. Capacitor for Android/iOS and Electron for Windows/Steam are the planned next packaging routes, not implemented features. Real-phone performance testing and player playtests remain release gates.

Third-party runtime notices are in `THIRD-PARTY-NOTICES.txt`. See [the architecture decision](docs/decisions/001-browser-first.md) and [verification results](docs/verification-v041.md).
