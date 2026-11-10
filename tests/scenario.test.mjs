import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { ParkVisitClock } from '../src/scenarios/ParkVisitClock.js';
import { scenarioSettings } from '../src/settings/scenario.js';
import { getSunnyDayState,collectItem,recordHomeDeparture } from '../src/scenarios/sunnyDayState.js';
import { completionAdvice } from '../src/scenarios/completionAdvice.js';
import { advanceHydration,drinkWater } from '../src/mechanics/hydration.js';
import { sunnyDayText as text } from '../src/scenarios/sunnyDayText.js';
import { homeZone,obstacles } from '../src/world.js';
globalThis.Phaser={Scene:class{}};
const { ParkScene }=await import('../src/ParkScene.js');
const { BedroomScene }=await import('../src/BedroomScene.js');

class Target extends EventEmitter {
  addEventListener(e,fn){this.on(e,fn);}
  removeEventListener(e,fn){this.off(e,fn);}
}
function registry(){const entries=new Map();return {has:k=>entries.has(k),get:k=>entries.get(k),set:(k,v)=>entries.set(k,v)};}
function visitFixture(){
  globalThis.window=new Target();globalThis.document=Object.assign(new Target(),{hidden:false,hasFocus:()=>true});
  const s=new ParkScene();s.registry=registry();s.state=getSunnyDayState(s.registry);
  s.visitClock=new ParkVisitClock(scenarioSettings.parkVisitMs,0);s.visitEndingShown=false;s.pendingVisitEnding=false;s.visitPaused=false;s.resting=false;
  s.game={isPaused:false,events:new EventEmitter()};s.sys={isActive:()=>true};s.events=new EventEmitter();s.physics={world:{isPaused:false}};
  s.football={stops:0,stop(){this.stops++;}};s.hydrationHud={render(){}};
  s.menu={element:new Target(),open:false,shown:0,show(title,message,actions){Object.assign(this,{title,message,actions,open:true});this.shown++;},close(){this.open=false;this.element.emit('close');}};
  return s;
}

