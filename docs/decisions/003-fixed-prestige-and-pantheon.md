# Fixed restart rewards and the twelve-cat pantheon

## Decision

Version 0.4 replaces lifetime-yarn-derived prestige payouts with exactly one golden paw per completed restart. Eligibility uses current-run production: `100000 * 2^chapters`. Spending does not undo earned production. Resetting clears run production, so lifetime yarn cannot fund repeated immediate resets.

## Why

The player explicitly rejected hoarding yarn to claim many prestige points at once. A fixed reward makes choosing the next permanent blessing a multi-run decision. Increasing chapter goals prevents later runs from being trivial. The exact goal curve and talent prices are initial tuning, **not validated pacing or retention**. Time gates were rejected: this prototype rewards production rather than mandatory waiting.

## Compatibility

Save version 4 retains `legacyClaimed` and `legacyChapters` as a migration baseline. Older saves first satisfy their lifetime claim bound, then preserve earned points. New claims equal the baseline plus completed new resets. This is consistency validation for local saves, not anti-cheat or authentication. Existing earned achievements remain earned, including the old three-talent pantheon badge; new games require twelve talents for that badge. Unclaimed old lifetime-based rewards are intentionally replaced by the fixed payout.

The stable talent IDs `welcome`, `helping`, and `knitters` now represent Hera, Hermes, and Athena. Their prices and existing effects remain intact. Nine additional gods provide modest manual or automatic modifiers. Zeus and Dionysus multiply the whole manual amount, including Helping Paw. Hephaestus grants a linear 10% per purchased chapter upgrade, multiplied with other effects, and loses that temporary component at reset.

## Presentation

The twelve original procedural Three.js statues share geometry and materials. One additional transparent renderer draws all statue viewports with scissoring; this avoids twelve WebGL contexts. The existing workshop renderer remains in its playable dock. HTML buttons own keyboard/focus/modal behavior. Statues are decoration, never economic authority. Renderer initialization failure leaves inspectable fallback icons and purchasable blessings.

Purchased statues use warm gold materials and a bounded emissive halo instead of bloom. Details appear in a native dialog, freeing the desktop grid to fit on screen. Narrow or short viewports scroll. The existing illustrated temple background and licensed music are reused; no external model pack, paid asset, or new runtime dependency was required.

## Boundaries and rollback

- Economy/migration: `src/game/` and associated unit tests. Downgrading a v4 save is not supported; restore an exported pre-upgrade backup instead.
- Rendering: `src/scene/olympus.ts` and its tests. Geometry can change without modifying save data.
- Interface: Olympus panel, lifecycle integration, responsive CSS, localized text, and browser tests. No account, monetization, publishing, or native shell changes.
