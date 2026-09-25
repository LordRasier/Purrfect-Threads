# Verification — 0.4.1

## Result

The Olympus gallery now combines twelve original 2D cat illustrations with real Three.js pedestals. Purchases, permanent effects, prestige rules, and save schema remain unchanged.

## Checks performed

| Check | Result |
| --- | --- |
| TDD, statue factory | Updated sprite/pedestal/disposal expectations failed against the old 3D cats (3 failures), then passed |
| `npm test` | 91/91 passed across 12 files |
| Additional all-resource disposal hardening | Focused scene suite 7/7 passed after the final test-only edit |
| `npm run check` | Passed after the final test edit |
| `npm run build` | Passed |
| `npm run test:launcher` | 1/1 passed |
| `npm run test:e2e` | 52/52 passed; desktop and Pixel 7 touch emulation, 4.1 minutes |
| Independent read-only code review | Approved after TypeScript test-signature correction; incidental old screenshots restored |
| Manual browser inspection | All 12 illustrated cats visible on pedestals at 961 × 854; Hermes description inspected; no console warnings/errors observed |
| Asset inspection | All twelve files have actual alpha, 512 × 512, total 762,640 bytes |

The focused browser suite covers image-load success, a failed Hermes image retaining its usable icon fallback, repeated navigation, fixed prestige, preserved ownership after reload, Spanish legacy-save migration, compact desktop layout and mobile scrolling. Lifecycle unit coverage includes image callbacks arriving after disposal.

The initial release-label test caught an English/Spanish dictionary mismatch; it was fixed before the successful final suite. An initial full-browser run was interrupted before collecting results when that mismatch and a test callback type error were discovered; it is not counted as evidence.

## Visual evidence

- [Desktop gallery](screenshots/v041-illustrated-pantheon.png)
- [Mobile gallery](screenshots/v041-illustrated-mobile.png)
- [Art source and prompts](assets-v041.md)

Screenshots from automated tests use isolated fixture saves. The user's live preview was inspected without purchasing, importing, or resetting anything.

## Limitations

- Vite still reports a shared Three.js chunk above 500 KB: 575.41 KB minified / 144.43 KB gzip. Olympus itself is 5.61 KB / 2.34 KB gzip.
- No new controlled FPS benchmark or real-phone hardware test was performed; emulation is not real-device performance evidence.
- Images are camera-facing illustrations, not animated 3D characters. Pedestals and ownership halos remain rendered in 3D.
- Balance, session duration, retention and commercial viability are not validated by these technical tests.
