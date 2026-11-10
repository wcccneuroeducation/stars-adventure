import test from 'node:test';
import assert from 'node:assert/strict';
import { SCHOOL,schoolRooms,schoolSolids,schoolFurniture,schoolPoints,schoolLocation } from '../src/school/layout.js';
import { STREET_ENTRIES,obstacles } from '../src/world.js';
import { drawSchool } from '../src/school/art.js';
globalThis.Phaser={Scene:class{}};
const { SchoolScene }=await import('../src/SchoolScene.js');
const clear=(x,y,solids=schoolSolids)=>!solids.some(r=>r.width>0&&r.height>0&&x-9<r.x+r.width&&x+9>r.x&&y+4<r.y+r.height&&y+16>r.y);
test('all eight school rooms, reception, courtyard and exit share a reachable floor plan',()=>{
  const step=8,cols=SCHOOL.width/step,rows=SCHOOL.height/step,seen=new Set(),queue=[SCHOOL.spawn];seen.add(SCHOOL.spawn.y/step*cols+SCHOOL.spawn.x/step);
  for(let head=0;head<queue.length;head++){
    const p=queue[head];for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){
      const x=p.x+dx,y=p.y+dy,key=y/step*cols+x/step;
      if(x<48||x>1552||y<48||y>2136||seen.has(key)||!clear(x,y))continue;
      seen.add(key);queue.push({x,y});
    }
  }
  for(const [id,point] of Object.entries(schoolPoints)){
    const target=id==='exit'?{x:800,y:2112}:point;
    assert.ok(clear(target.x,target.y),`${id} target clear`);assert.ok(seen.has(target.y/step*cols+target.x/step),`${id} reachable`);
  }
  for(const target of [{x:400,y:824},{x:1408,y:824},{x:400,y:1176},{x:1248,y:1176},{x:640,y:1536},{x:1216,y:1568},{x:416,y:1728},{x:416,y:1888}])assert.ok(seen.has(target.y/step*cols+target.x/step),`room interior ${JSON.stringify(target)} reachable`);
  assert.equal(schoolRooms.length,8);assert.ok(schoolRooms.find(r=>r.id==='sports').height>schoolRooms.find(r=>r.id==='classroom-1').height);
});
test('furniture has collision rectangles and school entry/exit anchors are safe',()=>{
  assert.ok(schoolFurniture.length>60);for(const f of schoolFurniture)assert.equal(clear(f.x+f.width/2,f.y+f.height/2),false,f.id);
  assert.ok(clear(SCHOOL.spawn.x,SCHOOL.spawn.y));assert.ok(SCHOOL.spawn.y+10<SCHOOL.exit.y);
  assert.deepEqual(STREET_ENTRIES.school,{x:4048,y:1824,facing:'down'});assert.ok(clear(4048,1824,obstacles));
  assert.equal(schoolLocation(800,352),'courtyard');assert.equal(schoolLocation(800,2048),'reception');assert.equal(schoolLocation(800,1000),'corridor');
  for(const room of schoolRooms){
    const y=room.entry.y;
    for(let x=Math.min(800,room.entry.x);x<=Math.max(800,room.entry.x);x++)assert.ok(clear(x,y),`${room.id} doorway approach clear at ${x},${y}`);
  }
});
test('school exit starts street once and does not modify adventure state',()=>{
  const s=new SchoolScene();s.state={objective:'headHome',hydration:43,inventory:['water'],waterSips:2};const saved=JSON.stringify(s.state);
  s.menu={open:false};s.controls={reset(){}};s.player={setVelocity(){}};const calls=[];s.scene={start:(...args)=>calls.push(args)};
  s.leave();s.leave();assert.deepEqual(calls,[['BirminghamStreet',{entry:'school'}]]);assert.equal(JSON.stringify(s.state),saved);
});
test('repeated school visits reuse modest cached textures and bounded art generation',()=>{
  let paints=0;const context=()=>({fillRect(){paints++;},drawImage(){paints++;},fillText(){paints++;},translate(){},beginPath(){},arc(){},stroke(){}});
  globalThis.document={createElement:()=>({getContext:context})};const textures=new Map(),created=[];
  const scene={add:{image(){return {setOrigin(){}};}},textures:{exists:k=>textures.has(k),createCanvas(key,width,height){created.push({key,width,height});const c=context(),t={getContext:()=>c,refresh(){}};textures.set(key,t);return t;}}};
  drawSchool(scene);const first=paints;for(let i=0;i<20;i++)drawSchool(scene);assert.equal(paints,first);assert.equal(created.length,3);assert.ok(created.every(t=>t.width<=1600&&t.height<=832));
});
