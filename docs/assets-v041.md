# Illustrated Olympus assets — 0.4.1

The user requested funny 2D cat illustrations on retained 3D pedestals, replacing the procedural cat statuettes introduced in 0.4. The workshop scene is unchanged.

## Assets and provenance

- Twelve original character images generated separately with the built-in image_gen tool. No external asset pack or new runtime dependency.
- Final project assets: `public/art/olympians/{talent-id}.webp` (one for each stable talent ID).
- Full final prompt set and output mapping: [olympian-art-prompts.json](olympian-art-prompts.json).
- Source PNGs had transparent alpha; delivery files retain it. Sharp from the bundled workspace runtime performed only delivery resizing and encoding: 512 × 512, WebP quality 85, alpha quality 100.
- Total transfer size: 762,640 bytes for all twelve files, loaded only when Olympus opens. Original generated PNGs remain in the tool's generated-images directory; the game never references that directory.
- The existing temple background, music, and third-party notices remain unchanged.

## Rendering choice

Each cat is a frontal Three.js Sprite using an unlit, non-tone-mapped material, preserving illustrated colors. Shared lit cylinder meshes form the pedestals, with ivory or gold tops and an owned halo. One scissor renderer serves all twelve cards.

This deliberately trades independently animated 3D limbs for expressive, consistent illustrated silhouettes. Approximately 16 MiB of RGBA texture storage including mipmaps is budgeted for twelve 512-square images, before driver overhead. All textures, materials, geometry, and the renderer are released on navigation. Late image callbacks do nothing after disposal.

The HTML icon remains visible while an image loads or if it fails. The card, description dialog, and purchase control remain functional. No economy or save schema change accompanies this visual update.
