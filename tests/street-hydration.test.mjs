import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { HydrationMovement } from '../src/mechanics/hydration.js';
import { hydrationSettings } from '../src/settings/hydration.js';
import { getSunnyDayState } from '../src/scenarios/sunnyDayState.js';
import { parkZone, shopZone, obstacles, STREET_ENTRIES, WORLD } from '../src/world.js';
import { streetText } from '../src/scenarios/streetText.js';
import { backpackActions } from '../src/ui/backpack.js';
import { HydrationHud } from '../src/ui/HydrationHud.js';

globalThis.Phaser={Scene:class{},Input:{Keyboard:{JustDown:()=>false}},Geom:{Rectangle:{Contains:(r,x,y)=>x>=r.x&&x<r.x+r.width&&y>=r.y&&y<r.y+r.height}}};
const { StreetScene }=await import('../src/StreetScene.js');
const { BedroomScene }=await import('../src/BedroomScene.js');

function streetFixture() {
  const hint={textContent:''};globalThis.document={hidden:false,hasFocus:()=>true,querySelector:()=>hint,addEventListener(){},removeEventListener(){}};
  globalThis.window={addEventListener(){},removeEventListener(){}};
  const scene=new StreetScene();
  scene.state={hydration:100,inventory:[]};scene.hydrationMovement=new HydrationMovement(scene.state);
  // Exercise the real HUD render function, rather than replacing it with a no-op.
  scene.hydrationHud=Object.assign(Object.create(HydrationHud.prototype),{
    state:scene.state,fill:{style:{},dataset:{}},percentage:{},meter:{setAttribute(key,value){this[key]=value;}}
  });scene.outdoorMovementRequested=true;
  scene.player={x:960,y:480,body:{x:951,y:484},setVelocity(x,y=0){this.velocity={x,y};return this;},setFlipX(){}};
  scene.shadow={setPosition(){}};
  scene.dialog={open:false,showModal(){this.open=true;}};
  scene.menu={open:false,show(title,message,actions){Object.assign(this,{open:true,title,message,actions});},close(){this.open=false;}};
  // Phaser 3.90 starts hasFocus=false, even on an already-focused document.
  scene.physics={world:Object.assign(new EventEmitter(),{isPaused:false})};scene.events=new EventEmitter();scene.sys={isActive:()=>true};scene.game={hasFocus:false,isPaused:false};
  scene.controls={keys:{C:{}},direction:()=>({x:1,y:0}),consumeInteraction:()=>false,reset(){}};
  scene.zone=shopZone;scene.parkZone=parkZone;scene.prompt={setVisible(){}};scene.parkPrompt={setVisible(){}};scene.playerDebug={visible:false};
  scene.scene={start:(key,data)=>{scene.destination={key,data};}};
  return scene;
}

test('street uses resolved body displacement and freezes for each actual UI/pause condition',()=>{
  for(const block of [scene=>scene.dialog.open=true,scene=>scene.menu.open=true,scene=>scene.physics.world.isPaused=true,scene=>scene.sys.isActive=()=>false,()=>document.hidden=true,()=>document.hasFocus=()=>false,scene=>scene.game.isPaused=true]) {
    const scene=streetFixture();scene.updateHydration(1000);block(scene);
    scene.player.body.x+=150;scene.updateHydration(1000);assert.equal(scene.state.hydration,100);
  }
  const scene=streetFixture();scene.updateHydration(1000);scene.player.body.x+=150;scene.updateHydration(1000);
  assert.ok(Math.abs(scene.state.hydration-(100-hydrationSettings.pointsPerSecond))<0.000001);
  const value=scene.state.hydration;scene.updateHydration(1000);assert.equal(scene.state.hydration,value);
});

test('existing movement speed is retained; opening a menu stops movement',()=>{
  const scene=streetFixture();scene.update();assert.deepEqual(scene.player.velocity,{x:150,y:0});
  scene.menu.open=true;scene.update();assert.deepEqual(scene.player.velocity,{x:0,y:0});assert.equal(scene.outdoorMovementRequested,false);
  scene.menu.open=false;scene.controls.direction=()=>({x:0,y:-1});scene.update();assert.deepEqual(scene.player.velocity,{x:0,y:-150});
});

