import test from 'node:test';
import assert from 'node:assert/strict';
import { medicines,sortingBins,robotText } from '../src/scenarios/robotRescueData.js';
import { rescueState,currentMedicine,sortMedicine,continueSorting } from '../src/robot/model.js';
import { getSunnyDayState,startNewAdventure } from '../src/scenarios/sunnyDayState.js';
import { nearbyPharmacyObject,pharmacySolids } from '../src/pharmacy/layout.js';
globalThis.Phaser={Scene:class{}};
const { PharmacyScene }=await import('../src/PharmacyScene.js');
test('ten shuffled examples introduce every category first and avoid adjacent repeats',()=>{
  for(let seed=1;seed<100;seed++){
    let n=seed;const random=()=>{n=(n*1664525+1013904223)>>>0;return n/2**32;};
    const p=rescueState({},random);assert.equal(p.sequence.length,10);assert.equal(new Set(p.sequence.slice(0,5)).size,5);
    assert.equal(new Set(p.sequence.slice(5)).size,5);assert.ok(p.sequence.every((id,i)=>!i||id!==p.sequence[i-1]));
  }
});
test('incorrect attempts retain the box, unlock hints and allow retry without penalty',()=>{
  const state={hydration:42,waterSips:2,inventory:['water']},p=rescueState(state),m=currentMedicine(p);
  const wrong=sortingBins.find(b=>b.id!==m.bin);assert.equal(sortMedicine(state,wrong.id),'retry');
  assert.equal(p.index,0);assert.equal(p.incorrect,true);assert.equal(currentMedicine(p),m);assert.ok(m.hint);
  assert.equal(sortMedicine(state,m.bin),'correct');assert.equal(p.index,1);assert.equal(p.incorrect,false);assert.equal(p.feedbackMedicine,m.id);
  assert.equal(sortMedicine(state,m.bin),'locked');assert.equal(p.index,1);assert.equal(state.hydration,42);assert.equal(state.waterSips,2);
});
test('all five categories, explanations and ten boxes lead to one persistent completed challenge',()=>{
  const state={},p=rescueState(state),bins=new Set();
  for(let i=0;i<10;i++){
    const m=currentMedicine(p);bins.add(m.bin);assert.ok(m.explanation);assert.equal(sortMedicine(state,m.bin),'correct');
    assert.equal(p.feedbackMedicine,m.id);assert.equal(continueSorting(state),i===9);
  }
  assert.equal(bins.size,5);assert.equal(p.index,10);assert.equal(p.completed,true);assert.equal(state.objective,'prescriptionCollection');
  assert.equal(sortMedicine(state,'ask'),'locked');assert.equal(rescueState(state),p);
});
test('progress and pending explanations survive registry/scene reuse; a new adventure resets them',()=>{
  const m=new Map(),r={has:k=>m.has(k),get:k=>m.get(k),set:(k,v)=>m.set(k,v)};
  const state=startNewAdventure(r,'pharmacyPanic'),p=rescueState(state);p.available=true;
  sortMedicine(state,currentMedicine(p).bin);assert.equal(getSunnyDayState(r).robotRescue,p);assert.ok(p.feedbackMedicine);
  continueSorting(state);assert.equal(p.index,1);assert.equal(p.feedbackMedicine,null);
  const fresh=startNewAdventure(r,'pharmacyPanic');assert.equal(fresh.robotRescue,undefined);assert.equal(rescueState(fresh).index,0);
});
test('malfunction unlocks once, waits through the short animation, then offers help',()=>{
  const s=new PharmacyScene();s.state={};s.hydrationHud={render(){}};
  s.menu={show(title,message,actions,options){Object.assign(this,{title,message,actions,options});},close(){}};
  let scheduled=0,finish;s.time={delayedCall(ms,fn){assert.equal(ms,1400);scheduled++;finish=fn;}};
  s.startRobotMalfunction();s.startRobotMalfunction();assert.equal(scheduled,1);assert.equal(s.menu.message,robotText.error);assert.equal(s.state.objective,'repairRobot');
  finish();assert.equal(s.menu.message,robotText.mixed);s.menu.actions[0].run();assert.equal(s.menu.message,robotText.help);
});
test('MED-BOT interaction is reachable on the public side without changing counter geometry',()=>{
  assert.equal(nearbyPharmacyObject(704,346).id,'robot');
  assert.ok(!pharmacySolids.some(r=>704-9<r.x+r.width&&704+9>r.x&&336+4<r.y+r.height&&336+16>r.y));
  assert.ok(medicines.every(m=>sortingBins.some(b=>b.id===m.bin)));
});
