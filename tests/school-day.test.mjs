import test from 'node:test';
import assert from 'node:assert/strict';
import { schoolDaySettings,schoolTimetable } from '../src/settings/schoolDay.js';
import { createSchoolDay,toMinutes,formatSchoolTime,advanceSchoolDay,currentPeriod,recogniseArrival,completeSchoolPeriod } from '../src/school/dayModel.js';
import { startNewAdventure,getSunnyDayState } from '../src/scenarios/sunnyDayState.js';
import { schoolRooms } from '../src/school/layout.js';
test('configured timetable uses existing locations and lasts 15–20 active minutes at the chosen rate',()=>{
  const valid=new Set(['reception','courtyard',...schoolRooms.map(r=>r.id)]);
  assert.ok(schoolTimetable.every(p=>valid.has(p.room)));
  const duration=(toMinutes(schoolTimetable.at(-1).time)-toMinutes(schoolTimetable[0].time))/schoolDaySettings.simulatedSecondsPerSecond;
  assert.ok(duration>=15&&duration<=20);assert.equal(formatSchoolTime(550),'09:10');
});
test('school clock progresses identically at different render rates and emits one bell per event',()=>{
  for(const hz of [30,60,120,144]){
    const day=createSchoolDay(),events=[];
    for(let i=0;i<hz*76;i++)events.push(...advanceSchoolDay(day,1000/hz));
    assert.equal(currentPeriod(day).id,'science');assert.deepEqual(events.map(e=>e.id),['registration','science']);
    assert.deepEqual(day.bellEvents,['registration','science']);assert.equal(day.destination,'science');assert.equal(day.bellHasSounded,true);
  }
});
test('pause/dialogue/minigame conditions and suspended-browser gaps cannot accumulate catch-up time',()=>{
  const day=createSchoolDay(),before=day.minutes;
  for(let i=0;i<600;i++)advanceSchoolDay(day,1000/60,true);assert.equal(day.minutes,before);
  day.miniGameActive=true;advanceSchoolDay(day,100);assert.equal(day.minutes,before);day.miniGameActive=false;
  advanceSchoolDay(day,30000);assert.equal(day.minutes,before);advanceSchoolDay(day,1000/60);assert.ok(day.minutes>before&&day.minutes<before+.01);
});
test('arrivals require the right room and check-ins are optional, idempotent and period-specific',()=>{
  const day=createSchoolDay();assert.equal(recogniseArrival(day,'science'),false);assert.equal(completeSchoolPeriod(day),false);
  assert.equal(recogniseArrival(day,'courtyard'),true);assert.equal(recogniseArrival(day,'courtyard'),false);
  assert.equal(completeSchoolPeriod(day),true);assert.equal(completeSchoolPeriod(day),false);
  day.minutes=toMinutes('08:50');advanceSchoolDay(day,16);assert.equal(day.arrived,false);assert.equal(day.destination,'classroom-1');
  recogniseArrival(day,'classroom-1');assert.equal(completeSchoolPeriod(day,'arrival'),false);assert.equal(completeSchoolPeriod(day),true);
  assert.deepEqual(day.completedPeriods,['arrival','registration']);recogniseArrival(day,'corridor');assert.equal(day.arrived,false);
});
test('missing every activity has no penalty and the bell cannot repeat after the day ends',()=>{
  const day=createSchoolDay();let events=0;
  for(let i=0;i<975*60+100;i++)events+=advanceSchoolDay(day,1000/60).length;
  assert.equal(currentPeriod(day).id,'finish');assert.equal(formatSchoolTime(day.minutes),'15:10');assert.equal(events,9);assert.equal(day.bellEvents.length,9);assert.deepEqual(day.completedPeriods,[]);
  for(let i=0;i<100;i++)assert.deepEqual(advanceSchoolDay(day,100),[]);
});
test('school-day registry state is separate, survives scene reuse and resets only on a new run',()=>{
  const m=new Map(),r={get:k=>m.get(k),has:k=>m.has(k),set:(k,v)=>m.set(k,v)};
  const sunny=startNewAdventure(r),cold=startNewAdventure(r,'pharmacyPanic');cold.hydration=63;
  const third=startNewAdventure(r,'schoolDay');third.schoolDay.minutes=600;third.schoolDay.completedPeriods.push('arrival');
  assert.equal(getSunnyDayState(r),third);assert.equal(getSunnyDayState(r).schoolDay.minutes,600);
  assert.equal(r.get('kickstart.sunnyDay'),sunny);assert.equal(r.get('kickstart.pharmacyPanic').hydration,63);assert.equal(third.callComplete,true);
  assert.equal(startNewAdventure(r,'schoolDay').schoolDay.minutes,520);
});