test('shop interaction still opens its existing dialog',()=>{
  const scene=streetFixture();scene.player.x=1504;scene.player.y=390;
  scene.controls.consumeInteraction=()=>true;scene.update();assert.equal(scene.dialog.open,true);
  assert.deepEqual(scene.player.velocity,{x:0,y:0});
});

test('park interaction enters the park without changing inventory or hydration',()=>{
  const scene=streetFixture();scene.player.x=1728;scene.player.y=630;scene.state.inventory=['water'];scene.state.hydration=42;
  scene.controls.consumeInteraction=()=>true;scene.update();
  assert.equal(scene.destination.key,'Park');assert.equal(scene.state.hydration,42);assert.deepEqual(scene.state.inventory,['water']);
});

test('home entry and park gate remain outside the existing collision rectangles',()=>{
  for(const point of [STREET_ENTRIES.home,{x:1728,y:630},{x:1728,y:680}]) {
    assert(!obstacles.some(r=>point.x-9<r.x+r.width&&point.x+9>r.x&&point.y+4<r.y+r.height&&point.y+16>r.y));
  }
  assert.deepEqual(WORLD.spawn,{x:960,y:480});
});

test('physics-step tracking works at 30/60/120/144Hz rendering with every inventory',()=>{
  const readings=[];
  for(const renderHz of [30,60,120,144])for(const inventory of [[],['water'],['hat'],['water','hat']]){
    const scene=streetFixture();scene.state.inventory=[...inventory];scene.startHydrationTracking();scene.update();
    scene.physics.world.emit('worldstep',1/60); // initial resolved position
    let steps=0;
    for(let frame=1;frame<=renderHz*3;frame++){
      const targetSteps=Math.floor(frame*60/renderHz);
      while(steps<targetSteps){scene.player.body.x+=2.5;scene.physics.world.emit('worldstep',1/60);steps++;}
      // Render events do not resample positions or compare against render deltas.
      scene.events.emit('postupdate',frame*1000/renderHz,1000/renderHz);
    }
    assert.ok(Math.abs(scene.state.hydration-(100-3*hydrationSettings.pointsPerSecond))<0.000001);
    readings.push(scene.state.hydration);
    scene.events.emit('shutdown');assert.equal(scene.physics.world.listenerCount('worldstep'),0);
  }
  assert.ok(readings.every(value=>Math.abs(value-readings[0])<0.000001));
});

test('actual bedroom pickup and exit preserve state, depletion, and post-drink movement',()=>{
  for(const takeWater of [false,true]){
    const entries=new Map(),registry={has:key=>entries.has(key),get:key=>entries.get(key),set:(key,value)=>entries.set(key,value)};
    const bedroom=new BedroomScene();bedroom.state=getSunnyDayState(registry);
    bedroom.dialog={show(_title,_message,actions){this.actions=actions;},close(){}};
    bedroom.items={water:{setVisible(){}}};let destination;
    bedroom.scene={start:(key,data)=>{destination={key,data};}};
    if(takeWater){bedroom.interact('water');bedroom.dialog.actions[0].run();}
    bedroom.interact('door');bedroom.dialog.actions[0].run();
    assert.equal(destination.key,'BirminghamStreet');assert.equal(destination.data.entry,'home');
    const street=streetFixture();street.state=getSunnyDayState(registry);street.hydrationHud.state=street.state;assert.equal(street.state,bedroom.state);
    street.startHydrationTracking();street.update();street.physics.world.emit('worldstep',1/60);
    const walk=()=>{for(let step=0;step<600;step++){street.player.body.x+=2.5;street.physics.world.emit('worldstep',1/60);}};
    walk();assert.ok(Math.abs(street.state.hydration-(100-10*hydrationSettings.pointsPerSecond))<0.000001);
    street.menu.open=true;const stationary=street.state.hydration;
    for(let step=0;step<60;step++)street.physics.world.emit('worldstep',1/60);
    assert.equal(street.state.hydration,stationary);
    if(takeWater){
      const actions=backpackActions(street.state,()=>{},()=>{});actions.find(action=>action.label===streetText.drink).run();
      assert.equal(street.state.hydration,Math.min(100,stationary+25));
    }
    street.menu.open=false;street.update();const afterMenu=street.state.hydration;
    walk();assert.ok(Math.abs(street.state.hydration-(afterMenu-10*hydrationSettings.pointsPerSecond))<0.000001);
    street.events.emit('shutdown');
  }
});