test('default visit is exactly 120 seconds of active time and expires once',()=>{
  assert.equal(scenarioSettings.parkVisitMs,120000);
  const c=new ParkVisitClock(120000,0);assert.equal(c.tick(119999,true),false);assert.equal(c.remainingMs,1);
  assert.equal(c.tick(120000,true),true);assert.equal(c.remainingMs,0);assert.equal(c.tick(999999,true),false);
});
test('inactive gaps and explicit pause time are excluded, while ordinary interactions count',()=>{
  const c=new ParkVisitClock(120000,0);c.tick(1000,true);assert.equal(c.remainingMs,119000);
  c.suspend();c.tick(61000,true);assert.equal(c.remainingMs,119000);c.tick(62000,true);assert.equal(c.remainingMs,118000);
  c.tick(63000,false);c.tick(100000,false);c.tick(101000,true);assert.equal(c.remainingMs,118000);
  c.tick(102000,true);assert.equal(c.remainingMs,117000);
  const s=visitFixture();s.menu.open=true;s.updateParkVisit(10000);assert.equal(s.visitClock.remainingMs,110000);
  s.visitPaused=true;s.updateParkVisit(20000);s.updateParkVisit(30000);assert.equal(s.visitClock.remainingMs,110000);
});
test('cancelled visits cannot fire; a new entry has a full fresh duration',()=>{
  const old=new ParkVisitClock(120000,0);old.tick(30000,true);old.cancel();assert.equal(old.tick(999999,true),false);
  const next=new ParkVisitClock(120000,500000);assert.equal(next.remainingMs,120000);next.tick(501000,true);assert.equal(next.remainingMs,119000);
});
test('expiry stops football immediately but goodbye waits for current dialogue, then appears once',()=>{
  const s=visitFixture();s.menu.open=true;s.menu.message='Current conversation';s.updateParkVisit(120000);
  assert.equal(s.football.stops,1);assert.equal(s.pendingVisitEnding,true);assert.equal(s.visitEndingShown,false);assert.equal(s.menu.message,'Current conversation');
  s.menu.close();s.updateParkVisit(120100);assert.equal(s.menu.message,text.parkGoodbye);assert.equal(s.state.objective,'headHome');assert.equal(s.menu.shown,1);
  s.menu.close();s.updateParkVisit(120200);assert.equal(s.menu.shown,1);assert.equal(s.football.stops,1);
});
test('bench rest defers ending without stopping the hidden clock',()=>{
  const s=visitFixture();s.resting=true;s.updateParkVisit(120000);assert.equal(s.visitClock.expired,true);assert.equal(s.visitEndingShown,false);
  s.resting=false;s.updateParkVisit(120100);assert.equal(s.menu.message,text.parkGoodbye);
});
test('visit lifecycle removes listeners and cancels its clock on shutdown',()=>{
  const s=visitFixture(),gameEvents=s.game.events;s.installVisitLifecycle();
  assert.equal(window.listenerCount('blur'),1);assert.equal(gameEvents.listenerCount('pause'),1);
  window.emit('blur');assert.equal(s.visitClock.lastTime,null);
  s.game.events=null;s.events.emit('shutdown');assert.equal(s.visitClock.cancelled,true);
  assert.equal(window.listenerCount('blur'),0);assert.equal(document.listenerCount('visibilitychange'),0);assert.equal(gameEvents.listenerCount('pause'),0);
});
test('front-door zone is reachable outside the original house collision boundary',()=>{
  const x=208,y=368;assert.ok(x>=homeZone.x&&x<homeZone.x+homeZone.width&&y+10>=homeZone.y&&y+10<homeZone.y+homeZone.height);
  assert.ok(!obstacles.some(r=>x-9<r.x+r.width&&x+9>r.x&&y+4<r.y+r.height&&y+16>r.y));
});
test('homecoming shows three advice boxes once and Next Adventure opens only the placeholder',()=>{
  globalThis.document={createElement:tag=>({tag,children:[],append(child){this.children.push(child);}})};
  const s=new BedroomScene();s.registry=registry();s.state=getSunnyDayState(s.registry);collectItem(s.state,'water');
  s.state.waterSips=1;s.state.hydration=22;s.state.objective='headHome';s.state.hasVisitedPark=true;s.state.callComplete=true;s.state.footballThoughts.thirsty=true;
  s.controls={reset(){}};s.player={setVelocity(){}};s.hydrationHud={render(){}};
  s.dialog={show(title,message,actions,options){Object.assign(this,{title,message,actions,options});},close(){}};s.scene={restart(){s.restarted=true;}};
  s.beginHomecoming();assert.equal(s.dialog.message,text.completeMessage);assert.equal(s.dialog.title,text.completeTitle);assert.equal(s.state.completed,true);
  assert.equal(s.dialog.options.content.children.length,3);assert.deepEqual(s.dialog.actions.map(a=>a.label),[text.nextAdventure]);
  s.dialog.actions[0].run();assert.equal(s.dialog.message,text.comingSoon);assert.deepEqual(s.dialog.actions,[]);assert.equal(s.restarted,undefined);
  s.beginHomecoming();assert.equal(s.dialog.message,text.comingSoon);
  s.playAgain();
  const fresh=getSunnyDayState(s.registry);assert.equal(s.restarted,true);assert.notEqual(fresh,s.state);assert.equal(fresh.hydration,100);assert.deepEqual(fresh.inventory,[]);assert.equal(fresh.waterSips,0);assert.equal(fresh.callComplete,false);assert.equal(fresh.completed,false);assert.equal(fresh.hasVisitedPark,false);assert.equal(fresh.objective,'explore');assert.deepEqual(fresh.footballThoughts,{thirsty:false,tired:false});
});

test('advice follows the first departure, chosen breaks and hat without adding items',()=>{
  const state=getSunnyDayState(registry()),t=text.completionAdvice;
  recordHomeDeparture(state);collectItem(state,'water');collectItem(state,'hat');recordHomeDeparture(state);
  let boxes=completionAdvice(state);assert.equal(boxes.length,3);assert.equal(boxes[0][0],t.waterForgotten);assert.deepEqual(boxes[1],[t.noRest,t.noHat]);
  const prepared=getSunnyDayState(registry());collectItem(prepared,'water');collectItem(prepared,'hat');recordHomeDeparture(prepared);prepared.rested=true;
  boxes=completionAdvice(prepared);assert.equal(boxes[0][0],t.waterTaken);assert.deepEqual(boxes[1],[t.rested,t.hatTaken]);
});

test('lowest hydration survives drinking and scene-state reuse, including the exact 30 boundary',()=>{
  const r=registry(),state=getSunnyDayState(r),context={outdoors:true,moving:true,focused:true};collectItem(state,'water');
  advanceHydration(state,42000,context);assert.ok(state.hydration<30);const low=state.hydration;
  drinkWater(state);drinkWater(state);assert.ok(state.hydration>30);assert.equal(state.lowestHydration,low);
  assert.equal(getSunnyDayState(r).lowestHydration,low);assert.equal(completionAdvice(state)[2][0],text.completionAdvice.lowHydration);
  state.lowestHydration=30;assert.equal(completionAdvice(state)[2][0],text.completionAdvice.lowHydration);
  state.lowestHydration=30.01;assert.equal(completionAdvice(state)[2][0],text.completionAdvice.regularDrinking);
});
