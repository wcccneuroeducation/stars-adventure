import { playerStatusSettings as settings } from '../settings/playerStatus.js';
import { coldMorningSettings } from '../settings/coldMorning.js';
export const clampStatus=value=>Math.max(0,Math.min(100,Number.isFinite(value)?value:0));
export function ensurePlayerStatus(state){
 state.hydration=clampStatus(state.hydration??100);state.tiredness=clampStatus(state.tiredness??0);
 state.lowestHydration=Math.min(state.lowestHydration??state.hydration,state.hydration);
 return state;
}
export function tirednessBand(state){return state.tiredness>=90?'veryHigh':state.tiredness>=70?'high':state.tiredness>=40?'moderate':'low';}
export function tirednessSpeedMultiplier(state){return 1-settings.maxFootballSpeedReduction*Math.max(0,Math.min(1,((state.tiredness??0)-40)/60));}
export function increaseTiredness(state,seconds,activity='pe'){
 ensurePlayerStatus(state);if(Number.isFinite(seconds)&&seconds>0)state.tiredness=clampStatus(state.tiredness+seconds*(settings.exertion[activity]?.tiredness??0));
}
export function recoverTiredness(state,seconds,dedicated=false){
 ensurePlayerStatus(state);if(Number.isFinite(seconds)&&seconds>0)state.tiredness=clampStatus(state.tiredness-seconds*(dedicated?settings.dedicatedRecoveryPerSecond:settings.seatedRecoveryPerSecond));
}
export function advancePlayerStatus(state,delta,{paused=false,recoveryOnly=false,rest=null,activity=null,movementMs=0,outdoors=false}={}){
 ensurePlayerStatus(state);
 if(paused||!Number.isFinite(delta)||delta<=0||delta>1000)return;
 const seconds=Math.min(delta,settings.maxFrameMs)/1000;
 const moving=Math.max(0,Math.min(seconds,Number.isFinite(movementMs)?movementMs/1000:0));
 if(!recoveryOnly){
  const weather=outdoors?(state.adventure==='pharmacyPanic'?coldMorningSettings.walkingHydrationMultiplier:state.adventure==='sunnyDay'?settings.sunnyOutdoorMultiplier:1):1;
  const physical=!rest&&settings.exertion[activity];
  state.hydration=clampStatus(state.hydration-weather*(settings.hydrationPerSecond*seconds+settings.walkingHydrationPerSecond*moving+(physical?physical.hydration*moving:0)));
  if(physical)increaseTiredness(state,moving,activity);
 }
 if(rest)recoverTiredness(state,seconds,rest==='dedicated');
 state.lowestHydration=Math.min(state.lowestHydration,state.hydration);
}
