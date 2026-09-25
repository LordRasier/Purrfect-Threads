# Home companion artwork — 0.5.0

Six original character illustrations were generated with the built-in image generation tool: Kira, Mario, Roman, Luigi, Lola, and Biscocho. They are based on the user's pet descriptions. Kira additionally uses the supplied grey/brown tabby photograph as a visual reference; that reference photograph is not redistributed in the game.

- Runtime assets: `public/art/companions/{id}.webp`.
- Final generation prompts: [companion-art-prompts.json](companion-art-prompts.json).
- Each character is 512 × 512 with transparent alpha. The bundled Sharp library was used only for delivery resizing and WebP encoding (quality85, alpha100). No new project dependency.
- Combined compressed size: **359,608 bytes**. All six are local and available offline.
- The same artwork is used in collection cards and the workshop. The latter is a camera-facing Three.js Sprite over the existing 3D cushion; workers remain procedural 3D cats.
- Only the currently selected portrait owns a GPU texture. Changing selection releases the old texture. Stale asynchronous loads cannot replace a newer selection, and the controller disposes its texture/material on teardown.
- Unavailable/locked companions never show on the cushion. Loading or failed portraits remain hidden instead of displaying stale art. The HTML collection and its bonuses do not depend on WebGL rendering.

The rest of the game's artwork and music credits are unchanged. This is generated artwork, not a claim to external asset-pack exclusivity or a legal clearance opinion.
