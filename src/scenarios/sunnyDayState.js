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
  state.footballThoughts ??= {thirsty:false,tired:false};
  state.objective ??= 'explore';state.hasVisitedPark ??= false;state.completed ??= false;
  state.departureItems ??= null;state.rested ??= false;state.lowestHydration ??= state.hydration;
  return state;
}

export function startNewAdventure(registry) {
  const state = { inventory: [], outfit: 'everyday', callComplete: false, hydration: hydrationSettings.initial, waterSips: 0, footballThoughts:{thirsty:false,tired:false}, objective:'explore',hasVisitedPark:false,completed:false };
  Object.assign(state,{departureItems:null,rested:false,lowestHydration:hydrationSettings.initial});
  registry.set(KEY, state);
  return state;
}

export function collectItem(state, id) {
  if (!ITEM_IDS.includes(id) || state.inventory.includes(id)) return false;
  state.inventory.push(id);
  if (id === 'water') state.waterSips = BOTTLE_CAPACITY;
  return true;
}

// Snapshot the first departure, so later home visits cannot change the advice.
export function recordHomeDeparture(state){
  state.departureItems ??= [...state.inventory];
}

export function chooseOutfit(state, id, outfits) {
  if (!outfits.some(outfit => outfit.id === id)) return false;
  state.outfit = id;
  return true;
}
