import test from 'node:test';
import assert from 'node:assert/strict';
import { canUnlockMission,unlockMission,chooseRoutine,toggleReminder,answerForgotten,completeMission } from '../src/mission/model.js';
import { missionData,missionText } from '../src/scenarios/medicineMissionData.js';
import { pharmacyCompletionAdvice } from '../src/mission/completion.js';
import { medicineDesk,bedroomSolids } from '../src/bedroom/layout.js';
import { getSunnyDayState,startNewAdventure } from '../src/scenarios/sunnyDayState.js';
globalThis.Phaser={Scene:class{}};
const { BedroomScene }=await import('../src/BedroomScene.js');
const { MedicineMission }=await import('../src/mission/MedicineMission.js');
const ready=()=>({adventure:'pharmacyPanic',prescription:{bagReceived:true,homeMessageSeen:true},inventory:[],departureItems:[]});
test('medicine mission unlocks only in Adventure 2 after receiving the bag and returning home',()=>{
  for(const state of [{adventure:'sunnyDay'}, {adventure:'pharmacyPanic'}, {adventure:'pharmacyPanic',prescription:{bagReceived:true,homeMessageSeen:false}}]){
    assert.equal(canUnlockMission(state),false);assert.equal(unlockMission(state),null);assert.equal(state.medicineMission,undefined);
  }
  const state=ready();const p=unlockMission(state);assert.equal(p.step,'intro');assert.equal(state.objective,'medicinePlan');assert.equal(unlockMission(state),p);
});
test('all four fictional routine points are accepted without universal medicine timing',()=>{
  for(const choice of missionData.timeline){const state=ready(),p=unlockMission(state);p.step='routine';assert.equal(chooseRoutine(state,choice.id),true);assert.equal(p.routine,choice.id);assert.equal(p.step,'routineFeedback');}
  assert.ok(missionText.instruction.includes('time agreed'));
});
test('one or more reminders and optional backup are saved without duplicates',()=>{
  const s=ready(),p=unlockMission(s);p.step='reminders';toggleReminder(s,'phone');toggleReminder(s,'chart');assert.deepEqual(p.reminders,['phone','chart']);
  toggleReminder(s,'chart');assert.deepEqual(p.reminders,['phone']);p.step='backup';toggleReminder(s,'phone');toggleReminder(s,'carer');toggleReminder(s,'carer');assert.deepEqual(p.reminders,['phone','carer']);
  assert.equal(toggleReminder(s,'invalid'),false);
});
test('extra doses and guessing do not advance; checking allows completion with a saved plan',()=>{
  const s=ready(),p=unlockMission(s);p.step='routine';chooseRoutine(s,'evening');p.step='reminders';toggleReminder(s,'routine');p.step='forget';
  for(const answer of ['extra','guess']){assert.equal(answerForgotten(s,answer),false);assert.equal(p.step,'forget');assert.equal(p.completed,false);}
  assert.equal(completeMission(s),false);assert.equal(answerForgotten(s,'check'),true);assert.equal(completeMission(s),true);assert.equal(p.completed,true);
  assert.equal(chooseRoutine(s,'school'),false);assert.equal(toggleReminder(s,'phone'),false);
});
test('plan and completed earlier activities survive scene-state reuse; a new adventure resets mission progress',()=>{
  const entries=new Map(),r={has:k=>entries.has(k),get:k=>entries.get(k),set:(k,v)=>entries.set(k,v)};
  const s=startNewAdventure(r,'pharmacyPanic');Object.assign(s,ready());s.robotRescue={completed:true,index:12};const p=unlockMission(s);p.step='reminders';toggleReminder(s,'chart');
  assert.equal(getSunnyDayState(r).medicineMission,p);assert.equal(s.robotRescue.index,12);assert.equal(s.prescription.bagReceived,true);assert.equal(unlockMission(s).step,'reminders');
  assert.equal(startNewAdventure(r,'pharmacyPanic').medicineMission,undefined);
});
test('desk approach is clear of furniture and does not replace the backpack zone',()=>{
  const x=656,y=240,z=medicineDesk.zone;assert.ok(x>=z.x&&x<z.x+z.width&&y+10>=z.y&&y+10<z.y+z.height);
  assert.ok(!bedroomSolids.some(r=>x-9<r.x+r.width&&x+9>r.x&&y+4<r.y+r.height&&y+16>r.y));
  assert.ok(z.x>=640,'backpack front remains reachable');
});
test('completion advice prioritises departure clothing, water and the saved reminders in three cards',()=>{
  const s=ready();s.warmClothingOnDeparture=true;s.departureItems=['water'];s.medicineMission={reminders:['phone','carer']};
  let advice=pharmacyCompletionAdvice(s);assert.equal(advice.length,3);assert.equal(advice[0],missionText.warm);assert.equal(advice[1],missionText.water);assert.ok(advice[2].includes('Phone alarm'));assert.ok(advice[2].includes('Parent or carer reminder'));
  s.warmClothingOnDeparture=false;s.departureItems=[];advice=pharmacyCompletionAdvice(s);assert.equal(advice[0],missionText.light);assert.equal(advice[1],missionText.noWater);
});
test('supportive correction permits retry and the completion screen has three cards, Next Adventure and selection',()=>{
  globalThis.document={createElement:tag=>({tag,children:[],append(...children){this.children.push(...children);}})};
  const s=new BedroomScene();s.state=ready();s.state.medicineMission={step:'forget',completed:false,reminders:['chart'],routine:'breakfast'};
  s.events={once(){}};s.dialog={show(title,message,actions,options){Object.assign(this,{title,message,actions,options});},close(){}};
  s.controls={reset(){}};s.player={setVelocity(){}};s.hydrationHud={render(){}};
  const mission=new MedicineMission(s);mission.open();s.dialog.actions.find(a=>a.label===missionText.answers[0].label).run();assert.equal(s.dialog.message,missionText.correction);s.dialog.actions[0].run();assert.equal(s.dialog.message,missionText.forget);
  s.dialog.actions.find(a=>a.label===missionText.answers[1].label).run();assert.equal(s.dialog.message,missionText.safe);completeMission(s.state);
  s.showPharmacyCompletion();assert.equal(s.dialog.title,missionText.adventureTitle);assert.equal(s.dialog.options.content.children.filter(c=>c.className==='advice-box').length,3);
  s.dialog.actions.find(a=>a.label===missionText.next).run();assert.equal(s.dialog.message,missionText.comingSoon);assert.ok(s.dialog.actions.some(a=>a.label===missionText.selection));
});
