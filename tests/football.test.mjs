import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { FootballModel } from '../src/football/model.js';
import { FootballActivity } from '../src/football/FootballActivity.js';
import { footballSettings as config } from '../src/settings/football.js';
import { footballText as copy } from '../src/scenarios/footballText.js';
import { HydrationMovement } from '../src/mechanics/hydration.js';

test('automatic kicking moves the ball towards the target and keeps it contained',()=>{
  const model=new FootballModel();model.start();
  model.ballLock=0;model.actors.forEach(actor=>{actor.cooldown=0;actor.touching=false;});
  const x=model.ball.x;model.update(16,{x:x-10,y:model.ball.y});assert.ok(model.ball.x>x);assert.ok(model.ball.vx>0);
  const b=config.bounds;
  for(let frame=0;frame<12000;frame++){
    model.update(16,{x:model.ball.x,y:model.ball.y});
    assert.ok(model.ball.x>=b.x&&model.ball.x<=b.x+b.width);
    assert.ok(model.ball.y>=b.y&&model.ball.y<=b.y+b.height);
  }
});

test('ball freezes for menus, idle scenario prompts and stops cleanly',()=>{
  const model=new FootballModel();model.start();model.update(16,{x:model.ball.x,y:model.ball.y});
  const saved={...model.ball};model.update(10000,{x:0,y:0},true);assert.deepEqual(model.ball,saved);
  model.awaitingChoice=true;model.update(10000,{x:0,y:0});assert.deepEqual(model.ball,saved);
  model.stop();model.update(16,{x:0,y:0});assert.deepEqual(model.ball,saved);
});

test('scripted tiredness uses 35 active seconds, then 10 more; no hydration input exists',()=>{
  const model=new FootballModel();model.start();
  assert.equal(model.recordMovement(0),false);assert.equal(model.recordMovement(34999),false);
  assert.equal(model.recordMovement(1),true);assert.equal(model.eventCount,1);
  assert.equal(model.recordMovement(100000),false);assert.equal(model.movementMs,35000);
  model.continuePlaying();assert.equal(model.recordMovement(9999),false);assert.equal(model.recordMovement(1),true);
  assert.equal(model.eventCount,2);assert.equal(model.movementMs,45000);
});

test('accepted movement runs hydration faster in football, and timers pause with menus/stillness',()=>{
  const walking={hydration:100,inventory:[]},playing={hydration:100,inventory:[]};
  const a=new HydrationMovement(walking),b=new HydrationMovement(playing),model=new FootballModel();model.start();
  const context={outdoors:true,moving:true,dialogOpen:false,paused:false,focused:true};
  a.sample(0,0,1000,context);b.sample(0,0,1000,context);
  for(let second=1;second<=10;second++){
    a.sample(second*150,0,1000,context);
    model.recordMovement(b.sample(second*150,0,1000,{...context,rateMultiplier:config.hydrationMultiplier}));
  }
  assert.ok(Math.abs((100-playing.hydration)/(100-walking.hydration)-config.hydrationMultiplier)<.000001);
  const time=model.movementMs,saved=playing.hydration;
  model.recordMovement(b.sample(1500,0,1000,context));
  model.recordMovement(b.sample(1650,0,1000,{...context,dialogOpen:true}));
  assert.equal(model.movementMs,time);assert.equal(playing.hydration,saved);
});

class TestElement extends EventEmitter {
  constructor(){super();this.hidden=false;this.children=[];}
  addEventListener(event,listener){this.on(event,listener);}
  removeEventListener(event,listener){this.off(event,listener);}
  append(child){this.children.push(child);}
  remove(){this.removed=true;}
}
function activityFixture(){
  globalThis.document={createElement:()=>new TestElement(),querySelector:()=>({textContent:''})};
  const actions=new TestElement();
  const scene={state:{hydration:100,inventory:[],waterSips:0,footballThoughts:{thirsty:false,tired:false}},events:new EventEmitter(),controls:{reset(){}},
    add:{graphics:()=>{const g={};for(const key of ['setDepth','setVisible','lineStyle','strokeRect','clear','fillStyle','fillRect'])g[key]=()=>g;return g;},text:()=>{const t={};for(const key of ['setOrigin','setDepth','setVisible','setPosition'])t[key]=()=>t;t.setText=value=>{t.text=value;return t;};return t;}},
    hydrationHud:{element:{querySelector:()=>actions},render(){}},hydrationMovement:{reset(){}},prompt:{setVisible(){}},
    physics:{world:{setBounds(x,y,width,height){this.bounds={x,y,width,height};}}}
  };
  scene.player={x:1100,y:592,setVelocity(){},body:{reset(x,y){scene.player.x=x;scene.player.y=y;}}};
  scene.menu={element:new TestElement(),show(title,message,options){Object.assign(this,{title,message,options,open:true});},close(){this.open=false;this.element.emit('close');}};
  const activity=new FootballActivity(scene);return {activity,scene};
}

