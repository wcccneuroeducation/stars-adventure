import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { PARK,parkObjects,parkSolids,nearbyParkObject } from '../src/park/layout.js';
import { parkText } from '../src/scenarios/parkText.js';
import { fountainActions } from '../src/park/interactions.js';
import { getSunnyDayState,collectItem } from '../src/scenarios/sunnyDayState.js';
import { hydrationSettings } from '../src/settings/hydration.js';
import { STREET_ENTRIES,obstacles } from '../src/world.js';

globalThis.Phaser={Scene:class{},Input:{Keyboard:{JustDown:()=>false}}};
const { ParkScene }=await import('../src/ParkScene.js');

function parkFixture(){
  globalThis.document={hidden:false,hasFocus:()=>true,addEventListener(){},removeEventListener(){},querySelector:()=>({textContent:''})};
  globalThis.window={addEventListener(){},removeEventListener(){}};
  const entries=new Map(),registry={has:key=>entries.has(key),get:key=>entries.get(key),set:(key,value)=>entries.set(key,value)};
  const scene=new ParkScene();scene.registry=registry;scene.state=getSunnyDayState(registry);scene.resting=false;
  scene.player={x:800,y:1392,body:{x:791,y:1396,enable:true,reset(x,y){scene.player.x=x;scene.player.y=y;this.x=x-9;this.y=y+4;}},setPosition(x,y){this.x=x;this.y=y;return this;},setVelocity(x,y=0){this.velocity={x,y};return this;},setTexture(){return this;},setFlipX(){return this;},setData(){return this;}};
  scene.controls={reset(){},keys:{C:{}},consumeInteraction:()=>false,direction:()=>({x:0,y:-1})};
  scene.menu={open:false,show(title,message,actions){Object.assign(this,{title,message,actions,open:true});scene.player.setVelocity(0);},close(){this.open=false;scene.finishRest();}};
  scene.dialog=scene.menu;scene.hydrationHud={render(){}};
  scene.events=new EventEmitter();scene.physics={world:Object.assign(new EventEmitter(),{isPaused:false})};scene.game={isPaused:false,hasFocus:false};scene.sys={isActive:()=>true};
  scene.shadow={setPosition(){}};scene.prompt={setVisible(){return this;},setText(){return this;},setPosition(){return this;}};scene.playerDebug={visible:false};
  scene.scene={start:(key,data)=>{scene.destination={key,data};}};
  return scene;
}

test('park spawn and all interactions are reachable with the unchanged foot collision body',()=>{
  assert.ok(PARK.width>960&&PARK.height>540);
  const canStand=(x,y)=>x-9>=0&&x+9<=PARK.width&&y-6>=0&&y+6<=PARK.height&&!parkSolids.some(r=>x+9>r.x&&x-9<r.x+r.width&&y+6>r.y&&y-6<r.y+r.height);
  const start=[PARK.spawn.x,PARK.spawn.y+10];assert.ok(canStand(...start));
  const queue=[start],visited=new Set([start.join(',')]),found=new Set();
  for(let head=0;head<queue.length;head++){
    const [x,y]=queue[head],object=nearbyParkObject(x,y);if(object)found.add(object.id);
    for(const [dx,dy] of [[16,0],[-16,0],[0,16],[0,-16]]){
      const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
      if(!visited.has(key)&&canStand(nx,ny)){visited.add(key);queue.push([nx,ny]);}
    }
  }
  assert.deepEqual([...found].sort(),parkObjects.map(object=>object.id).sort());
  const back=STREET_ENTRIES.park;
  assert.ok(!obstacles.some(r=>back.x-9<r.x+r.width&&back.x+9>r.x&&back.y+4<r.y+r.height&&back.y+16>r.y));
});

