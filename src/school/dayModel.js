import { schoolDaySettings,schoolTimetable } from '../settings/schoolDay.js';
export const toMinutes=value=>{const [h,m]=value.split(':').map(Number);return h*60+m;};
export const formatSchoolTime=value=>`${String(Math.floor(value/60)).padStart(2,'0')}:${String(Math.floor(value%60)).padStart(2,'0')}`;
export function createSchoolDay(){return {minutes:toMinutes(schoolTimetable[0].time),periodIndex:0,destination:schoolTimetable[0].room,currentRoom:null,completedPeriods:[],arrivedPeriods:[],bellEvents:[],bellHasSounded:false,arrived:false,miniGameActive:false,audioEnabled:true};}
export const currentPeriod=day=>schoolTimetable[day.periodIndex];
export function advanceSchoolDay(day,delta,paused=false){
  if(paused||day.miniGameActive||!Number.isFinite(delta)||delta<=0||delta>1000)return [];
  day.minutes=Math.min(toMinutes(schoolTimetable.at(-1).time),day.minutes+Math.min(delta,schoolDaySettings.maxFrameMs)/1000*schoolDaySettings.simulatedSecondsPerSecond/60);
  const changes=[];
  while(day.periodIndex+1<schoolTimetable.length&&day.minutes+1e-8>=toMinutes(schoolTimetable[day.periodIndex+1].time)){
    day.periodIndex++;const p=currentPeriod(day);day.minutes=Math.max(day.minutes,toMinutes(p.time));day.destination=p.room;day.arrived=false;day.bellHasSounded=false;
    if(p.bell&&!day.bellEvents.includes(p.id)){day.bellEvents.push(p.id);day.bellHasSounded=true;changes.push(p);}
  }
  return changes;
}
export function recogniseArrival(day,room){
  day.currentRoom=room;const p=currentPeriod(day);
  day.arrived=room===p.room;
  if(room!==p.room||day.arrivedPeriods.includes(p.id))return false;
  day.arrived=true;day.arrivedPeriods.push(p.id);return true;
}
export function completeSchoolPeriod(day,id=currentPeriod(day).id){
  if(id!==currentPeriod(day).id||!day.arrived||day.currentRoom!==day.destination||day.completedPeriods.includes(id))return false;
  day.completedPeriods.push(id);return true;
}
