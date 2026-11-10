import test from 'node:test';
import assert from 'node:assert/strict';
import { getSunnyDayState, collectItem, chooseOutfit } from '../src/scenarios/sunnyDayState.js';
import { sunnyDayText as text } from '../src/scenarios/sunnyDayText.js';
import { bedroomObjects, bedroomSolids, roomBounds, ROOM, nearbyObject } from '../src/bedroom/layout.js';

// Exercise scene actions without WebGL or external dependencies.
globalThis.Phaser = { Scene: class {} };
const { BedroomScene } = await import('../src/BedroomScene.js');

class Element {
  constructor(tag) { this.tagName=tag;this.children=[];this.value=''; }
  append(...children) { this.children.push(...children); }
}

function registry() {
  const entries=new Map();
  return { has:key=>entries.has(key),get:key=>entries.get(key),set:(key,value)=>entries.set(key,value) };
}
function fixture() {
  const scene=new BedroomScene();
  scene.registry=registry();scene.state=getSunnyDayState(scene.registry);
  scene.dialog={
    open:false,
    show(title,message,actions,options={}) { Object.assign(this,{title,message,actions,options,open:true}); },
    close() { this.open=false; }
  };
  scene.items=Object.fromEntries(['water','hat'].map(id=>[id,{visible:true,setVisible(value){this.visible=value;}}]));
  scene.scene={start:(key,data)=>{scene.destination=key;scene.entryData=data;}};
  return scene;
}
const click=(scene,label)=>{
  const action=scene.dialog.actions.find(action=>action.label===label);
  assert.ok(action,`Action exists: ${label}`);action.run();
};

test('call shows both exact lines and completes only after the second Continue',()=>{
  const scene=fixture();
  const label={setOrigin(){return this;},setDepth(){return this;},setVisible(){return this;}};
  scene.add={text:()=>label};scene.tweens={add:()=>({stop(){}})};
  scene.ring={start(){},stop(){}};
  scene.startCall();
  assert.equal(scene.dialog.title,'Incoming call – Jay');
  assert.equal(scene.dialog.message,"Hey! We're meeting at the park. It's really sunny today. Are you coming?");
  assert.equal(scene.dialog.options.required,true);
  assert.equal(scene.state.callComplete,false);
  click(scene,text.continue);
  assert.equal(scene.dialog.message,'Great! See you there!');
  assert.equal(scene.state.callComplete,false);
  click(scene,text.continue);
  assert.equal(scene.state.callComplete,true);assert.equal(scene.dialog.open,false);
});

test('window describes the conditions without changing inventory or clothes',()=>{
  const scene=fixture(),before=JSON.stringify(scene.state);
  scene.interact('window');assert.equal(scene.dialog.message,text.window);
  click(scene,text.close);assert.equal(JSON.stringify(scene.state),before);
});

test('each pickup is optional, disappears when collected, and cannot duplicate',()=>{
  for(const id of ['water','hat']) {
    const scene=fixture();scene.interact(id);click(scene,text.leaveItem);
    assert.deepEqual(scene.state.inventory,[]);assert.equal(scene.items[id].visible,true);
    scene.interact(id);click(scene,text.take);
    assert.deepEqual(scene.state.inventory,[id]);assert.equal(scene.items[id].visible,false);
    assert.equal(collectItem(scene.state,id),false);assert.equal(scene.state.inventory.length,1);
  }
  assert.equal(collectItem(fixture().state,'unknown'),false);
});

test('wardrobe selection persists and closing without applying preserves the outfit',()=>{
  globalThis.document={createElement:tag=>new Element(tag)};
  const scene=fixture();scene.interact('wardrobe');
  let select=scene.dialog.options.content.children[0].children[0];
  select.value='shorts';click(scene,text.close);assert.equal(scene.state.outfit,'everyday');
  scene.interact('wardrobe');select=scene.dialog.options.content.children[0].children[0];
  select.value='shorts';click(scene,text.wear);assert.equal(scene.state.outfit,'shorts');
  scene.interact('wardrobe');select=scene.dialog.options.content.children[0].children[0];
  assert.equal(select.value,'shorts');
  assert.equal(chooseOutfit(scene.state,'invalid',text.outfits),false);
});

test('backpack lists only collected items and handles an empty inventory',()=>{
  globalThis.document={createElement:tag=>new Element(tag)};
  const scene=fixture();scene.interact('backpack');assert.equal(scene.dialog.message,text.emptyBackpack);
  collectItem(scene.state,'hat');collectItem(scene.state,'water');scene.interact('backpack');
  assert.deepEqual(scene.dialog.options.content.children.map(row=>row.textContent),[text.objects.hat,'Water Bottle — 4/4 sips']);
});

test('door permits leaving with any inventory and never requires clothing changes',()=>{
  for(const inventory of [[],['hat'],['water'],['water','hat']]){
    const scene=fixture();scene.state.inventory=[...inventory];scene.interact('door');
    click(scene,text.stay);assert.equal(scene.destination,undefined);
    scene.interact('door');click(scene,text.leaveRoom);
    assert.equal(scene.destination,'BirminghamStreet');assert.deepEqual(scene.state.inventory,inventory);
    assert.equal(scene.entryData.entry,'home');
    assert.equal(getSunnyDayState(scene.registry),scene.state);assert.equal(scene.state.outfit,'everyday');
  }
});

test('all six interaction areas are reachable with the original-sized foot body',()=>{
  // Sample actual foot-body centres. The visual sprite centre is 10px above it.
  const b=roomBounds,step=4;
  const canStand=(x,y)=>x-9>=b.x&&x+9<=b.x+b.width&&y-6>=b.y&&y+6<=b.y+b.height&&!bedroomSolids.some(r=>x+9>r.x&&x-9<r.x+r.width&&y+6>r.y&&y-6<r.y+r.height);
  const start=[ROOM.spawn.x,ROOM.spawn.y+10],queue=[start],visited=new Set([start.join(',')]),found=new Set();
  for(let head=0;head<queue.length;head++){
    const [x,y]=queue[head];const object=nearbyObject(bedroomObjects,x,y,[]);if(object)found.add(object.id);
    for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){
      const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
      if(!visited.has(key)&&canStand(nx,ny)){visited.add(key);queue.push([nx,ny]);}
    }
  }
  assert.deepEqual([...found].sort(),bedroomObjects.map(object=>object.id).sort());
  const z=bedroomObjects.find(object=>object.id==='water').zone;
  assert.equal(nearbyObject(bedroomObjects,z.x+10,z.y+10,['water']),undefined);
});