test('a direct collision-free home-to-park walk finishes at approximately 80 percent',()=>{
  const scene=streetFixture();scene.state.inventory=['water'];scene.startHydrationTracking();
  let {x,y}=STREET_ENTRIES.home;
  scene.player.body.x=x-9;scene.player.body.y=y+4;scene.physics.world.emit('worldstep',1/60);
  for(const target of [{x,y:480},{x:1728,y:480},{x:1728,y:630}]){
    while(Math.abs(x-target.x)+Math.abs(y-target.y)>0.001){
      const dx=Math.sign(target.x-x)*Math.min(2.5,Math.abs(target.x-x));
      const dy=dx?0:Math.sign(target.y-y)*Math.min(2.5,Math.abs(target.y-y));
      x+=dx;y+=dy;
      assert(!obstacles.some(r=>x-9<r.x+r.width&&x+9>r.x&&y+4<r.y+r.height&&y+16>r.y));
      scene.player.body.x=x-9;scene.player.body.y=y+4;scene.physics.world.emit('worldstep',1/60);
    }
  }
  assert.ok(scene.state.hydration>79&&scene.state.hydration<81,`Arrival hydration: ${scene.state.hydration}`);
  assert.equal(scene.hydrationHud.percentage.textContent,'80%');
  scene.events.emit('shutdown');
});

test('focused page drains and refreshes the real HUD even when Phaser hasFocus remains false',()=>{
  for(const inventory of [[],['water'],['hat'],['water','hat']]){
    const scene=streetFixture();scene.state.inventory=[...inventory];scene.startHydrationTracking();
    scene.physics.world.emit('worldstep',1/60);
    // Actual physics-body displacement is the source of truth, with no keyboard
    // request flag required. This also covers movement from touch controls.
    for(let step=0;step<600;step++){
      scene.player.body.x+=2.5;scene.physics.world.emit('worldstep',1/60);
    }
    assert.equal(scene.game.hasFocus,false);assert.equal(document.hasFocus(),true);
    assert.ok(Math.abs(scene.state.hydration-83)<0.000001);
    assert.equal(scene.hydrationHud.percentage.textContent,'83%');
    assert.ok(Math.abs(parseFloat(scene.hydrationHud.fill.style.width)-83)<0.000001);
    assert.equal(scene.hydrationHud.meter['aria-valuenow'],'83');
    assert.equal(scene.hydrationHud.state,scene.state);assert.equal(scene.hydrationMovement.state,scene.state);
    scene.events.emit('shutdown');
  }
});

test('shutdown tolerates Phaser clearing plugin.world before hydration cleanup',()=>{
  const scene=streetFixture(),world=scene.physics.world;
  // Real ArcadePhysics registers its shutdown listener before scene create().
  scene.events.once('shutdown',()=>{
    world.removeAllListeners();scene.physics.world=null;scene.player.body=undefined;
    scene.player.setVelocity=function(){if(!this.body)throw new Error('Destroyed physics body');};
    assert.doesNotThrow(()=>scene.events.emit('pause'));
  });
  scene.startHydrationTracking();assert.equal(world.listenerCount('worldstep'),1);
  assert.doesNotThrow(()=>scene.events.emit('shutdown'));
  assert.equal(world.listenerCount('worldstep'),0);
  assert.equal(scene.events.listenerCount('pause'),0);
  assert.equal(scene.events.listenerCount('resume'),0);
});
