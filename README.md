# STARS Adventure — Birmingham Street

Static Phaser 3.90.0 prototype. No build step or database. Phaser loads from jsDelivr, so internet access is required.

## Run locally

Serve this folder over HTTP; do not double-click index.html because it uses JavaScript modules.

* With Python installed, run `python -m http.server 8000` in this folder and open http://localhost:8000.
* Alternatively, open the folder in VS Code, install **Live Server**, then right-click `index.html` → **Open with Live Server**.

## Play and test

* Move with WASD, arrow keys, or the touchscreen directional pad. Movement is four-directional; vertical takes priority when both axes are held.
* From the starting position, walk right to the teal corner shop, then up onto its pavement. Press **E** or tap **INTERACT** when the prompt appears. Close the message with **Keep exploring** or Escape.
* Press **C** or click **Show collisions**. Pink outlines mark solids, teal marks the interaction zone, yellow marks the player's foot body.
* Walk into both house rows, walls, bench, bus shelter, bin and the two park trees: the player's feet should stop at each boundary. Walk through wall gaps and the park gate.
* Walk to the world edges. The camera follows until it reaches the map boundary, and the player stays inside the map.
* Hold a touch direction, slide off, and release; controls should stop. Switch tabs while moving to check that inputs reset. Try movement and interaction with separate fingers.
* Resize the desktop browser and test on an iPad in landscape. Touch buttons also work with a mouse. Physical iPad/Safari testing remains necessary.
* Check keyboard focus in the shop modal and that closing returns focus to the game.

## Files and future art

* `src/world.js`: 32px grid, 2048 × 1024 world, spawn, house placements, shop zone and broad collision rectangles.
* `src/art.js`: original temporary player texture and entry point for the environment renderer.
* `src/pixel/tiles.js`: shared palette and 17 reusable 32 × 32 Canvas tiles, including terrain variants, kerbs and wall sections.
* `src/pixel/buildings.js`: reusable terrace modules, window/door details and shop artwork.
* `src/pixel/environment.js`: terrain layout, garden composition, landmarks and street furniture, baked once into a world texture.
* `src/controls.js`: keyboard and multi-pointer controls with release/cancel/focus reset.
* `src/StreetScene.js`: physics, camera, interaction and collision overlay.
* `src/main.js`: Phaser configuration and responsive scaling.
* `index.html` / `styles.css`: page, touch controls and accessible shop dialog.

Collision uses whole buildings, wall runs and furniture rectangles rather than tile bodies. The street is Birmingham-inspired, not geographically accurate. Art uses simple shapes; no image assets are required. No educational scenarios, weather or character customisation are included.

## Environment art pass

The environment now uses a consistent pixel palette, textured paving/asphalt, red-brick terraces with slate roofs and small front gardens, a striped shop awning with stocked windows, a glazed bus shelter with timetable, detailed furniture, and an open park entrance. Both house rows stay visually upright, with roofs above their facades. All artwork is generated locally, with no external image dependencies.

See [the art guide](src/pixel/README.md) for tile keys and extension points. Existing world collision data, shop zone, player drawing, controls and scene logic remain unchanged. Repeat the playtest checklist above, especially near walls, shop entrance and the park gate, with collision outlines enabled. Hard-refresh the local page to pick up the new modules. Browser and physical iPad visual/gameplay checks are required after this art pass.

## GitHub Pages after review

After reviewing and committing the files, use **Settings → Pages → Deploy from a branch**, select the desired branch and **/ (root)**. Paths are relative and work under a repository URL. No build configuration is needed. This task does not commit or push changes.
