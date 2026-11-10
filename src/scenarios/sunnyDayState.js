import { hydrationSettings } from '../settings/hydration.js';
import { BOTTLE_CAPACITY } from '../mechanics/waterBottle.js';
import { createSchoolDay } from '../school/dayModel.js';
const KEY = 'kickstart.sunnyDay';
const COLD_KEY='kickstart.pharmacyPanic';
const SCHOOL_KEY='kickstart.schoolDay';
export const ITEM_IDS = ['water', 'hat'];

// Phaser's registry outlives individual scenes. A page reload starts a new run.
export function getSunnyDayState(registry) {
  const adventure=registry.get('kickstart.activeAdventure')??'sunnyDay';
  const key=adventure==='schoolDay'?SCHOOL_KEY:adventure==='pharmacyPanic'?COLD_KEY:KEY;
  if (!registry.has(key)) {
    startNewAdventure(registry,adventure);
  }
  const state = registry.get(key);
  // Compatibility with a run created before the hydration mechanic existed.
  if (state.hydration === undefined) state.hydration = hydrationSettings.initial;
  // Migrate old runs once; an explicitly empty bottle must stay empty.
  if (state.waterSips === undefined) state.waterSips = state.inventory.includes('water') ? BOTTLE_CAPACITY : 0;
  state.footballThoughts ??= {thirsty:false,tired:false};
  state.objective ??= 'explore';state.hasVisitedPark ??= false;state.completed ??= false;
  state.departureItems ??= null;state.rested ??= false;state.lowestHydration ??= state.hydration;
  return state;
}

export function startNewAdventure(registry,adventure='sunnyDay') {
  const state = { inventory: [], outfit: 'everyday', callComplete: false, hydration: hydrationSettings.initial, waterSips: 0, footballThoughts:{thirsty:false,tired:false}, objective:'explore',hasVisitedPark:false,completed:false };
  Object.assign(state,{departureItems:null,rested:false,lowestHydration:hydrationSettings.initial});
  Object.assign(state,{adventure,warmClothing:false,wearingHat:false,warmClothingOnDeparture:null,drankWater:false,pharmacyArrived:false,introFinished:false});
  if(adventure==='pharmacyPanic')state.objective='collectPrescription';
  if(adventure==='schoolDay'){state.objective='schoolTimetable';state.callComplete=true;state.schoolDay=createSchoolDay();}
  registry.set('kickstart.activeAdventure',adventure);
  registry.set(adventure==='schoolDay'?SCHOOL_KEY:adventure==='pharmacyPanic'?COLD_KEY:KEY, state);
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
  state.warmClothingOnDeparture ??= Boolean(state.warmClothing);
}

export function chooseOutfit(state, id, outfits) {
  if (!outfits.some(outfit => outfit.id === id)) return false;
  state.outfit = id;
  if(state.adventure==='pharmacyPanic'){state.warmClothing=Boolean(outfits.find(outfit=>outfit.id===id).warm);state.wearingHat=id==='coat-hat';}
  return true;
}
