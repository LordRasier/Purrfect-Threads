# Pencil workshop assets

Generated with the built-in image generation tool on 2026-09-26. Both PNGs are copied into the project; no external asset requests are needed at runtime.

- `public/art/workshop-pastel-garden.png`: decorative low-contrast world backdrop; centered negative space keeps the island readable.
- `public/art/falling-cat.png`: transparent reward sprite, four visible paws. The cloud sleeper is native Three.js geometry, not this sprite.

## Background prompt

Create a wide landscape background illustration asset for a cozy cat yarn workshop game. Hand drawn colored pencils on warm ivory paper, delicate visible pencil grain, very soft muted pastel sage, peach, lavender, pale blue. A peaceful whimsical garden with small distant rounded bushes, a few flowers, faint wispy clouds, soft grassy ground. Keep the middle 60 percent extremely uncluttered and near ivory for a separate 3D island overlaid there. Details concentrated gently at far left and right edges and lower corners. No cats, no buildings, no text, no UI, no frame, no centerpiece. Wide 3:2 composition, intentionally light and low contrast, charming vintage children's storybook, not realistic.

## Reward sprite prompt

Single adorable chibi kitten game sprite, hand drawn colored pencil illustration with pastel peach ginger and cream fur, visible soft pencil strokes and gentle graphite outline. Full body, big rounded head, small plush body, exactly four paws spread outward as if gently floating down through the air, tail curling upwards, tiny surprised but delighted expression, warm friendly dark eyes, tiny pink nose, no fear or injury. Slight three-quarter view, strong simple readable silhouette at small mobile sizes. Cozy vintage storybook cartoon, not realistic, not 3D. Isolated on genuine transparent background, no paper rectangle, no ground shadow, no cloud, no text, no yarn, no border. Kitten fills most of square canvas with a small margin.

## Behavior

The falling cat is an optional active-play bonus: 5 yarn per catch, once per appearance, without tap multipliers or extra tap counts. It is unavailable outside the workshop and never generates offline rewards. Reduced-motion mode keeps it still rather than dropping it. The pastel backdrop and sleeping cloud do not affect production.

## Factory and parachute revision (2026-09-26)

Generated with the built-in image generation tool and copied locally, keeping the original garden assets for provenance.

- `public/art/workshop-pastel-factory.png`: pastel pencil factory with three cats pushing a crate beneath a sleeping heavy cat, and three helmeted cats eating sardine sandwiches. Decorative only, behind the island and never intercepting input.
- `public/art/parachute-cat.png`: transparent ginger cat with an open pastel canopy and harness.

### Factory prompt

Wide game background illustration, whimsical CAT YARN FACTORY interior in delicate hand-drawn colored pencils on ivory paper, pastel sage peach lavender ochre pale blue. Cozy funny storybook cartoon, not realistic. Composition important: center 45% remains very light uncluttered empty factory floor for an overlaid game island; all character scenes easily legible at left and right thirds, no central foreground object. LEFT vignette: exactly THREE little worker cats in tiny yellow hard hats strain together pushing a wooden crate; atop the crate a HUGE round fat cat sleeps curled up, making the load impossible. Their determined funny expressions contrast the blissful sleeping chonk. RIGHT vignette: exactly THREE worker cats wearing yellow hard hats sit on a lunch break bench sharing large sandwiches, each sandwich clearly has a whole little sardine fish visibly poking out between bread slices; one holds lunch proudly. Additional subtle humorous background details at far edges: a cat tangled in a wool spool beside gentle yarn factory machinery, safety helmets stacked on a peg, soft pipework, wooden shelves of yarn, a distant sleepy supervisor. Indoor factory not garden. Warm diffuse light, pencil grain, low-medium contrast edges, soft pale empty center and upper middle for readability. A detailed charming panorama with believable paws and clear visual storytelling, no text, no letters, no UI, no border, no watermark. Landscape 3:2.

### Parachute prompt

Create a single isolated game sprite on transparent background: an adorable small cream and ginger chibi cat descending SAFELY with an OPEN parachute above it. Hand drawn colored pencil on paper texture, soft pastel peach, sage green and lavender, charming cozy old cartoon, not realistic. Full complete parachute canopy at top, four clearly visible thin suspension cords joining a snug little harness around cat torso; full cat below canopy with two front paws and two back paws, round gentle surprised face, tiny ears and curled tail. Three-quarter view. The canopy and cat form a compact vertically oriented portrait silhouette, cat large enough to read at tiny game icon size; canopy only moderately wider than cat. Light soft colored outlines, clean silhouette and transparent empty space around entire sprite. No ground, no background, no text, no letters, no border, no additional characters. This sprite will be a clickable falling bonus in a cozy yarn factory game.

### Interaction

The parachute sprite fades in and fades out on expiry. Catching awards exactly 5 yarn immediately, disables repeat claims, plays an optional synthesized meow, and keeps the sprite briefly visible while shrinking and fading away. Reduced motion keeps the cat stationary and uses opacity only. Leaving the workshop hides the bonus immediately to avoid leaking it into another screen. Audio follows the existing volume setting and is entirely local.