test('activity can start and leave repeatedly without changing shared state',()=>{
  const {activity,scene}=activityFixture(),saved=JSON.stringify(scene.state);
  for(let i=0;i<20;i++){
    activity.start();assert.equal(activity.active,true);assert.deepEqual(scene.physics.world.bounds,config.bounds);
    assert.equal(scene.hydrationRateMultiplier,config.hydrationMultiplier);
    activity.stop();assert.equal(activity.active,false);assert.equal(scene.player.x,1100);assert.equal(scene.player.y,592);
    assert.equal(scene.hydrationRateMultiplier,1);assert.equal(JSON.stringify(scene.state),saved);
  }
  scene.events.emit('shutdown');assert.equal(activity.leaveButton.removed,true);assert.equal(scene.menu.element.listenerCount('close'),0);
});

test('all three tiredness choices work and a later prompt offers stopping again',()=>{
  for(const choice of ['rest','water','continue']){
    const {activity,scene}=activityFixture();activity.start();activity.recordMovement(35000);
    assert.ok(scene.menu.message.startsWith(copy.first));assert.equal(scene.menu.options.length,3);
    scene.menu.options.find(action=>action.label===copy[choice]).run();
    if(choice==='continue'){
      assert.equal(activity.active,true);activity.recordMovement(10000);
      assert.ok(scene.menu.message.startsWith(copy.continuing));assert.ok(scene.menu.message.includes(copy.safety));
      scene.menu.options.find(action=>action.label===copy.rest).run();
    }
    assert.equal(activity.active,false);assert.ok(scene.menu.message.includes(copy.safety));
    assert.equal(scene.state.hydration,100);assert.deepEqual(scene.state.inventory,[]);
    scene.events.emit('shutdown');
  }
});

test('closing the symptom dialog leaves the activity instead of forcing a choice',()=>{
  const {activity,scene}=activityFixture();activity.start();activity.recordMovement(35000);scene.menu.close();
  assert.equal(activity.active,false);assert.equal(scene.player.x,1100);assert.equal(scene.player.y,592);
});

test('status effects never advance or trigger the independent scripted event',()=>{
  const {activity,scene}=activityFixture();activity.start();
  for(const hydration of [60,30,10]){
    scene.state.hydration=hydration;activity.checkHydration();
    assert.equal(activity.model.movementMs,0);assert.equal(activity.model.eventCount,0);
  }
  assert.ok(scene.menu.message.startsWith(copy.low));assert.equal(activity.active,false);
});

test('player contact directions vary, all four actors can kick, and overlap cannot spam kicks',()=>{
  for(const direction of [{vx:150,vy:0},{vx:-150,vy:0},{vx:0,vy:150},{vx:0,vy:-150}]){
    const m=new FootballModel();m.start();m.ballLock=0;m.player.cooldown=0;
    Object.assign(m.player,{x:m.ball.x,y:m.ball.y,...direction});m.kick(m.player);
    const component=direction.vx?'vx':'vy';assert.ok(m.ball[component]*direction[component]>0);
  }
  for(const id of ['player','jay','orange1','orange2']){
    const m=new FootballModel();m.start();m.ballLock=0;
    const actor=m.actors.find(a=>a.id===id);actor.cooldown=0;actor.touching=false;
    actor.x=m.ball.x+(actor.team==='orange'?10:-10);actor.y=m.ball.y;
    const input=id==='player'?{x:actor.x,y:actor.y,vx:150,vy:0}:{x:1000,y:180};
    m.update(16,input);assert.equal(m.lastKicker,id);
    assert.ok(actor.team==='blue'?m.ball.vx>0:m.ball.vx<0);
    const cooldown=actor.cooldown;m.update(16,input);assert.ok(actor.cooldown<cooldown);
  }
});

