import { hydrationSettings as settings } from '../settings/hydration.js';
import { bottleSips } from './waterBottle.js';

export const clampHydration = value => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 100));
export const hydrationColour = value => value > 60 ? 'blue' : value > 30 ? 'amber' : 'red';
export const canDrink = state => bottleSips(state) > 0 && state.hydration < 100;

export function drinkWater(state) {
  if (!canDrink(state)) return false;
  state.hydration = clampHydration(state.hydration + settings.drinkAmount);
  state.waterSips = bottleSips(state) - 1;
  return true; // Keep the bottle in inventory, including when empty.
}

export function advanceHydration(state, movementMs, context) {
  if (!context.outdoors || !context.moving || context.dialogOpen || context.paused || !context.focused) return;
  const elapsed = Number.isFinite(movementMs) ? Math.max(0, movementMs) : 0;
  state.hydration = clampHydration(state.hydration - elapsed / 1000 * settings.pointsPerSecond);
}

// Sample resolved physics positions ONCE PER PHYSICS STEP, using that step's
// duration (milliseconds), never the render frame's delta. Blocked movement,
// teleports, tab switches and pauses must not turn into accumulated drain.
export class HydrationMovement {
  constructor(state) { this.state = state; this.previous = null; }
  reset() { this.previous = null; }
  sample(x, y, delta, context) {
    const previous = this.previous;
    this.previous = { x, y };
    if (!previous || !Number.isFinite(delta) || delta <= 0) return;
    const distance = Math.hypot(x - previous.x, y - previous.y);
    // Ignore discontinuities larger than one frame's possible walking distance.
    if (distance > settings.walkingSpeed * delta / 1000 + 1) return;
    const movementMs = Math.min(delta, distance / settings.walkingSpeed * 1000);
    advanceHydration(this.state, movementMs, { ...context, moving: context.moving && distance > 0.001 });
  }
}