test('park reuses outdoor movement depletion and pauses it for menus, standing and rest',()=>{
  const scene=parkFixture();scene.startHydrationTracking();scene.physics.world.emit('worldstep',1/60);
  for(let i=0;i<60;i++){scene.player.body.y-=2.5;scene.physics.world.emit('worldstep',1/60);}
  assert.ok(Math.abs(scene.state.hydration-(100-hydrationSettings.pointsPerSecond))<0.000001);
  const saved=scene.state.hydration;
  for(let i=0;i<60;i++)scene.physics.world.emit('worldstep',1/60);assert.equal(scene.state.hydration,saved);
  scene.interact('bench');scene.menu.actions[0].run();assert.equal(scene.resting,true);
  assert.equal(scene.player.body.enable,false);assert.equal(scene.player.x,656);
  for(let i=0;i<60;i++){scene.player.body.y-=2.5;scene.physics.world.emit('worldstep',1/60);}
  assert.equal(scene.state.hydration,saved);
  scene.menu.actions[0].run();assert.equal(scene.resting,false);
  assert.equal(scene.player.body.enable,true);assert.equal(scene.player.x,800);assert.equal(scene.player.y,1392);
  for(let i=0;i<60;i++){scene.player.body.y-=2.5;scene.physics.world.emit('worldstep',1/60);}
  assert.ok(scene.state.hydration<saved);scene.events.emit('shutdown');assert.equal(scene.physics.world.listenerCount('worldstep'),0);
});

test('bench and fountain can be declined without changing state',()=>{
  const scene=parkFixture();scene.state.hydration=48;
  for(const id of ['bench','fountain']){
    const saved=JSON.stringify(scene.state);scene.interact(id);scene.menu.actions[1].run();
    assert.equal(JSON.stringify(scene.state),saved);assert.equal(scene.resting,false);
  }
});

test('fountain refills carried bottles without restoring hydration or consuming inventory',()=>{
  const scene=parkFixture();collectItem(scene.state,'water');scene.state.waterSips=0;scene.state.hydration=40;
  scene.interact('fountain');assert.equal(scene.menu.actions[0].label,parkText.refill);scene.menu.actions[0].run();
  assert.equal(scene.state.waterSips,4);assert.equal(scene.state.hydration,40);assert.deepEqual(scene.state.inventory,['water']);
  scene.interact('fountain');scene.menu.actions[0].run();assert.equal(scene.state.waterSips,4);
});

test('direct fountain drinking restores 25 capped at 100 without adding a bottle',()=>{
  for(const hydration of [0,50,90,100]){
    const scene=parkFixture();scene.state.hydration=hydration;
    scene.interact('fountain');assert.equal(scene.menu.actions[0].label,parkText.directDrink);scene.menu.actions[0].run();
    assert.equal(scene.state.hydration,Math.min(100,hydration+25));assert.deepEqual(scene.state.inventory,[]);assert.equal(scene.state.waterSips,0);
  }
});

test('Jay delivers the exact line without starting football; gate preserves shared state',()=>{
  const scene=parkFixture();collectItem(scene.state,'water');scene.state.waterSips=2;scene.state.hydration=57;
  scene.interact('jay');assert.equal(scene.menu.message,"Hey! You made it! Fancy a game of football?");
  scene.menu.actions[0].run();assert.equal(scene.destination,undefined);
  scene.interact('gate');scene.menu.actions[1].run();assert.equal(scene.destination,undefined);
  scene.interact('gate');scene.menu.actions[0].run();assert.deepEqual(scene.destination,{key:'BirminghamStreet',data:{entry:'park'}});
  const state=getSunnyDayState(scene.registry);assert.equal(state,scene.state);assert.equal(state.hydration,57);assert.equal(state.waterSips,2);assert.deepEqual(state.inventory,['water']);
});

test('park uses the existing cardinal movement speed and stops when a menu opens',()=>{
  const scene=parkFixture();scene.update();assert.deepEqual(scene.player.velocity,{x:0,y:-150});
  scene.menu.open=true;scene.update();assert.deepEqual(scene.player.velocity,{x:0,y:0});
});
