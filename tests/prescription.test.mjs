import test from 'node:test';
import assert from 'node:assert/strict';
import { startPrescription,collectPrescriptionMedicine,allMedicinesFound,receivePrescriptionBag } from '../src/prescription/model.js';
import { prescriptionData as data,prescriptionText as text } from '../src/scenarios/prescriptionData.js';
import { openPrescriptionCard } from '../src/prescription/card.js';
import { PrescriptionActivity } from '../src/prescription/PrescriptionActivity.js';
import { pharmacyObjects,pharmacySolids } from '../src/pharmacy/layout.js';
import { startNewAdventure,getSunnyDayState } from '../src/scenarios/sunnyDayState.js';
globalThis.Phaser={Scene:class{}};
const { BedroomScene }=await import('../src/BedroomScene.js');
const ready=()=>({adventure:'pharmacyPanic',robotRescue:{completed:true},inventory:[],hydration:64,waterSips:2});
test('only repaired MED-BOT in Adventure 2 unlocks Alex’s fictional prescription',()=>{
  for(const state of [{adventure:'sunnyDay',robotRescue:{completed:true}},{adventure:'pharmacyPanic'},{adventure:'pharmacyPanic',robotRescue:{completed:false}}]){
    assert.equal(startPrescription(state),false);assert.equal(state.prescription,undefined);assert.equal(collectPrescriptionMedicine(state,'penicillin'),'locked');
  }
  const state=ready();assert.equal(startPrescription(state),true);assert.equal(state.objective,'findPrescription');assert.equal(state.prescription.found.length,0);
});
test('correct medicines collect once; look-alike and other wrong labels allow retry without changing the basket',()=>{
  const state=ready();startPrescription(state);
  assert.equal(collectPrescriptionMedicine(state,'paracetamol'),'wrong');assert.deepEqual(state.prescription.found,[]);
  for(const id of data.required){assert.equal(collectPrescriptionMedicine(state,id),'collected');assert.equal(collectPrescriptionMedicine(state,id),'duplicate');}
  assert.equal(allMedicinesFound(state),true);assert.equal(state.prescription.found.length,3);assert.equal(state.objective,'returnPharmacist');
  assert.equal(state.hydration,64);assert.equal(state.waterSips,2);
});
test('only a complete basket can receive one sealed bag, and new adventures reset prescription progress',()=>{
  const entries=new Map(),r={has:k=>entries.has(k),get:k=>entries.get(k),set:(k,v)=>entries.set(k,v)};
  const state=startNewAdventure(r,'pharmacyPanic');state.robotRescue={completed:true};startPrescription(state);
  assert.equal(receivePrescriptionBag(state),false);
  for(const id of data.required)collectPrescriptionMedicine(state,id);
  assert.equal(getSunnyDayState(r).prescription,state.prescription);assert.equal(receivePrescriptionBag(state),true);assert.equal(receivePrescriptionBag(state),false);
  assert.deepEqual(state.inventory,['prescriptionBag']);assert.equal(state.objective,'takePrescriptionHome');
  assert.equal(collectPrescriptionMedicine(state,'penicillin'),'locked');assert.equal(startNewAdventure(r,'pharmacyPanic').prescription,undefined);
});
test('both existing shelf interaction zones are reachable and contain every required medicine',()=>{
  const found=data.shelves.flatMap(s=>s.items);assert.ok(data.required.every(id=>found.includes(id)));
  for(const [id,x,y] of [['shelf-left',192,432],['shelf-right',768,432]]){
    const z=pharmacyObjects.find(z=>z.id===id);assert.ok(x>=z.x&&x<z.x+z.width&&y+10>=z.y&&y+10<z.y+z.height);
    assert.ok(!pharmacySolids.some(r=>x-9<r.x+r.width&&x+9>r.x&&y+4<r.y+r.height&&y+16>r.y));
  }
});
function dom(){globalThis.document={createElement:tag=>({tag,children:[],append(...children){this.children.push(...children);},addEventListener(){}})};}
test('card clearly labels fictional Alex, lists three medicine names and returns to its originating view',()=>{
  dom();const state=ready();startPrescription(state);let returned=false;
  const menu={show(title,message,actions,options){Object.assign(this,{title,message,actions,options});}};
  openPrescriptionCard(menu,state,()=>{returned=true;});assert.equal(menu.title,text.title);
  const content=menu.options.content;assert.equal(content.children[0].textContent,'Patient: Alex (fictional)');
  assert.deepEqual(content.children[2].children.map(c=>c.textContent),['Penicillin','Folic acid','Hydroxycarbamide']);
  assert.equal(content.children[3].textContent,text.disclaimer);menu.actions[0].run();assert.equal(returned,true);
});
test('pharmacist performs final checks and scene-owned packing animation before handing over the bag',()=>{
  dom();const state=ready();startPrescription(state);data.required.forEach(id=>collectPrescriptionMedicine(state,id));
  let finish,destroyed=false;const parcel={setDepth(){return this;},setPosition(){return this;},fillStyle(){return this;},fillRect(){return this;},destroy(){destroyed=true;}};
  const scene={state,hydrationHud:{render(){}},menu:{show(title,message,actions,options){Object.assign(this,{title,message,actions,options});},close(){}},add:{graphics:()=>parcel},tweens:{add(){}},time:{delayedCall(ms,fn){assert.equal(ms,1500);finish=fn;}}};
  const activity=new PrescriptionActivity(scene);activity.pharmacist();assert.equal(scene.menu.message,text.finalChecks[0]);scene.menu.actions[0].run();assert.equal(scene.menu.message,text.finalChecks[1]);scene.menu.actions[0].run();
  assert.equal(scene.menu.message,text.preparing);assert.equal(state.prescription.bagReceived,false);finish();assert.equal(state.prescription.bagReceived,true);assert.equal(destroyed,true);assert.equal(scene.menu.message,text.received);
});
test('returning home with the bag unlocks the desk and keeps bedroom exploration available',()=>{
  const scene=new BedroomScene();scene.state=ready();startPrescription(scene.state);data.required.forEach(id=>collectPrescriptionMedicine(scene.state,id));receivePrescriptionBag(scene.state);
  scene.controls={reset(){}};scene.player={setVelocity(){}};scene.hydrationHud={render(){}};scene.dialog={show(title,message,actions,options){Object.assign(this,{title,message,actions,options});},close(){}};
  scene.beginPrescriptionHomecoming();assert.equal(scene.dialog.message,text.home);assert.equal(scene.dialog.actions.length,1);assert.notEqual(scene.completing,true);assert.equal(scene.state.prescription.homeMessageSeen,true);
  assert.equal(scene.state.objective,'medicinePlan');assert.equal(scene.state.medicineMission.step,'intro');
});
