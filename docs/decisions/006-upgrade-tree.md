# 006: Chapter upgrade tree with a compatible input root

## Decision

Replace the grid with one draggable, icon-only chapter tree. Helping Thread costs 25 yarn before chapter scaling and unlocks pointer/Space hold repeats at the existing five-actions-per-second limit. Single presses remain usable without it. The twelve existing effectful upgrades keep their prices and effects. Master Tools still requires Master Knitters as well as Better Tools.

The user-confirmed expansion adds five practice nodes for each of ten producer types: 63 total notes. Each practice adds one percentage point to its producer’s practice bonus, totaling +5% per completed branch; the resulting factor multiplies existing milestone/talent effects. Base cost is the producer’s initial price × tier², with the existing 10% per-chapter scaling. Each practice branch starts at Helping Thread and requires its preceding tier. All tree nodes reset at prestige; only Olympus talents are permanent upgrades.

The catalog owns the single-parent graph; the engine enforces it, and the UI explains the same unmet requirements. SVG strings and 48px note pins share coordinates. A labeled scroll region contains an 1800×1400 branching canvas without expanding the document. Mouse/finger panning uses a 7px threshold and suppresses drag-release activation. Window release/cancel, capture loss, blur, navigation, and pagehide clean up interaction state. Unmoved touch taps activate after the native touch sequence, with native-click deduplication; canceled gestures never activate, and teardown/blur cancels queued activation. This avoids relying on compatibility clicks after custom panning. Arrow controls offer a non-drag alternative. Keyboard focus centers each node.

A body-portal tooltip escapes the board clip, clamps to the screen, and describes the note on hover/focus without intercepting pointer gestures. Escape dismisses it. A tap/click opens the existing detail dialog, so neither mobile nor keyboard use requires hover. Notes remain inspectable when locked or purchased. English and neutral Spanish cover all generated practice names and effects.

## Save compatibility

Save version 6 grants only Helping Thread when reading v1–v5, after legacy purchase-counter inference. This preserves the previously unconditional hold control without spending yarn or increasing purchase statistics. It never grants effectful ancestors: older disconnected owned upgrades remain purchased and active. New purchases require their immediate parent. Modern reloads grant nothing, and chapter reset clears every tree node. The expansion adds IDs without changing the v6 schema.

Forge of Paws counts only the original twelve effectful milestones. The migrated root cannot inflate legacy output, and a small +1% practice purchase cannot secretly add +10% global production. The bilingual talent description states these exclusions. Actual root/practice purchases still count toward purchase achievements and companion challenges.

## Alternatives and consequences

- Granting every missing ancestor would make the diagram contiguous but increase legacy production for free; rejected to preserve the economy.
- Shrinking the entire tree to phone width would avoid panning but make touch targets too small. Internal panning and keyboard centering keep 48px notes reachable.
- A full-text 63-card grid would expose every detail at once but obscure branching and overwhelm small screens; icon notes plus accessible inspection follow the approved visual direction.
- Many small producer steps coexist with the rarer, larger legacy milestones. Arithmetic and gates are tested; pacing and perceived value still require a real playtest.
- Saves exported as v6 cannot be read by older releases. Keep a backup before downgrading.

## Verification

Unit tests cover all graph paths, isolated/additive bonuses for all ten producers, ascending/scaled prices, every-node reset, purchase gates, migration, unchanged legacy output/counters, and both input sources. Browser tests cover hover/focus/tap, mouse/finger drag, outside-viewport release, all string endpoints, document overflow, keyboard focus, fresh/legacy reloads, desktop/mobile screenshots, and shop-status spacing.

## Zoom follow-up

The board now scales its canvas through a sized wrapper and origin-at-zero transform, so zoomed strings and notes share scroll bounds without widening the document. Wheel zoom anchors the pointer but leaves Ctrl/Command-wheel to browser zoom. Accessible controls expose zoom percentage, +/- steps, fit-all, and the existing root-center action; fit recalculates after viewport resize while it remains active. Keyboard focus restores at least 100% before centering a note, preserving readable inspection targets.

Verification adds pure clamp, pointer-anchor, and fit math tests plus desktop/mobile browser coverage for fit bounds, controls, wheel behavior, drag suppression, and screenshots.
