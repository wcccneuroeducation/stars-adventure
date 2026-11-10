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

## A Sunny Day: hydration prototype

The game starts in the bedroom. Hydration is fictional game status, not a physiological or clinical measurement. It starts at 100% for a new adventure and stays in the shared Phaser registry alongside the backpack and clothing. Scene changes do not reset it. Reloading starts a new adventure; future restart flows can call `startNewAdventure(registry)` and restart the opening scene.

`src/settings/hydration.js` controls depletion (1.7 percentage points per second of actual outdoor walking at 150px/s) and drinking (+25 points). The direct doorstep-to-park route is approximately 1,782px, giving an arrival value around 80%. Detours consume more; pauses do not. `src/mechanics/hydration.js` contains the calculations, bounds, drinking inventory guard and resolved-position movement sampling. Inventory has no effect on depletion. Text is separate in `src/scenarios/streetText.js`. No symptoms, scores, clinical predictions, automatic complications or forced choices are attached to the meter.

Movement is sampled on Arcade Physics `worldstep`, after collision resolution, using the physics step duration. The previous render-frame sampling rejected valid fixed-step movement on high-refresh displays as a teleport (reproduced at 120Hz with or without water). Scene shutdown removes the physics listener; menu/pause/focus changes cannot accumulate idle depletion. Carrying or collecting water never restores hydration; only the backpack drink action calls `drinkWater`.

Hydration uses the same live document focus/visibility checks as street movement, not Phaser's event-driven `game.hasFocus` flag. That flag starts false and can remain false when an already-focused page loads, which previously blocked all depletion even as the player moved. Movement detection uses changes in the existing resolved player-body coordinates, independent of keyboard/touch requests. Regression tests keep Phaser's initial false flag and exercise the real HUD renderer, shared state references and home-to-park route. Temporary console diagnostics in `StreetScene.js` are disabled (`DEBUG_HYDRATION = false`).

### Playtest

1. Hard-refresh the local page. Check that the bedroom shows 100% and that movement, the call and menus leave it unchanged.
2. Collect the water bottle if testing drinking, then leave through the door. The doorstep spawn and street controls should be unchanged.
3. Walk directly from the doorstep down to the road, right towards the gate and then down to the park entrance: the value should reach about 80%. Repeat the same route with no water, with water, and with a hat: the losses should match. Stand still, push against a building, open the shop dialog, open the backpack or press **Pause**: the meter should stop decreasing. Switch tabs and return; there should be no catch-up loss.
4. Open **Backpack** in the status row. A newly collected bottle shows **Water Bottle — 4/4 sips**. After walking, press **Drink water**: hydration increases by 25 (capped at 100) and exactly one sip is consumed. At 100% the action is disabled without consuming a sip. Continue walking and drinking to reach 0/4: the empty bottle remains listed and Drink stays disabled. Movement stays stopped while the menu is open.
5. Reload, leave the bottle behind, and exit. **Backpack** must show no drink action.
6. For faster colour-boundary testing, temporarily increase `pointsPerSecond` in settings, then restore `1.7`. Above 60 is blue, 31–60 amber, and 0–30 red. At 0 the game remains playable with no additional effects. After drinking and closing the backpack, walk again to check that depletion resumes.
7. Walk to the open park gate at the right of the lower wall, press **E** or tap **INTERACT**, and close the welcome message. No park interior is created and state is unchanged.
8. Repeat the backpack, drinking, pause, movement and gate checks on an iPad in landscape. Keyboard users can Tab to the status buttons and activate them with Enter or Space. The existing directional and interaction touch controls are retained.

With Node installed, run `npm test` (no dependencies to install). Tests cover depletion timing, movement blocked by collision, inactive contexts, fixed physics steps at 30/60/120/144Hz rendering, equal loss for all inventory combinations, the actual bedroom pickup/exit handlers, post-drink walking, the collision-checked home-to-park route, listener cleanup, four-sip capacity, full/empty drinking guards, refilling, inventory guards, bounds, colours, new-adventure reset, scene-state reuse and existing bedroom actions/reachability. A full browser/iPad regression test is still required on the target devices.

### Bottle capacity and future fountain hook

`waterSips` is held alongside hydration in the shared adventure state. Collecting the bottle initialises four sips; duplicate pickup calls do not refill it. A scene change preserves the exact remaining count, including zero. Runs from before capacity existed initialise the count once, only if a bottle was already carried; no bottle is automatically added. Bedroom and street backpack lists both show the count.

`src/mechanics/waterBottle.js` exports `BOTTLE_CAPACITY`, `bottleSips(state)` and `refillWaterBottle(state)`. The refill function restores a carried bottle to 4/4 and returns true. Without a bottle it returns false and changes nothing. Repeated refills never exceed capacity or restore hydration directly. A future fountain menu can call it after the player chooses to refill; declining should perform no action. No park interior, fountain graphics or fountain interaction has been added in this stage.

## GitHub Pages after review

After reviewing and committing the files, use **Settings → Pages → Deploy from a branch**, select the desired branch and **/ (root)**. Paths are relative and work under a repository URL. No build configuration is needed. This task does not commit or push changes.
