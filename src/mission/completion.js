import { missionData,missionText as text } from '../scenarios/medicineMissionData.js';
export function pharmacyCompletionAdvice(state){
  const warm=state.warmClothingOnDeparture??state.warmClothing;
  const water=(state.departureItems??state.inventory).includes('water');
  const strategies=missionData.reminders.filter(r=>state.medicineMission.reminders.includes(r.id)).map(r=>r.label).join(', ');
  return [warm?text.warm:text.light,water?text.water:text.noWater,text.strategyAdvice(strategies)];
}
