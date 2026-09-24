# Browser-first, locally saved prototype

## Decision

Use a pure TypeScript economy, a Three.js presentation, and native HTML controls. Ship a locally runnable browser prototype before native shells or storefront work.

## Why

An indie prototype needs to validate its play loop without servers, accounts, or ongoing infrastructure costs. A pure economy makes accelerated progression, save recovery, and frame-rate independence testable without a GPU. Decimal magnitudes avoid native floating-point overflow as the economy grows.

## Boundaries

- The game engine owns all economic mutations; animation never awards currency.
- Input uses a shared five-actions-per-second limit.
- Prestige resets the working team, not the permanent collection.
- Persistence validates imported data and preserves a valid backup. Offline progress is claimed once and saved immediately.
- Native Capacitor/Electron shells, monetization, analytics, cloud saves, and publication are deferred. Retention and commercial performance are not yet measured.

## Evidence

- https://threejs.org/docs/pages/WebGLRenderer.html
- https://github.com/Patashu/break_infinity.js
- https://vite.dev/guide/
- https://vitest.dev/guide/

## Increment verification

Economy and progression tests were written and observed failing before implementation. Pure economy rollback boundary: `src/game/` and its tests; rendering has no dependency on its storage format.
