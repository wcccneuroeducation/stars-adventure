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

`ParkScene` is a separate 1600 × 1536 scene with camera follow, winding connected paths and an eastern loop, trees, flowerbeds, a shaded seating pergola, a drinking fountain and a fenced MUGA. Jay and three friends wait near the MUGA and offer an optional football activity. All art is generated in Canvas using the existing 32px terrain palette. There is no energy/fatigue meter or crisis simulation. Football counts goals; educational choices are not graded.

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
5. Walk to Jay near the MUGA and interact. Check the exact line: “Hey! You made it! Fancy a game of football?” Choose **Not now** to stay in the park or **Join the game** to try the activity described below.
6. Return to the southern park gate, decline once, then choose **Return to street**. Check the pavement spawn beside the original park entrance, with hydration, inventory and sips preserved. Re-enter to check there are no duplicate controls, HUDs or hydration listeners.
7. Repeat on an iPad in landscape, including touch interaction, backpack use and declining menus. Browser/device gameplay validation remains required; automated tests cover the scene methods, collision reachability, state persistence, hydration/rest guards and fountain branches. The procedural full-map preview has been rendered and inspected separately.

### Park transition crash fix and verification

The freeze was reproduced in headless Edge running the real Phaser 3.90 engine. The street shutdown callback tried `this.physics.world.off(...)` after Arcade Physics had already cleared `plugin.world` to null. The resulting uncaught exception interrupted the scene manager transition before park creation. `startHydrationTracking()` now retains the world emitter when registering and removes the listener through that reference. Its focus/reset callback also tolerates a sprite body already destroyed during shutdown. Both the street and park use this corrected lifecycle.

Map painting loops are bounded and run only at scene creation. The existing 2048 × 1024 street and 1600 × 1536 park now cache their baked textures for later visits; no map repaint or texture replacement occurs on re-entry. Scene display objects and listeners still shut down normally. No park features were removed and the gate requires deliberate interaction; entering does not automatically trigger the exit.

Verified with the real browser: Bedroom → Street → Park, followed by 20 Park → Street → Park round trips, with no console errors or warnings. Movement, a blocked fence collision, camera tracking, pointer-operated directional controls, resting, refilling, drinking and post-drink depletion were checked. A used bottle (3 sips) and reduced hydration persisted through the return/re-entry tests. Across repeated visits there were 9 textures, 65 park display objects, 59 static bodies, 1 player body, 1 hydration listener, 1 HUD and 1 scenario dialog. The map textures were not recreated. Garbage-collected JavaScript heap settled near 8.2 MB after warm-up; this is not a measurement of GPU memory or a physical iPad test.

Regression tests now simulate Phaser clearing the world/body before user shutdown callbacks, and check that 20 repeated map visits do not repaint or allocate additional map textures. To verify manually, hard-refresh, follow Bedroom → Street → Park → Street → Park several times, and watch the browser console. Check the return spawn beside the street gate, backpack/sips, hydration and touch controls. Physical iPad/Safari validation remains outstanding.

## Football activity

Interact with Jay and choose **Join the game**. Blue is the player plus Jay; Orange is two NPC opponents. Movement stays on WASD/arrows or the existing touch directional pad. Touch the ball to kick: player movement/contact determines direction, while AI kicks are biased towards the opposing goal. Blue attacks right and Orange attacks left. The HUD shows **Blue 0 – Orange 0**. Only valid goal-mouth crossings score; a brief kickoff resets all four players and the ball. Score resets for a new match, while shared hydration, bottle sips and one-time thought flags persist. Leave with **Leave football** or **E / INTERACT** to return to the park. Backpack and Pause remain available.

