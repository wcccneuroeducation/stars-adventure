import { sunnyDayText as text } from './sunnyDayText.js';

export function completionAdvice(state){
  const t=text.completionAdvice,items=state.departureItems??state.inventory;
  return [
    [items.includes('water')?t.waterTaken:t.waterForgotten],
    [state.rested?t.rested:t.noRest,items.includes('hat')?t.hatTaken:t.noHat],
    [(state.lowestHydration??state.hydration)<=30?t.lowHydration:t.regularDrinking,t.fictional]
  ];
}
