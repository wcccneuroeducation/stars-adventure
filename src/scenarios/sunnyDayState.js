import { hydrationSettings } from '../settings/hydration.js';
import { BOTTLE_CAPACITY } from '../mechanics/waterBottle.js';
const KEY = 'kickstart.sunnyDay';
export const ITEM_IDS = ['water', 'hat'];

// Phaser's registry outlives individual scenes. A page reload starts a new run.
export function getSunnyDayState(registry) {
  if (!registry.has(KEY)) {
    startNewAdventure(registry);
  }
  const state = registry.get(KEY);
  // Compatibility with a run created before the hydration mechanic existed.
  if (state.hydration === undefined) state.hydration = hydrationSettings.initial;
  // Migrate old runs once; an explicitly empty bottle must stay empty.
  if (state.waterSips === undefined) state.waterSips = state.inventory.includes('water') ? BOTTLE_CAPACITY : 0;
  return state;
}

export function startNewAdventure(registry) {
  const state = { inventory: [], outfit: 'everyday', callComplete: false, hydration: hydrationSettings.initial, waterSips: 0 };
  registry.set(KEY, state);
  return state;
}

export function collectItem(state, id) {
  if (!ITEM_IDS.includes(id) || state.inventory.includes(id)) return false;
  state.inventory.push(id);
  if (id === 'water') state.waterSips = BOTTLE_CAPACITY;
  return true;
}

export function chooseOutfit(state, id, outfits) {
  if (!outfits.some(outfit => outfit.id === id)) return false;
  state.outfit = id;
  return true;
}