`src/football/model.js` owns one ball and four stable actor records. Friction, wall rebounds, swept goal checks, per-character cooldowns, a brief ball lock and contact latches keep contact lightweight. A stopped ball can be kicked again after cooldown so an overlap cannot permanently trap it. One Orange NPC chases at a time; the other holds a defensive/support position. Jay chases when better placed than the player and otherwise supports. Local separation avoids crowding; there is no pathfinding. The activity reuses three Graphics objects and one thought Text object, plus DOM score/leave controls; it creates no Phaser objects inside update and no new physics bodies or independent intervals. Waiting friends are on a hideable layer to avoid a duplicate Jay during a match. The park layout, map cache and solid geometry are unchanged.

`src/settings/football.js` contains bounds, ball/AI tuning, goal/reset settings, fictional status thresholds, a 35-second initial script threshold, a 10-second continuation interval and the 1.25 hydration multiplier. Ordinary walking retains its existing rate. Football uses resolved physics displacement; idle time, blocked movement, menus, kickoffs, pauses and unfocused windows do not advance the exertion timer or drain hydration. Reduced movement speed is accounted for when deriving active seconds for the independent script.

`src/football/hydrationEffects.js` applies these explicitly fictional gameplay rules only in football:

| Game status | Effect |
| --- | --- |
| Above 60% | Normal football speed (150px/s) |
| Above 30% through 60% | One-time thirsty thought; normal speed |
| Above 10% through 30% | One-time tired thought; football speed reduced 15% to 127.5px/s |
| 0% through 10% | Stop football and offer telling Jay or a trusted adult, with appropriate-advice wording |

The thought flags persist for the adventure, so drinking and crossing a band again, rejoining or changing scenes does not repeat them. A new adventure resets the flags. Drinking still restores +25 game points and consumes one sip; speed returns to normal above 30%. That is a game-status effect and does not mean real symptoms have resolved. Joining below the stop threshold presents the stop/support dialog rather than restarting play. No score is lost for stopping.

### Scripted discussion and nurse review

All dialogue and labels are editable in `src/scenarios/footballText.js`. The existing independent event remains: after 35 seconds of actual football movement, the activity pauses with “I'm getting really tired. I think I need a break.” The player may tell Jay and stop, stop for water, or continue for another 10 active seconds. Continuing tiredness is then presented with another opportunity to stop and tell Jay. Neither hydration thresholds nor goals trigger/reset this script timer. The separate low-status stop rule may end a match before the timer completes; it is labelled as a fictional game rule. Closing a symptom dialog with Escape leaves the activity.

Stopping does not automatically seat the player, give them water or change hydration. The rest response leaves them free to use the bench, where exertion remains paused without restoring hydration. The water response offers the unchanged backpack/fountain mechanics. Both responses now include an explicit **Tell a trusted adult / seek advice** action. This displays support and personal-care-plan wording; it does not contact anyone. Rest/water are not represented as guaranteed treatment. Fictional status rules and the independent timed script do not diagnose dehydration, predict a crisis or assess an individual's symptoms. A new football session restarts the discussion timer; no symptom severity or cure state is modelled.