test('both teams score only through valid mouths and kickoff resets players without resetting the script',()=>{
  const m=new FootballModel();m.start();m.movementMs=12000;
  for(const team of ['blue','orange']){
    m.ball.x=team==='blue'?1399:969;m.ball.y=288;m.ball.vx=team==='blue'?400:-400;m.ball.vy=0;
    m.update(16,{x:1100,y:180});assert.equal(m.score[team],1);
    const score={...m.score},serial=m.resetSerial;
    m.update(16,{x:1100,y:180});assert.deepEqual(m.score,score);
    while(m.resetDelay>0)m.update(50,{x:1100,y:180});
    assert.equal(m.resetSerial,serial+1);assert.equal(m.ball.x,config.ballStart.x);assert.equal(m.movementMs,12000);
    assert.equal(m.player.x,config.start.x);assert.equal(m.npcs[0].x,1104);
  }
  m.ball.x=1390;m.ball.y=180;m.ball.vx=800;m.ball.vy=0;m.update(16,{x:1100,y:380});
  assert.deepEqual(m.score,{blue:1,orange:1});assert.ok(m.ball.vx<0);
});

test('AI retains a single orange chaser, avoids crowding and remains bounded',()=>{
  const m=new FootballModel();m.start();
  for(let i=0;i<600;i++){
    m.update(16,{x:1032,y:288});
    if(m.resetDelay>0)continue;
    assert.ok(m.npcs.filter(n=>n.team==='orange'&&n.role==='chase').length<=1);
    for(const npc of m.npcs){assert.ok(npc.x>=config.bounds.x&&npc.x<=config.bounds.x+config.bounds.width);assert.ok(npc.y>=config.bounds.y&&npc.y<=config.bounds.y+config.bounds.height);}
  }
});

test('fictional status effects occur once, reduce football speed, stop at critical and offer adult support',()=>{
  const {activity,scene}=activityFixture();activity.start();
  scene.state.hydration=60;activity.checkHydration();assert.equal(activity.thought.text,copy.thirsty);
  activity.thoughtMs=0;activity.checkHydration();assert.equal(activity.thoughtMs,0);
  scene.state.hydration=30;activity.checkHydration();assert.equal(activity.thought.text,copy.tired);assert.equal(activity.speed,127.5);
  scene.state.hydration=80;activity.checkHydration();assert.equal(activity.speed,150);
  scene.state.hydration=30;activity.thoughtMs=0;activity.checkHydration();assert.equal(activity.thoughtMs,0);
  scene.state.hydration=10;activity.checkHydration();assert.equal(activity.active,false);assert.ok(scene.menu.message.startsWith(copy.low));
  assert.ok(scene.menu.message.includes(copy.gameRule));
  scene.menu.options.find(action=>action.label===copy.tellAdult).run();assert.equal(scene.menu.message,copy.adultReply);
});

test('slower football still counts actual moving time for the independent scenario',()=>{
  const {activity,scene}=activityFixture();scene.state.hydration=20;activity.start();
  activity.recordMovement(35000*config.tiredSpeedMultiplier);
  assert.ok(Math.abs(activity.model.movementMs-35000)<.00001);assert.equal(activity.model.eventCount,1);
});

test('a stalled overlapping ball can be freed after cooldown without per-frame repeat kicks',()=>{
  const m=new FootballModel();m.start();m.ballLock=0;
  m.player.cooldown=0;m.player.touching=true;
  m.update(16,{x:m.ball.x,y:m.ball.y,vx:0,vy:0});
  assert.equal(m.lastKicker,'player');assert.ok(Math.abs(m.ball.vx)>0);
  const previous=m.player.cooldown;m.update(16,{x:m.ball.x,y:m.ball.y});assert.ok(m.player.cooldown<previous);
});

test('thoughts do not repeat after leaving and joining a new match in the same adventure',()=>{
  const {activity,scene}=activityFixture();activity.start();scene.state.hydration=60;activity.checkHydration();
  assert.equal(scene.state.footballThoughts.thirsty,true);activity.stop();scene.state.hydration=100;
  activity.start();scene.state.hydration=60;activity.checkHydration();assert.equal(activity.thoughtMs,0);
  activity.stop();scene.state.footballThoughts={thirsty:false,tired:false};activity.start();
  assert.equal(activity.thought.text,copy.thirsty);assert.equal(activity.thoughtMs,5000);
});
