import test from 'node:test';
import assert from 'node:assert/strict';
import { startNewAdventure,getSunnyDayState,chooseOutfit,collectItem,recordHomeDeparture } from '../src/scenarios/sunnyDayState.js';
import { coldMorningText as text } from '../src/scenarios/coldMorningText.js';
import { coldMorningSettings } from '../src/settings/coldMorning.js';
import { advanceHydration,drinkWater } from '../src/mechanics/hydration.js';
import { seasonalTexture } from '../src/pixel/winter.js';
globalThis.Phaser={Scene:class{}};
const { BedroomScene }=await import('../src/BedroomScene.js');
const { PharmacyScene }=await import('../src/PharmacyScene.js');
const registry=()=>{const m=new Map();return {get:k=>m.get(k),has:k=>m.has(k),set:(k,v)=>m.set(k,v)};};
test('Adventure 2 starts fresh in separate registry state, preserving Adventure 1',()=>{
  const r=registry(),sunny=startNewAdventure(r);sunny.completed=true;sunny.hydration=65;
  const cold=startNewAdventure(r,'pharmacyPanic');assert.notEqual(cold,sunny);assert.equal(getSunnyDayState(r),cold);
  assert.equal(r.get('kickstart.sunnyDay'),sunny);assert.equal(sunny.hydration,65);assert.equal(sunny.completed,true);
  assert.equal(cold.hydration,100);assert.deepEqual(cold.inventory,[]);assert.equal(cold.objective,'collectPrescription');assert.equal(cold.callComplete,false);
});
test('warm clothing is optional and departure records the chosen outfit independently',()=>{
  const s=startNewAdventure(registry(),'pharmacyPanic');chooseOutfit(s,'everyday',text.outfits);assert.equal(s.warmClothing,false);
  chooseOutfit(s,'coat-hat',text.outfits);assert.equal(s.warmClothing,true);assert.equal(s.wearingHat,true);recordHomeDeparture(s);
  chooseOutfit(s,'everyday',text.outfits);assert.equal(s.warmClothingOnDeparture,true);assert.equal(s.hydration,100);
});
test('cold walking drains more slowly, idle does not drain, bottle still restores 25 and records drinking/minimum',()=>{
  const r=registry(),sunny=startNewAdventure(r),cold=startNewAdventure(r,'pharmacyPanic'),active={outdoors:true,moving:true,focused:true};
  advanceHydration(sunny,10000,active);advanceHydration(cold,10000,active);
  assert.ok(Math.abs((100-cold.hydration)/(100-sunny.hydration)-coldMorningSettings.walkingHydrationMultiplier)<1e-8);
  const saved=cold.hydration;advanceHydration(cold,60000,{...active,moving:false});assert.equal(cold.hydration,saved);
  collectItem(cold,'water');assert.equal(cold.waterSips,4);advanceHydration(cold,60000,active);const low=cold.hydration;
  drinkWater(cold);assert.equal(cold.hydration,low+25);assert.equal(cold.waterSips,3);assert.equal(cold.drankWater,true);assert.equal(cold.lowestHydration,low);
});
test('cold phone uses the existing two-page call and stops at bedroom exploration',()=>{
  const s=new BedroomScene();s.state=startNewAdventure(registry(),'pharmacyPanic');
  s.ring={start(){},stop(){}};const label={setOrigin(){return this;},setDepth(){return this;},setVisible(){}};
  s.add={text:()=>label};s.tweens={add:()=>({stop(){}})};s.dialog={show(title,message,actions){Object.assign(this,{title,message,actions});},close(){}};
  s.startCall();assert.equal(s.dialog.message,text.call[0]);s.dialog.actions[0].run();assert.equal(s.dialog.message,text.call[1]);s.dialog.actions[0].run();assert.equal(s.state.callComplete,true);
});
test('cold pharmacist stops after the robot observation, without changing the objective or starting gameplay',()=>{
  const s=new PharmacyScene();s.state=startNewAdventure(registry(),'pharmacyPanic');
  s.menu={open:false,show(title,message,actions){Object.assign(this,{title,message,actions,open:true});},close(){this.open=false;}};
  s.interact('pharmacist');for(const line of text.pharmacist){assert.equal(s.menu.message,line);s.menu.actions[0].run();}
  assert.equal(s.state.introFinished,true);assert.equal(s.state.objective,'collectPrescription');assert.equal(s.menu.open,false);
});
test('winter textures are cached separately and sunny artwork is untouched',()=>{
  const pixels=new Uint8ClampedArray([120,162,83,255,72,84,106,255]),textures=new Map();let copies=0;
  const scene={state:{adventure:'sunnyDay'},textures:{exists:k=>textures.has(k),get:()=>({getSourceImage:()=>({width:2,height:1})}),createCanvas(key){copies++;const texture={getContext:()=>({drawImage(){},getImageData:()=>({data:pixels}),putImageData(){}}),refresh(){}};textures.set(key,texture);return texture;}}};
  assert.equal(seasonalTexture(scene,'street'),'street');assert.equal(copies,0);scene.state.adventure='pharmacyPanic';
  assert.equal(seasonalTexture(scene,'street'),'street-winter');assert.ok(pixels[0]>120);assert.ok(pixels[6]>106);
  seasonalTexture(scene,'street');assert.equal(copies,1);scene.state.adventure='sunnyDay';assert.equal(seasonalTexture(scene,'street'),'street');
});