For clinical review of the editable script, see [Alder Hey's exercise information for young people with sickle cell disease](https://www.alderhey.nhs.uk/conditions/patient-information-leaflets/living-with-sickle-cell-disease-exercise/) and the [NHS sickle cell disease guidance](https://www.nhs.uk/conditions/sickle-cell-disease/). The game's branching choices are for nurse-guided discussion and should not replace an individual's care plan.

### Football playtest

1. Hard-refresh, reach Jay and decline once; then join. Check four characters, Blue/Orange kit, opposite goals and the score. Approach from different directions to kick. Verify NPC contacts, opposite goal directions and a valid goal at each end. A miss should rebound; a goal should increment once, reset all players/ball and continue the match.
2. Move actively, then stand still, open Backpack and pause. Only actual football movement should consume hydration/time, at 1.25 times the walking rate. Carrying water/hat has no automatic benefit.
3. Cross 60% and 30% while moving. Check each thought appears once, and speed reduces only in football at/below 30%. Drink, cross again and rejoin: thoughts should not repeat in the same adventure. Cross 10% to check the stop/support menu, safe park return and no automatic healing. A new page load resets the adventure and thought flags.
4. Keep game status above the low stop threshold to review the independent 35-second event, then choose **Keep playing for now.** Check the follow-up after 10 more moving seconds. Rest and water choices stop football; try their trusted-adult action. Drinking, rest and goals must not count as a cure or reset the independent timer within a match.
5. Check **Leave football**, **E / INTERACT**, and Escape during the symptom dialog. Confirm the return position, full park bounds, unchanged inventory/sips and ordinary walking depletion. Repeat joining/leaving and Park → Street → Park to check lifecycle stability.
6. Repeat using landscape touch controls. Physical iPad/Safari validation remains outstanding.

Tests cover contacts for all four actors, direction changes, cooldown/stalled-ball recovery, both goal lines, single score awards, kickoff and script persistence, support AI bounds, one-time thoughts, reduced speed and critical support, plus the existing bottle/park/scene regressions. Real headless Edge checks exercise the live score, kickoffs, threshold crossings, drinking/rest, support dialogs and native landscape touch movement/kicking. Physical iPad/Safari testing remains outstanding. The AI is deliberately simple: no tactical passing, tackling, goalkeepers, offside or realistic character physics. Scores are local to one match; choices and scores are not stored in a database. Run `npm test` with Node installed.

## Complete A Sunny Day adventure

The park visit now ends naturally with Jay's goodbye and the objective **Head home**. Walk back through the southern park gate, return to Birmingham Street, then enter the front door of the leftmost home (the original doorstep spawn). Home shows the welcome and **Adventure Complete!**. **Play Again** starts the opening call again with empty inventory, 100% hydration, fresh bottle pickups, reset football thoughts/score and fresh scenario progress. **Finish** stays on a completion screen. Returning home after an early park departure also completes the adventure; players are free to leave early.

`src/settings/scenario.js` configures `parkVisitMs` (120000). `src/scenarios/ParkVisitClock.js` is a single scene-owned clock sampled from the park update loop, without intervals or visible UI. Entry starts a fresh visit; shutdown cancels it. Football, menus, drinking, dialogue and rest continue counting. Explicit Pause, scene/game pauses and document inactivity suspend it without catch-up. Expiry stops football immediately and waits for an open interaction/rest to finish before showing Jay's goodbye once. Football cannot restart for that visit. Re-entry starts a fresh full visit and allows football again.

Football now has a voluntary **Take a Rest** button, also offered by symptom/low-status choices. The player moves safely beside the MUGA; play and exertion stop without restoring hydration. The break menu offers backpack/drinking, resume, leave and trusted-adult advice. Resume retains the current score and independent scripted activity progress; it is unavailable at the existing low-status stop threshold or after the visit ends. Rest and water do not guarantee that concerning symptoms have resolved. The independent scripted event remains separate from hydration, so maintaining hydration does not suppress that discussion event.

New implementation files are the clock/settings above. `ParkScene` owns visit lifecycle and the ending; `FootballActivity` owns break/resume and stopped movement; `StreetScene`/`world.js` add the existing home's door zone without changing geometry. `BedroomScene` owns completion/restart. Shared scenario state and editable `sunnyDayText.js`/`footballText.js` hold progress and dialogue. HUD, backpack and dialog helpers support the objective, return-to-break navigation and static completion screen.

### End-to-end checks

1. Run locally as above and hard-refresh. Leave the bedroom with or without water, enter the park and check there is no visible timer. Walk, drink, talk and rest; these must not restart or pause the visit. Only explicit Pause or switching away should suspend it.
2. Join football. Use **Take a Rest**, check unchanged hydration, open Backpack and drink, then resume with the same score. Try the scripted symptom choices and trusted-adult advice. Existing movement, goals, NPCs and touch controls should continue working.
3. Stay in the park for roughly two active minutes. If playing, the match stops. If a menu is open, finish it first. Jay says goodbye once, **Head home** appears and Jay no longer offers a new game. Explore and return through the gate.
4. Check the pavement spawn, preserved inventory/sips/hydration, and **Head home**. Walk to the original leftmost doorstep and interact. Test both completion choices on separate runs. Play Again must replay the call with all adventure state reset; collecting water again gives 4/4 sips.
5. Leave and re-enter the park several times: each visit gets its own full duration. Try keyboard and landscape touch controls, including rest/backpack navigation and completion buttons.

Verification for this change: 64 automated Node tests pass. Real headless Edge/Phaser testing covered the full default two-minute visit, deferred goodbye during rest, voluntary rest/drink/resume with preserved score, explicit pause, repeated park entries with stable listener/HUD counts, active-match expiry, the actual walking route home, Play Again and Finish. Browser console errors were absent in these checks. Physical iPad/Safari validation remains necessary. The clock is deliberately not saved across reloads or visits.

The earlier football guide's description of rest ending a match is superseded by the resumable break above; **Leave football** still ends the match. Reloading and Play Again both start a new adventure.

## Personalised completion update

Returning to the original home after visiting the park now opens **Adventure Complete!** with three advice boxes and **Next Adventure**. The boxes cover water, rest (combined with the existing sun-hat choice), and hydration. Next Adventure shows **Coming Soon — Pharmacy Panic!**; it does not start another scene. This replaces the earlier Play Again/Finish completion interface.

`sunnyDayState.js` snapshots inventory on the first bedroom departure and persists chosen breaks and lowest hydration across scenes. `hydration.js` records the minimum during existing depletion without changing the depletion/drinking rules. The bench and football rest handlers record chosen breaks; a forced football stop alone does not count as rest. `completionAdvice.js` selects the three boxes using copy in `sunnyDayText.js`; `BedroomScene.js` renders them using the existing dialog and a small CSS addition. Hat advice shares the rest box. The completion is guarded against repeat triggering and does not overwrite the recorded choices on homecoming.

To review, hard-refresh and complete separate runs with/without water and with/without choosing rest. Compare the advice, including after drinking to recover from a low indicator. Exactly 30% or below at any point selects the low-indicator reminder even if the final value is higher. Check that the opening bedroom does not show completion and that Next Adventure displays only the placeholder. On smaller landscape screens, the existing dialog scrolls to keep all copy and the button accessible. Run `npm test` for automated regression coverage; physical iPad testing remains necessary.

## Willow Lane — neighbourhood expansion

Continue east beyond the existing park and bus stop to the **WILLOW LANE** sign, then turn north. The new road is part of Birmingham Street's existing scene: no loading transition. Follow either 64px pavement to the northern end, cross around the top, and return. Original homes, shop, park gate, collision records and interaction coordinates remain in place.

`src/neighbourhood/willowLayout.js` defines the extension, ten houses, open garden gates, fences, furniture and a reserved western vacant unit. `src/pixel/willowLane.js` paints reusable upright side-porch houses, gardens, paving, road and sign using the existing palette/tiles. Houses use independently placed porches on the street side; no building sprite is rotated or flipped. The vacant unit has no interaction or storyline.

`world.js` appends the new grouped collision rectangles and extends the bounds to `(0, -1152)` through `(2816, 1024)` without shifting existing map coordinates. `StreetScene.js` uses those same bounds for physics and camera. `pixel/environment.js` preserves the original 2048 × 1024 map and adds one separately cached 768 × 2176 extension texture. There is no per-frame map generation. Land above the old map is a solid, inaccessible backdrop; Willow Lane is reached from the junction.

Testing: `npm test` includes continuous foot-body routes from home to both pavements and back, every garden entrance, fixed home/park coordinates, and repeated texture-cache reuse. Real browser checks covered keyboard walking north, turning at the end, returning down the opposite pavement, vertical camera follow, the original park entrance and personalised adventure completion. Physical iPad/Safari testing remains necessary. Existing roads remain walkable under the original collision rules; house interiors and the vacant unit are not accessible. No Pharmacy Panic gameplay has been added.

## Willow Lane Pharmacy

The reserved western unit is now a permanent green **PHARMACY**, with large windows, a green cross and its existing side-porch path to the pavement. Approach the entrance and press **E** or tap **INTERACT**. The separate interior has public product shelves, waiting chairs, a consultation door, a rear counter and pharmacist, plus a dispensing workspace with an inactive MED-BOT 3000, conveyor, boxes and five sorting bins. The counter blocks entry to the staff area. The consultation door and robot are decorative, with no gameplay yet.

Walk to the counter in front of the pharmacist to read the three placeholder dialogue pages. Walk to the southern exit door and interact to return to the western pavement at `(2272, -546)`. Entry/exit always requires an interaction; the interior spawn is outside the exit zone. Indoor walking does not drain hydration. Backpack, hydration, bottle sips, current objective and scenario progress share the existing registry. No Pharmacy Panic adventure is started and the existing park clock lifecycle is unchanged.

Files: `PharmacyScene.js` reuses Controls, SceneDialog, HydrationHud and backpack; `pharmacy/layout.js` defines bounds, solids and entrance/exit zones; `pharmacy/art.js` caches the interior and paints the exterior; `scenarios/pharmacyText.js` contains editable dialogue and labels. `main.js` registers the scene. `StreetScene.js`, `world.js` and `pixel/willowLane.js` connect the entrance and appearance. Tests in `tests/pharmacy.test.mjs` cover safe outdoor return, interior routes, solids, dialogue/state preservation and duplicate-exit protection.

Review checklist: enter from Willow Lane, explore both sides of the public area, try walking into shelves/counter/chairs, speak to the pharmacist, inspect the robot workspace, then exit and re-enter several times. Test keyboard and touchscreen interaction, backpack and Pause. Visit while the objective is **Head home**, then return to the original house and check the personalised completion still works. Hard-refresh before testing to load the new modules/art. Physical iPad/Safari verification remains necessary. No medication mini-game, robot malfunction, consultation interior or personalised medicine advice is implemented.

## Adventure 2 opening — A Cold Morning

Use the two adventure links above the game, or open `?adventure=2` to test **Pharmacy Panic!** directly (`?adventure=1` starts **A Sunny Day**). Choosing a link starts a new run. Adventure 1's completion **Next Adventure** now starts Adventure 2 in the same game, with fresh inventory, hydration and opening call; it no longer shows the placeholder. The two adventures have separate registry records and share existing movement, maps, controls and inventory mechanics.

Adventure 2 begins with the pharmacy's two-line call and the objective **Collect your prescription from Willow Lane Pharmacy.** The existing wardrobe offers T-shirt, jumper, warm coat, or warm coat and hat. Leaving without changing clothes or collecting water is allowed. The first departure records bottle/hat contents and warm clothing; drinking and lowest hydration are recorded across scenes for later advice. No clothing penalty or cold-exposure health meter exists.

The outdoor maps use separate cached winter textures: frosted grass/roofs and winter evergreen foliage with cooler colours. Sunny source textures are preserved. No snow physics, slipping or breath animation is added. `settings/coldMorning.js` sets walking depletion to 35% of the sunny rate; all existing movement/idle/menu/indoor guards and four-sip drinking rules still apply. Exploring the park in Adventure 2 does not start Adventure 1's park-ending sequence or overwrite the prescription objective.

At the pharmacy, speak to the pharmacist at the counter. The three editable lines end with **That's strange... MED-BOT isn't behaving properly today!** The player can continue exploring or exit, but there is no robot malfunction, sorting game, prescription completion or Adventure 2 ending yet.

Key files: `scenarios/coldMorningText.js` (all opening/wardrobe/pharmacist copy), `settings/coldMorning.js`, `pixel/winter.js`, adventure state in `sunnyDayState.js`, and small scenario branches in BedroomScene, PharmacyScene, ParkScene, the outdoor renderers, hydration/HUD/backpack and main.js. `tests/cold-morning.test.mjs` covers isolated state, wardrobe/departure records, slower movement-only depletion, drinking/minimum tracking, phone/dialogue and cached winter rendering. The completion regression now checks that Next Adventure starts Adventure 2.

Verified with 77 automated tests and real browser checks: direct Adventure 2 start, both phone lines, warm clothing and lighter-clothing departure, water pickup/drinking, the complete keyboard walk from the original house to the pharmacy, all three pharmacist lines, preserved objective/state, Next Adventure transition, optional park exploration and restoring the sunny map for Adventure 1. No browser errors were observed. Physical iPad/Safari testing remains necessary. Hard-refresh before testing.

## Robot Rescue — MED-BOT 3000

Start Adventure 2, reach the pharmacy and speak to the pharmacist. After the MED-BOT observation, a brief warning-light/shake sequence shows **SORTING ERROR!**, followed by the two help messages. Approach the public side of the counter opposite MED-BOT (around x704, y336) and press **E** or tap **INTERACT**. Staff-area collisions and the pharmacy layout remain unchanged.

Select the medicine box, then select a labelled bin; desktop players can also drag it into a bin. Keyboard players can Tab to the box, press Enter/Space, then Tab to a bin and activate it. The conveyor animates, but the box waits indefinitely. Wrong choices gently bounce it back and offer an optional Hint. Correct choices animate into the chosen bin, show the editable explanation and advance repair progress; Continue brings the next box. Sound is optional and initially off. Return to pharmacy or Escape closes the interface without discarding progress, hints or a pending explanation.

The first five boxes cover all five categories in shuffled order; the next five repeat them in a shuffled order with no adjacent duplicate. After all ten are sorted, the conveyor stops, normal lights return, repair progress is full, and the robot/pharmacist celebration dialogue appears. The objective becomes **Collect your prescription.** The temporary **Next: Prescription Collection — Coming Soon!** message prepares the next stage. Reopening the robot or speaking again does not restart the completed challenge, including after leaving and re-entering the pharmacy.

`src/scenarios/robotRescueData.js` contains all medicine names, purposes, explanations, hints, bin labels and new dialogue. These are educational examples, not a list everyone takes or personalised medication advice. `src/robot/model.js` manages the ten-box sequence, retries and persistent completion. `SortingGame.js` builds the responsive native-dialog interface and optional generated tones. `RobotDisplay.js` animates the existing machine area with two reusable scene objects. `PharmacyScene.js` connects the dialogue/interaction and repair sequence; pharmacy layout adds only an interaction zone, not new collision geometry. HUD, styles and tests support the activity. A new adventure resets it through the existing fresh scenario state.

Verification: 83 automated tests pass. Real browser tests covered the malfunction, all categories and ten-box completion, incorrect retry/Hint, desktop dragging, keyboard selection, close/reopen with saved explanation, completion dialogue, pharmacy re-entry and no automatic restart. A touch-enabled 1024 × 768 browser completed all ten boxes using tap selection/bin controls, with optional audio running and no console errors. Physical iPad/Safari and audible sound quality still need manual review. No prescription-collection mini-game has been implemented. Hard-refresh to load the update.

## MED-BOT enhancements: twelve-box challenge

The current challenge supersedes the ten-box list above. Its editable medicine data in `src/scenarios/robotRescueData.js` now contains Penicillin, Folic acid, Hydroxycarbamide, Paracetamol, Ibuprofen, Morphine, Cetirizine, Omeprazole and Salbutamol inhaler, with the requested explanations and optional hints. The fifth bin is **Other / Ask Pharmacist**; its medicines have different usual purposes from the four named categories, rather than being classified as dangerous or unsuitable. No doses or individual treatment recommendations are added.

`src/robot/model.js` shuffles all nine medicines, followed by three distinct repeats, avoiding consecutive identical boxes. Existing correct-feedback/Continue, retries, controls, saving and completion behaviour is unchanged. All twelve boxes must be sorted to finish.

`src/robot/lights.js` derives the lights from actual saved progress: unavailable/inactive or completed means steady green; available and unfinished means alternating red. Each red light flashes on a 500ms cycle, offset by 250ms. `RobotDisplay.js` draws two top-mounted lights in the pharmacy; `SortingGame.js`, `PharmacyScene.js` and CSS use the same state for the interface/celebration. Pharmacy artwork supplies the inactive green lights, including in Adventure 1. The yellow-and-black floor border is drawn directly from the shared `robotZone` rectangle in `pharmacy/layout.js`, so its 256 × 64 outline matches the interaction area exactly without adding a collision barrier.

Verification: 86 automated tests pass, covering nine-medicine coverage, twelve-box length, repeated pain/Other categories, explanations, retries, completion locks, saved-state light phases and the short malfunction shake after waiting beside an inactive robot. Browser checks completed twelve boxes with dragging/keyboard and with landscape touch, verified persistent explanations and flashing/steady UI lights, then re-entered the pharmacy to confirm green lights and no restart. Physical iPad/Safari testing remains necessary. Hard-refresh before testing the expanded list.

## Prescription Collection — fictional Alex

After repairing MED-BOT, finish the celebration or speak to the pharmacist. The pharmacist introduces **Alex (fictional)** and explains that this is an educational activity; the pharmacist remains responsible for checking and dispensing. The prescription card lists only Penicillin, Folic acid and Hydroxycarbamide, with no doses or frequencies. This replaces the previous Prescription Collection Coming Soon handoff.

Explore the existing public shelves: stand beside the left shelf (around x192, y432) or right shelf (x768, y432) and press **E** or tap **INTERACT**. Choose a clearly labelled box, compare the prescription, then **Add to basket** or **Put back**. Penicillin and Paracetamol share the same box artwork, so read the names. A wrong medicine gives the requested gentle reminder and can immediately be put back. Correct medicines count once; duplicates cannot be added. There are no sorting bins, scores, lives or timers. The pharmacy geometry/collisions are unchanged.

The HUD shows **Medicines found: 0/3** and a **Prescription card** button after the activity starts. The card is also available inside shelf/label views and returns to the same view on closing. It remains available outdoors, so exploring or leaving/re-entering does not lose the list or basket. After 3/3, return to the pharmacist for the final checks and a short sealed-bag animation. The fictional bag appears in the existing backpack, and the objective becomes **Take the prescription home**. Return through the pharmacy exit, down Willow Lane, along Birmingham Street and through the original home door. The bedroom stops at **Now let's think about remembering medicines.** No medication-routine activity is implemented yet.

New files: `scenarios/prescriptionData.js` contains all editable prescription/shelf data and dialogue; `prescription/model.js` manages repair gating, duplicate checks, basket and bag state; `prescription/card.js` renders the reusable card; `prescription/PrescriptionActivity.js` handles shelf close-ups and pharmacist preparation. Small changes in PharmacyScene, BedroomScene, StreetScene, pharmacy interaction layout, HUD/backpack and styles connect the activity without modifying MED-BOT sorting or lights, outdoor art, hydration, clothing or Adventure 1.

Verification: 93 automated tests pass, including repair/adventure gating, correct/wrong/duplicate choices, shelf reachability, card content/navigation, final checks, bag handover, persistent state/new-run reset and the home handoff. Browser tests verified the actual repair-to-prescription transition, shelf walking, the similar-label comparison, wrong retry, duplicate prevention, 3/3, packing animation, outdoor card and the full walk home. A touch-enabled landscape browser collected all three through the shelf/card controls. No browser errors were observed. Physical iPad/Safari testing remains necessary. Hard-refresh before reviewing.

## GitHub Pages after review

After reviewing and committing the files, use **Settings → Pages → Deploy from a branch**, select the desired branch and **/ (root)**. Paths are relative and work under a repository URL. No build configuration is needed. This task does not commit or push changes.
