import { missionData } from '../scenarios/medicineMissionData.js';
export const canUnlockMission=state=>state.adventure==='pharmacyPanic'&&state.prescription?.bagReceived===true&&state.prescription?.homeMessageSeen===true;
export function unlockMission(state){
  if(!canUnlockMission(state))return null;
  state.medicineMission??={step:'intro',routine:null,reminders:[],completed:false,audioEnabled:Boolean(state.robotRescue?.audioEnabled)};
  if(!state.medicineMission.completed)state.objective='medicinePlan';
  return state.medicineMission;
}
export function chooseRoutine(state,id){
  const p=state.medicineMission;if(!canUnlockMission(state)||!p||p.completed||p.step!=='routine'||!missionData.timeline.some(t=>t.id===id))return false;
  p.routine=id;p.step='routineFeedback';return true;
}
export function toggleReminder(state,id){
  const p=state.medicineMission;if(!p||p.completed||!['reminders','backup'].includes(p.step)||!missionData.reminders.some(r=>r.id===id))return false;
  const index=p.reminders.indexOf(id);
  if(index<0)p.reminders.push(id);else if(p.step==='reminders')p.reminders.splice(index,1);
  return true;
}
export function answerForgotten(state,id){
  const p=state.medicineMission;if(!p||p.completed||p.step!=='forget')return false;
  if(id!=='check')return false;
  p.step='safeFeedback';return true;
}
export function completeMission(state){
  const p=state.medicineMission;
  if(!canUnlockMission(state)||!p||p.step!=='safeFeedback'||!p.routine||!p.reminders.length)return false;
  p.completed=true;p.step='complete';return true;
}
