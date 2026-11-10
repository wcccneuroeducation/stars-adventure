import { medicines } from '../scenarios/robotRescueData.js';
function shuffle(values,random){
  const result=[...values];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;
}
export function rescueState(state,random=Math.random){
  if(!state.robotRescue){
    const ids=medicines.map(m=>m.id),first=shuffle(ids,random),second=shuffle(ids,random);
    if(first.at(-1)===second[0])[second[0],second[1]]=[second[1],second[0]];
    state.robotRescue={sequence:[...first,...second],index:0,available:false,completed:false,incorrect:false,feedbackMedicine:null,audioEnabled:false,celebrationSeen:false};
  }
  return state.robotRescue;
}
export const currentMedicine=progress=>medicines.find(m=>m.id===progress.sequence[progress.index]);
export function sortMedicine(state,bin){
  const progress=rescueState(state);
  if(progress.completed||progress.feedbackMedicine)return 'locked';
  const medicine=currentMedicine(progress);if(!medicine)return 'locked';
  if(medicine.bin!==bin){progress.incorrect=true;return 'retry';}
  progress.feedbackMedicine=medicine.id;progress.index++;progress.incorrect=false;
  if(progress.index===progress.sequence.length){progress.completed=true;state.objective='prescriptionCollection';}
  return 'correct';
}
export function continueSorting(state){
  const p=rescueState(state);p.feedbackMedicine=null;
  if(p.index===p.sequence.length){p.completed=true;state.objective='prescriptionCollection';return true;}
  return false;
}
