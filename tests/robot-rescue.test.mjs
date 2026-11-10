import test from 'node:test';
import assert from 'node:assert/strict';
import { medicines,sortingBins,robotText } from '../src/scenarios/robotRescueData.js';
import { rescueState,currentMedicine,sortMedicine,continueSorting } from '../src/robot/model.js';
import { getSunnyDayState,startNewAdventure } from '../src/scenarios/sunnyDayState.js';
import { nearbyPharmacyObject,pharmacySolids } from '../src/pharmacy/layout.js';
import { robotLightState,robotLightColours } from '../src/robot/lights.js';
import { RobotDisplay } from '../src/robot/RobotDisplay.js';
globalThis.Phaser={Scene:class{}};
const { PharmacyScene }=await import('../src/PharmacyScene.js');
test('twelve shuffled boxes include all nine named medicines and avoid adjacent repeats',()=>{
  for(let seed=1;seed<100;seed++){
    let n=seed;const random=()=>{n=(n*1664525+1013904223)>>>0;return n/2**32;};
    const p=rescueState({},random);assert.equal(p.sequence.length,12);assert.equal(new Set(p.sequence.slice(0,9)).size,9);
    assert.equal(new Set(p.sequence.slice(9)).size,3);assert.ok(p.sequence.every((id,i)=>!i||id!==p.sequence[i-1]));
    assert.deepEqual([...new Set(p.sequence)].sort(),medicines.map(m=>m.id).sort());
  }
});
test('incorrect attempts retain the box, unlock hints and allow retry without penalty',()=>{
  const state={hydration:42,waterSips:2,inventory:['water']},p=rescueState(state),m=currentMedicine(p);
  const wrong=sortingBins.find(b=>b.id!==m.bin);assert.equal(sortMedicine(state,wrong.id),'retry');
  assert.equal(p.index,0);assert.equal(p.incorrect,true);assert.equal(currentMedicine(p),m);assert.ok(m.hint);
  assert.equal(sortMedicine(state,m.bin),'correct');assert.equal(p.index,1);assert.equal(p.incorrect,false);assert.equal(p.feedbackMedicine,m.id);
  assert.equal(sortMedicine(state,m.bin),'locked');assert.equal(p.index,1);assert.equal(state.hydration,42);assert.equal(state.waterSips,2);
});
test('all five categories, explanations and twelve boxes lead to one persistent completed challenge',()=>{
  const state={},p=rescueState(state),bins=new Set();
  for(let i=0;i<12;i++){
    const m=currentMedicine(p);bins.add(m.bin);assert.ok(m.explanation);assert.equal(sortMedicine(state,m.bin),'correct');
    assert.equal(p.feedbackMedicine,m.id);assert.equal(continueSorting(state),i===11);
  }
  assert.equal(bins.size,5);assert.equal(p.index,12);assert.equal(p.completed,true);assert.equal(state.objective,'prescriptionCollection');
  assert.equal(sortMedicine(state,'ask'),'locked');assert.equal(rescueState(state),p);
});

test('all nine named medicines map to their intended categories, including shared pain and Other bins',()=>{
  const expected={Penicillin:'infection','Folic acid':'cells',Hydroxycarbamide:'complications',Paracetamol:'pain',Ibuprofen:'pain',Morphine:'pain',Cetirizine:'ask',Omeprazole:'ask','Salbutamol inhaler':'ask'};
  assert.equal(medicines.length,9);
  for(const medicine of medicines){
    assert.equal(medicine.bin,expected[medicine.name]);assert.ok(medicine.explanation);assert.ok(medicine.hint);
    const state={robotRescue:{sequence:[medicine.id],index:0,completed:false,feedbackMedicine:null}};
    assert.equal(sortMedicine(state,medicine.bin),'correct');assert.equal(state.robotRescue.feedbackMedicine,medicine.id);
  }
  assert.equal(sortingBins.find(b=>b.id==='ask').label,'Other / Ask Pharmacist');
});

test('robot lights use saved progress: inactive/completed green, warning alternates at 250ms',()=>{
  const p={available:false,completed:false};
  assert.equal(robotLightState(p),'normal');assert.deepEqual(robotLightColours(p,0),[0x71d096,0x71d096]);
  p.available=true;assert.equal(robotLightState(p),'warning');
  assert.deepEqual(robotLightColours(p,0),[0xf15c59,0x652b30]);assert.deepEqual(robotLightColours(p,249),robotLightColours(p,0));
  assert.deepEqual(robotLightColours(p,250),[0x652b30,0xf15c59]);assert.deepEqual(robotLightColours(p,500),robotLightColours(p,0));
  const reentered=JSON.parse(JSON.stringify(p));assert.equal(robotLightState(reentered),'warning');
  p.completed=true;assert.equal(robotLightState(p),'normal');
  for(const time of [0,250,500,999999])assert.deepEqual(robotLightColours(p,time),[0x71d096,0x71d096]);
  assert.equal(robotLightState(JSON.parse(JSON.stringify(p))),'normal');
});

test('the short malfunction shake still starts after spending time beside the inactive robot',()=>{
  const drawing={clear(){return this;},fillStyle(){return this;},fillRect(){return this;},setDepth(){return this;}};
  const label={setOrigin(){return this;},setDepth(){return this;},setVisible(){return this;},setText(){return this;}};
  const scene={state:{robotRescue:{available:false,completed:false}},add:{graphics:()=>drawing,text:()=>label}};
  const display=new RobotDisplay(scene);
  for(let i=0;i<100;i++)display.update(100);
  assert.equal(display.elapsed,10000);scene.state.robotRescue.available=true;display.update(16);
  assert.equal(display.elapsed,16);display.update(16);assert.equal(display.elapsed,32);
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
