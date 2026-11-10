# Environment art guide

All geometry is painted at native resolution with integer pixel coordinates and smoothing disabled. These modules add no physics bodies or input handlers. `world.js` remains the authority for collision and interaction data.

## Terrain tiles

`createTileSet()` returns a Map of 32 × 32 canvases:

| Keys | Use |
| --- | --- |
| `grass0`–`grass3` | Deterministic grass variations |
| `road0`–`road3` | Asphalt variations |
| `pavement` | Four stone paving slabs |
| `kerb-north`, `kerb-south` | Transparent overlays for pavement edges |
| `road-marking` | Transparent central dash overlay |
| `path` | Garden paving |
| `gravel` | Park paths |
| `brick` | Repeating facade masonry |
| `wall` | 16px high capped wall inside a transparent 32px tile |
| `slate` | Staggered roof tiles |

`tileArea(ctx, tiles, key, x, y, width, height)` repeats tiles without scaling; partial tiles are cropped. Terrain anchors use the 32px grid, while details and kerbs can use integer pixel offsets. Use the shared `PALETTE` to keep new objects consistent. Noise is seeded, so reloads produce the same artwork.

## Modules and layering

`makeTerrace(tiles, variant)` produces a 160 × 192 module matching the existing house footprint, with four door variants. Both street rows use the same upright orientation: roof at the top and facade below, with no rotation or vertical flipping. Gardens remain in their existing street-side strips. Wall runs are read from the existing 16px-high obstacle records, including their original gaps.

`drawShop(ctx, tiles, shop)` follows the existing shop footprint. Its entrance remains at the original location; no new displays obstruct the shop zone. Street furniture remains at the previous coordinates. Flowers, paving, drains and lettering are surface details, with no added collisions. The park gate stays open.

`paintEnvironment(ctx)` paints terrain, then buildings/gardens, then walls and furniture. Terrace variants are cached within that paint pass. `drawPixelEnvironment(scene)` uploads the completed 2048 × 1024 Canvas as one Phaser texture and adds one world image beneath the existing player and debug overlays. There is no per-frame texture painting. The world image is approximately 8 MiB of uncompressed RGBA data, plus the browser's backing canvas.

To add a location, reuse terrain and building modules in a new composition function. To change this street's layout, explicitly update its world/collision records as a separate gameplay change. To substitute PNG artwork later, use same-size local canvases or preloaded textures while retaining module anchors and foot collision alignment. The current temporary player texture is deliberately separate in `../art.js`.
