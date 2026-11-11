import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { advancePlayerStatus,ensurePlayerStatus,tirednessSpeedMultiplier,increaseTiredness,recoverTiredness } from '../src/mechanics/playerStatus.js';
import { PlayerStatusRuntime,ensurePlayerStatusRuntime } from '../src/mechanics/PlayerStatusRuntime.js';
import { advanceHydration,drinkWater } from '../src/mechanics/hydration.js';
import { startNewAdventure } from '../src/scenarios/sunnyDayState.js';
const fresh=()=>({hydration:100,tiredness:0,lowestHydration:100,inventory:['water'],waterSips:4});
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('baseline depletion covers indoor and outdoor idle play; ordinary walking never adds tiredness',()=>{
 for(const outdoors of [false,true])for(const movementMs of [0,100]){const s=fresh();for(let i=0;i<100;i++)advancePlayerStatus(s,100,{outdoors,movementMs});assert.ok(s.hydration<100);assert.equal(s.tiredness,0);assert.equal(s.lowestHydration,s.hydration);}
});
test('exercise, rest and drinking have independent effects, with bounded values',()=>{
 const s=fresh();for(let i=0;i<300;i++)advancePlayerStatus(s,100,{activity:'football',movementMs:100});near(s.tiredness,54);assert.ok(s.hydration<70);
 const t=s.tiredness;drinkWater(s);assert.equal(s.tiredness,t);const h=s.hydration;
 advancePlayerStatus(s,100,{rest:'dedicated',recoveryOnly:true});assert.ok(s.tiredness<t);assert.equal(s.hydration,h);
 for(let i=0;i<10000;i++)advancePlayerStatus(s,100,{activity:'football',movementMs:100});assert.equal(s.hydration,0);assert.equal(s.tiredness,100);
 for(let i=0;i<1000;i++)advancePlayerStatus(s,100,{rest:'dedicated'});assert.equal(s.tiredness,0);assert.equal(s.hydration,0);
});
test('status uses elapsed simulation time and respects pauses and suspended gaps',()=>{
 const results=[];for(const hz of [30,60,120,144]){const s=fresh();for(let i=0;i<hz*10;i++)advancePlayerStatus(s,1000/hz,{activity:'football',movementMs:1000/hz});results.push(s);}
 for(const s of results){near(s.hydration,results[0].hydration);near(s.tiredness,18);}
 const s=fresh();advancePlayerStatus(s,100,{paused:true,activity:'football',movementMs:100});advancePlayerStatus(s,30000,{activity:'football',movementMs:30000});assert.equal(s.hydration,100);assert.equal(s.tiredness,0);
});
test('future PE helpers and smooth modest speed adjustment do not couple statuses',()=>{
 const s=fresh();increaseTiredness(s,10,'pe');assert.equal(s.tiredness,10);assert.equal(s.hydration,100);recoverTiredness(s,2);assert.equal(s.tiredness,8);
 let last=1;for(let n=0;n<=100;n++){s.tiredness=n;const speed=tirednessSpeedMultiplier(s);assert.ok(speed<=last&&last-speed<.003);assert.ok(speed>=.88);last=speed;}
});
test('new adventures initialise both values, existing state remains authoritative',()=>{
 const m=new Map(),r={get:k=>m.get(k),has:k=>m.has(k),set:(k,v)=>m.set(k,v)};
 for(const adventure of ['sunnyDay','pharmacyPanic','schoolDay']){const s=startNewAdventure(r,adventure);assert.equal(s.hydration,100);assert.equal(s.tiredness,0);s.hydration=65;s.tiredness=32;ensurePlayerStatus(s);assert.equal(s.hydration,65);assert.equal(s.tiredness,32);}
});
test('global runtime has one listener, pauses menus, recovers only on explicit rest screens and clears exertion across scenes',()=>{
 globalThis.document={hidden:false,hasFocus:()=>true,querySelector:()=>modal};let modal=null;
 let scene={state:fresh(),controls:{},sys:{isActive:()=>true},scene:{key:'School'},player:{body:{x:0,y:0}},physics:{world:{isPaused:false}},hydrationHud:{render(){}}};
 const game={events:new EventEmitter(),scene:{getScenes:()=>[scene]}};scene.game=game;
 const runtime=ensurePlayerStatusRuntime(scene);assert.equal(ensurePlayerStatusRuntime(scene),runtime);assert.equal(game.events.listenerCount('poststep'),1);
 runtime.tick(100);assert.ok(scene.state.hydration<100);const before=scene.state.hydration;
 modal={dataset:{}};runtime.tick(100);assert.equal(scene.state.hydration,before);
 scene.state.tiredness=60;runtime.startRest(scene,{dedicated:true});modal.dataset.restRecovery='true';runtime.tick(100);assert.ok(scene.state.tiredness<60);assert.equal(scene.state.hydration,before);
 modal=null;runtime.stopRest(scene);runtime.startPhysicalActivity(scene,'pe');scene.player.body.x+=15;runtime.tick(100);const old=scene.state;assert.ok(old.tiredness>59.7);
 scene={...scene,scene:{key:'Pharmacy'},player:{body:{x:400,y:200}},game};runtime.tick(100);const tired=old.tiredness;scene.player.body.x+=15;runtime.tick(100);assert.equal(old.tiredness,tired);
 game.events.emit('destroy');assert.equal(game.events.listenerCount('poststep'),0);
});
test('legacy movement sampler still reports activity duration without duplicate depletion when managed',()=>{
 const s=fresh();const ms=advanceHydration(s,100,{outdoors:true,moving:true,focused:true,statusManaged:true});assert.equal(ms,100);assert.equal(s.hydration,100);
});
test('resolved physics movement drives exertion at 30–144Hz, blocked input and teleports do not',()=>{
 globalThis.document={hidden:false,hasFocus:()=>true,querySelector:()=>null};
 for(const hz of [30,60,120,144]){
  const scene={state:fresh(),controls:{},events:new EventEmitter(),sys:{isActive:()=>true},scene:{key:'School'},player:{body:{x:0,y:0}},physics:{world:{isPaused:false}}};
  const game={events:new EventEmitter(),scene:{getScenes:()=>[scene]}};scene.game=game;
  const runtime=ensurePlayerStatusRuntime(scene);runtime.startPhysicalActivity(scene,'pe');runtime.tick(1000/hz);
  for(let i=1;i<=10*hz;i++){scene.player.body.x=150*Math.floor(i/hz*60+1e-7)/60;runtime.tick(1000/hz);}
  assert.ok(Math.abs(scene.state.tiredness-10)<.02);
  const t=scene.state.tiredness;for(let i=0;i<hz;i++)runtime.tick(1000/hz);assert.ok(scene.state.tiredness-t<.02);
  scene.player.body.x+=500;runtime.tick(1000/hz);assert.ok(scene.state.tiredness-t<.02);
  scene.events.emit('shutdown');runtime.attachScene(scene);scene.player.body.x+=1;runtime.tick(1000/hz);assert.equal(runtime.activities.get(scene),undefined);
  game.events.emit('destroy');
 }
});
