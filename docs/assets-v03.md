# Visual and audio assets — version 0.3

All assets ship with the build. Gameplay does not need an external asset host.

## Olympus illustration

- File: `public/art/pawlympus.png` (2.38 MB, 1672 × 941).
- Original generated game background, produced with the built-in image generation tool (not the API/CLI fallback), September 24, 2026.
- The interactive cat statuettes, controls, typography and actual miniature Three.js workshop are separate code-rendered layers, not baked into the bitmap.
- The image was visually inspected and copied into this project; no generated-image cache path is required at runtime.
- Asset research included the CC0 [Kenney Fantasy Town Kit](https://kenney.nl/assets/fantasy-town-kit). It was not bundled: a dedicated painted temple background matched this one-screen realm without adding a separate 3D model pack or draw calls.

### Final generation prompt

> Use case: stylized-concept. Asset type: original full-screen background artwork for the cozy cat clicker game Purrfect Threads, wide landscape 16:9. Create Mount Pawlympus, a breathtaking tiny cat-inspired Greek temple floating above lavender and peach clouds at golden hour. Toy-like matte cream marble, soft sculpted edges, elegant golden paw and yarn-ball reliefs on pediments, mint climbing vines and tiny coral flowers. Grand marble stairs lead to three EMPTY ceremonial pedestals on an open central terrace. Tall fluted columns and two distant small temples frame the far left and right, soft celestial yarn constellations in the dusk sky. Polished storybook 3D diorama illustration, warm inviting lighting, beautifully detailed materials but uncluttered central terrace for interface overlay. Keep the center foreground visually calm. No text, labels, UI, buttons, watermarks, people, or large foreground cats. The architecture should feel playful, luxurious and magical rather than realistic or ominous. Complete landscape illustration edge to edge.

## Music

[Apple Cider](https://opengameart.org/content/apple-cider), by **Zane Little Music**, is listed by its author as **CC0**. The 3.24 MB Ogg Vorbis file is bundled at `public/audio/apple-cider.ogg`; provenance and direct source are in [music-assets.md](music-assets.md). Credit appears in Settings. No account, API, or paid service is needed.

Music starts after a pointer or keyboard gesture, loops at the saved music volume, pauses when hidden, and resumes only after interaction has unlocked playback. The speaker icon mutes/unmutes both music and effects; Settings has independent sliders. Browsers that cannot decode Ogg simply remain silent without blocking gameplay; iOS audio compatibility still needs hardware testing before packaging.

## Other visuals

Cats, yarn, buildings, SVG icons, patch outlines, note boards and statues remain original project geometry/code. No external fonts are requested. The single illustrated background keeps the extended scene lightweight rather than introducing real-time temple geometry and lighting.
