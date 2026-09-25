# Purrfect Threads 0.3 — implementation notes

## Behavior boundaries

- **Viewport:** the page itself does not scroll. The framed tablet owns scrolling and is keyboard-focusable; the workshop remains in the other viewport region. Olympus intentionally hides the normal header and expands to a full-screen illustrated realm, but keeps the same live Three.js canvas in a small dock. No second renderer or simulation is created. Back and Escape return to the workshop.
- **Decoration:** owned crews add deterministic, type-specific SVG motifs to their card. The visual count stops at 18, while the owned counter continues accurately. Achievement patches have stable offsets and rotations rather than moving randomly each refresh. Detail dialogs use native modal focus handling.
- **Upgrades:** all 12 notes remain inspectable, including locked, unaffordable and purchased notes. The detail sheet is not a transaction. Only its enabled Buy button calls the existing single purchase command. Passive production can make an open purchase affordable; its button refreshes with the game.
- **Critical touches:** an accepted tap rolls once, only when a chance upgrade exists. Rejected inputs do not consume RNG. Chances add to 20%; ×3 applies to the complete manual reward, not the production rate. Injectable RNG makes boundary tests deterministic. No probability is hidden and there is no paid randomness.
- **Persistence:** v3 validates language and music volume. Stable localStorage keys find existing v1/v2 saves. No game reset or account was introduced. Existing one-writer, import and offline high-water behavior is retained.
- **Localization:** a cached Spanish dictionary translates UI and catalog strings. The fixed shell updates text nodes/labels in place, preserving the Three.js canvas and input bindings. Switching language never recreates the simulation. Numeric display uses the selected decimal separator; Decimal serialization does not change.
- **Audio:** one optional loop instance is created after interaction. Volume, visibility, rejected autoplay, in-flight pause/resume and disposal are handled independently of SFX and the economy. The local launcher serves Ogg with an explicit audio MIME type.

## Review and trade-offs

Independent review caught English statue captions, misleading Buy labels on inspect-only notes, and repeated full-dictionary allocation. All were corrected with regression tests. A targeted check also caught keyboard-only music activation and undersized mobile dock hit targets. The image background supplies detail without expensive live temple geometry; see [asset provenance](assets-v03.md).

This release adds content and presentation, not a monetization system. Retention, willingness to pay and phone hardware performance remain unmeasured. The economy values are initial tuning, not a claim of commercial viability.
