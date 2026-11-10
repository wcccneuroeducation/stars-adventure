export const BOTTLE_CAPACITY = 4;

export function bottleSips(state) {
  if (!state.inventory.includes('water')) return 0;
  const value = Number.isFinite(state.waterSips) ? state.waterSips : 0;
  return Math.max(0, Math.min(BOTTLE_CAPACITY, Math.floor(value)));
}

// Future fountain interactions can call this only after the player accepts.
// Refilling never creates a bottle and never changes hydration directly.
export function refillWaterBottle(state) {
  if (!state.inventory.includes('water')) return false;
  state.waterSips = BOTTLE_CAPACITY;
  return true;
}
