# Original 3D Olympian cats

Version 0.4 adds twelve procedural real-time Three.js cat statues in `src/scene/olympus.ts`. They are actual meshes, not generated images or SVG silhouettes. Shared low-poly geometry forms chibi heads, bodies, ears, paws, tails and stepped pedestals. Accessories distinguish Hera, Hermes, Athena, Zeus, Poseidon, Demeter, Apollo, Artemis, Ares, Aphrodite, Hephaestus and Dionysus.

Purchased figures switch to warm gold with an emissive halo. Ivory, metal, pink and leaf accents use original material definitions. The renderer uses one transparent scissored canvas for all twelve figures, capped device-pixel ratio, reduced-motion handling, and explicit WebGL-context/resource disposal.

No external models or new dependencies were downloaded for this iteration. The full-screen temple backdrop remains the original generated artwork documented in [v0.3 provenance](assets-v03.md). The local CC0 music remains documented in [music credits](music-assets.md). Neither asset requires a network connection while playing.

Tests cover finite mesh bounds, actual accessory groups, ownership material reversal, initial sizing, initialization-failure cleanup, and deterministic resource disposal. Screenshots are demonstrations of rendered states, not evidence of natural progression speed or measured retention.
