import { refillWaterBottle } from '../mechanics/waterBottle.js';
import { clampHydration } from '../mechanics/hydration.js';
import { hydrationSettings } from '../settings/hydration.js';
import { parkText } from '../scenarios/parkText.js';

export function fountainActions(state, onChange, onClose) {
  const hasBottle=state.inventory.includes('water');
  return [{
    label:hasBottle?parkText.refill:parkText.directDrink,
    run:()=>{
      if(hasBottle)refillWaterBottle(state);
      else {state.hydration=clampHydration(state.hydration+hydrationSettings.drinkAmount);state.drankWater=true;}
      onChange();onClose();
    }
  },{label:parkText.decline,run:onClose}];
}
