import { sunnyDayText as text } from '../scenarios/sunnyDayText.js';
import { streetText } from '../scenarios/streetText.js';
import { canDrink, drinkWater } from '../mechanics/hydration.js';
import { BOTTLE_CAPACITY, bottleSips } from '../mechanics/waterBottle.js';

export function inventoryItemLabel(state, id) {
  return id === 'water' ? streetText.bottleSips(bottleSips(state),BOTTLE_CAPACITY) : text.objects[id] || id;
}

export function backpackActions(state, onDrink, onClose) {
  const actions = [];
  if (state.inventory.includes('water')) actions.push({ label:streetText.drink, disabled:!canDrink(state), run:()=>{ if(drinkWater(state)) onDrink(); } });
  actions.push({ label:text.close, run:onClose });
  return actions;
}

export function openBackpack(dialog, state, onChange) {
  const list=document.createElement('ul');
  state.inventory.forEach(id=>{
    const row=document.createElement('li');row.textContent=inventoryItemLabel(state,id);list.append(row);
  });
  dialog.show(text.objects.backpack,state.inventory.length?text.inventoryIntro:text.emptyBackpack,
    backpackActions(state,()=>{onChange();openBackpack(dialog,state,onChange);},()=>dialog.close()),
    {content:state.inventory.length?list:null});
}
