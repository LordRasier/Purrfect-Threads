# Home companion artwork — 0.5.0

Six original character illustrations were generated with the built-in image generation tool: Kira, Mario, Roman, Luigi, Lola, and Biscocho. They are based on the user's pet descriptions. Kira additionally uses the supplied grey/brown tabby photograph as a visual reference; that reference photograph is not redistributed in the game.

- Runtime assets: `public/art/companions/{id}.webp`.
- Final generation prompts: [companion-art-prompts.json](companion-art-prompts.json).
- Each character is 512 × 512 with transparent alpha. The bundled Sharp library was used only for delivery resizing and WebP encoding (quality85, alpha100). No new project dependency.
- Combined compressed size: **327,444 bytes**. All six are local and available offline.
- The same artwork is used in collection cards and the workshop. The latter is a camera-facing Three.js Sprite over the existing 3D cushion; workers remain procedural 3D cats.
- Only the currently selected portrait owns a GPU texture. Changing selection releases the old texture. Stale asynchronous loads cannot replace a newer selection, and the controller disposes its texture/material on teardown.
- Unavailable/locked companions never show on the cushion. Loading or failed portraits remain hidden instead of displaying stale art. The HTML collection and its bonuses do not depend on WebGL rendering.

The rest of the game's artwork and music credits are unchanged. This is generated artwork, not a claim to external asset-pack exclusivity or a legal clearance opinion.

## Luigi reference correction — 25 September 2026

The later photograph supplied by the user shows a fluffy brown/grey tabby with dark stripes, a white muzzle, bib, belly and sock paws. Luigi's illustration now follows those markings while retaining its feisty expression, upright pose and alpha silhouette. The original photograph is not included. This is an art-only correction: no buffs, unlock conditions, IDs, save data or runtime code changed.

## Kira personal reference and final pose — 25 September 2026

The user's personal photograph is the likeness reference: brown/grey tabby stripes, tall ears, light cream chest and dark fluffy tail. The final sprite follows the user's revised direction: a cute simplified 2D chibi cartoon, body seated in three-quarter view with her head turned back toward the camera as if she heard something annoying, both front paws grounded, and a restrained downturned deadpan mouth. The famous Grumpy Cat expression informs the mood, not the coat or identity. Her photo is not redistributed. This is an art-only change; gameplay, bonuses, unlocks and saves are untouched.

## Mario lazy-pose portrait — 25 September 2026

Mario now follows the user's photograph: a fluffy white-and-muted-brown/grey tabby with a broad white blaze, cheeks, chest and paws and a dark fluffy tail. His new sprite sprawls belly-down over an invisible support with both front legs dangling loose; the half-lidded, closed-mouth expression keeps the "what a bother" joke in body language rather than an exaggerated grin or crossed eyes. It uses Kira's simplified 2D chibi style. The personal reference photograph is not redistributed. This is an art-only replacement; no bonus, unlock, ID, gameplay or save data changed.
