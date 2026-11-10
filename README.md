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

Collision uses whole buildings, wall runs and furniture rectangles rather than tile bodies. The street and park are Birmingham-inspired, not geographically accurate. Art uses simple shapes; no image assets are required. No weather or character customisation is included.

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
7. Walk to the open park gate at the right of the lower wall, press **E** or tap **INTERACT**, and enter the park. Inventory, remaining sips and hydration are preserved. Use the southern park gate to return to the street.
8. Repeat the backpack, drinking, pause, movement and gate checks on an iPad in landscape. Keyboard users can Tab to the status buttons and activate them with Enter or Space. The existing directional and interaction touch controls are retained.

With Node installed, run `npm test` (no dependencies to install). Tests cover depletion timing, movement blocked by collision, inactive contexts, fixed physics steps at 30/60/120/144Hz rendering, equal loss for all inventory combinations, the actual bedroom pickup/exit handlers, post-drink walking, the collision-checked home-to-park route, listener cleanup, four-sip capacity, full/empty drinking guards, refilling, inventory guards, bounds, colours, new-adventure reset, scene-state reuse and existing bedroom actions/reachability. A full browser/iPad regression test is still required on the target devices.

### Bottle capacity and fountain hook

`waterSips` is held alongside hydration in the shared adventure state. Collecting the bottle initialises four sips; duplicate pickup calls do not refill it. A scene change preserves the exact remaining count, including zero. Runs from before capacity existed initialise the count once, only if a bottle was already carried; no bottle is automatically added. Bedroom and street backpack lists both show the count.

`src/mechanics/waterBottle.js` exports `BOTTLE_CAPACITY`, `bottleSips(state)` and `refillWaterBottle(state)`. The refill function restores a carried bottle to 4/4 and returns true. Without a bottle it returns false and changes nothing. Repeated refills never exceed capacity or restore hydration directly. The park fountain menu calls it only after the player chooses to refill; declining performs no action. Players without a bottle can optionally drink directly for +25 hydration, capped at 100, without receiving a bottle.

## Explorable park

`ParkScene` is a separate 1600 × 1536 scene with camera follow, winding connected paths and an eastern loop, trees, flowerbeds, a shaded seating pergola, a drinking fountain and a fenced MUGA. Jay and three friends wait near the MUGA. All art is generated in Canvas using the existing 32px terrain palette. There is no football gameplay, energy/fatigue meter, clinical event, scoring or forced choice.

The park inherits the street's tested `startHydrationTracking`, `updateHydration` and collision-debug toggle, and reuses `Controls`, `SceneDialog`, `HydrationHud`, the shared registry and four-sip backpack. Its `create` and `update` implement its own map and interactions without constructing or modifying the street. Rest adds a guard to pause depletion without restoring hydration. Other menus pause it through the same existing dialog guard.

* `src/ParkScene.js`: scene, optional interactions, sitting/standing and return transition.
* `src/park/layout.js`: world dimensions, connected paths, gate, props, broad collision rectangles and interaction zones.
* `src/park/art.js`: procedural scenery, friends and a temporary rear-facing player view for entering the park.
* `src/park/interactions.js`: optional fountain actions using the existing refill function.
* `src/scenarios/parkText.js`: separately editable scenario and interaction copy.

### Park playtest

1. Hard-refresh and leave the bedroom as usual. Reach the street's existing park gate and press **E** or tap **INTERACT**. Check that the player appears on the path just inside the southern park gate, facing into the park. Hydration and backpack contents should match the street.
2. Follow the path north, then west, then north. Inspect the flowerbeds and eastern loop. Check camera follow, WASD/arrows, touch movement and **C / Show collisions**. Walk against trees, fence rails, flowerbeds, the bench, fountain and NPCs; movement should stop at their collision boundaries. Gate gaps remain open.
3. At the shaded pergola beside the western path, interact with the bench. Decline once, then choose **Sit and rest**. Check the seated position and unchanged hydration while resting. Choose **Stand up**, or press Escape, and check that the player returns to their safe approach position and can move again. Walking resumes depletion.
4. At the fountain on the next path bend, test **Refill Water Bottle** with a partially used or empty bottle. Check 4/4 sips and unchanged hydration. Decline once to check nothing changes. On another new run without a bottle, test **Drink from Fountain**: hydration rises by 25, capped at 100, and the backpack stays bottle-free.
5. Walk to Jay near the MUGA and interact. Check the exact line: “Hey! You made it! Fancy a game of football?” Close it; no football game starts.
6. Return to the southern park gate, decline once, then choose **Return to street**. Check the pavement spawn beside the original park entrance, with hydration, inventory and sips preserved. Re-enter to check there are no duplicate controls, HUDs or hydration listeners.
7. Repeat on an iPad in landscape, including touch interaction, backpack use and declining menus. Browser/device gameplay validation remains required; automated tests cover the scene methods, collision reachability, state persistence, hydration/rest guards and fountain branches. The procedural full-map preview has been rendered and inspected separately.

### Park transition crash fix and verification

The freeze was reproduced in headless Edge running the real Phaser 3.90 engine. The street shutdown callback tried `this.physics.world.off(...)` after Arcade Physics had already cleared `plugin.world` to null. The resulting uncaught exception interrupted the scene manager transition before park creation. `startHydrationTracking()` now retains the world emitter when registering and removes the listener through that reference. Its focus/reset callback also tolerates a sprite body already destroyed during shutdown. Both the street and park use this corrected lifecycle.

Map painting loops are bounded and run only at scene creation. The existing 2048 × 1024 street and 1600 × 1536 park now cache their baked textures for later visits; no map repaint or texture replacement occurs on re-entry. Scene display objects and listeners still shut down normally. No park features were removed and the gate requires deliberate interaction; entering does not automatically trigger the exit.

Verified with the real browser: Bedroom → Street → Park, followed by 20 Park → Street → Park round trips, with no console errors or warnings. Movement, a blocked fence collision, camera tracking, pointer-operated directional controls, resting, refilling, drinking and post-drink depletion were checked. A used bottle (3 sips) and reduced hydration persisted through the return/re-entry tests. Across repeated visits there were 9 textures, 65 park display objects, 59 static bodies, 1 player body, 1 hydration listener, 1 HUD and 1 scenario dialog. The map textures were not recreated. Garbage-collected JavaScript heap settled near 8.2 MB after warm-up; this is not a measurement of GPU memory or a physical iPad test.

Regression tests now simulate Phaser clearing the world/body before user shutdown callbacks, and check that 20 repeated map visits do not repaint or allocate additional map textures. To verify manually, hard-refresh, follow Bedroom → Street → Park → Street → Park several times, and watch the browser console. Check the return spawn beside the street gate, backpack/sips, hydration and touch controls. Physical iPad/Safari validation remains outstanding.

## GitHub Pages after review

After reviewing and committing the files, use **Settings → Pages → Deploy from a branch**, select the desired branch and **/ (root)**. Paths are relative and work under a repository URL. No build configuration is needed. This task does not commit or push changes.
