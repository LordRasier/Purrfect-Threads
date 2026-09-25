# Purrfect Threads

A browser-first, single-player yarn clicker: pull a coral yarn ball, adopt a crew of cats, build a miniature textile workshop, and begin new chapters with permanent talents.

## Play the compiled game

1. Extract the complete release folder. Keep `dist/` and `tools/` together.
2. With **Node.js 24 or newer** installed, double-click **START-GAME.cmd** on Windows, or run `node tools/serve.mjs` from this folder.
3. Open **http://127.0.0.1:4180/**. Keep the terminal open while playing; Ctrl+C stops it.

No package installation or internet connection is needed to play the included build. Do not open `dist/index.html` directly: browsers restrict module loading from `file://`. The launcher binds only to the local computer; it does not publish the game. Use a modern browser with WebGL2 and Web Locks support. The HTML clicker remains playable if 3D initialization fails.

## Controls and progression

- Click/tap the yarn; hold the pointer or Space to pull five times per second. Manual input shares the same rate limit.
- Buy cats or complete teams with yarn. Use ×1, ×10, or Max. Each purchase increases that team's next price by 15%, rounded up.
- Buy chapter upgrades, meet six collectible companions, and choose a new protagonist.
- At 100,000 lifetime yarn, a new chapter can award the first golden paw. The confirmation explains what resets and what remains.
- Golden paws buy one-time permanent talents. **Welcome Home applies on your next chapter reset**, not immediately. Master Knitters unlocks a separate chapter upgrade that must be purchased again after resetting.
- Settings include sound volume, reduced motion, visual quality, and save import/export. Tab navigation and visible focus support keyboard play.

## Protect your workshop

Progress saves every five seconds and after purchases, settings changes, and chapter resets. One tab per origin owns the save; other tabs explain how to resume safely. Offline production is 50% of the saved rate for up to eight hours per absence.

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
| `src/ui/` | HTML controls, responsive styles, English copy, SVG icons |
| `src/main.ts` | Single-writer lifecycle, audio/input/render integration |
| `tests/`, `e2e/` | Unit, local-launcher, and browser regression tests |
| `docs/verification.md` | Exact checks, measurements, and limitations |

English copy is collected in `src/ui/copy.ts` and the content catalog in `src/game/catalog.ts`. Original models share geometry/materials; only 24 cats render at once (12 in Battery saver mode). Additional workers are represented by teams, buildings, and counters. No downloaded art, font, or sound packs are needed.

## Prototype boundaries

This is version 0.1, not a storefront release. Three prestige cycles are tested, but pacing, retention, and willingness to pay are **not validated**. Content is finite; production continues afterward. A defensive ceiling of 10,000 purchases per team type bounds bulk-buy work and imported saves. `break_infinity.js` supports very large approximate numbers, not arbitrary exact arithmetic.

No ads, microtransactions, analytics, accounts, servers, cloud saves, installers, store signing, or publishing are included. Capacitor for Android/iOS and Electron for Windows/Steam are the planned next packaging routes, not implemented features. Real-phone performance testing and player playtests remain release gates.

Third-party runtime notices are in `THIRD-PARTY-NOTICES.txt`. See [the architecture decision](docs/decisions/001-browser-first.md) and [verification results](docs/verification.md).
