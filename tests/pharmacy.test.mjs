import test from 'node:test';
import assert from 'node:assert/strict';
import { pharmacyEntry,pharmacyZone,pharmacySolids,nearbyPharmacyObject,PHARMACY } from '../src/pharmacy/layout.js';
import { obstacles,STREET_ENTRIES } from '../src/world.js';
import { getSunnyDayState } from '../src/scenarios/sunnyDayState.js';
import { pharmacyText as text } from '../src/scenarios/pharmacyText.js';
globalThis.Phaser={Scene:class{}};
const {PharmacyScene}=await import('../src/PharmacyScene.js');
const overlaps=(x,y,r)=>x-9<r.x+r.width&&x+9>r.x&&y+4<r.y+r.height&&y+16>r.y;
test('pharmacy return is on the western pavement with a clear approach to the door',()=>{
  assert.equal(STREET_ENTRIES.pharmacy,pharmacyEntry);assert.equal(pharmacyEntry.facing,'right');
  assert.ok(pharmacyEntry.x>=2240&&pharmacyEntry.x<2304);
  for(let x=2192;x<=pharmacyEntry.x;x++)assert.ok(!obstacles.some(r=>overlaps(x,pharmacyEntry.y,r)));
  assert.ok(pharmacyEntry.x>=pharmacyZone.x&&pharmacyEntry.y+10>=pharmacyZone.y&&pharmacyEntry.y+10<pharmacyZone.y+pharmacyZone.height);
});
test('public interior routes reach the counter and exit without crossing furniture',()=>{
  const route=[PHARMACY.spawn,{x:480,y:336},{x:352,y:336},{x:480,y:336},{x:480,y:704}];
  for(let i=1;i<route.length;i++){
    const a=route[i-1],b=route[i],length=Math.abs(b.x-a.x)+Math.abs(b.y-a.y);
    for(let d=0;d<=length;d++)assert.ok(!pharmacySolids.some(r=>overlaps(a.x+Math.sign(b.x-a.x)*d,a.y+Math.sign(b.y-a.y)*d,r)));
  }
  assert.equal(nearbyPharmacyObject(352,346).id,'pharmacist');assert.equal(nearbyPharmacyObject(480,714).id,'exit');
  assert.equal(nearbyPharmacyObject(480,682),undefined,'spawn does not activate exit');
  assert.ok(pharmacySolids.some(r=>overlaps(352,270,r)),'counter blocks public access to dispensing');
  assert.ok(pharmacySolids.some(r=>overlaps(128,400,r)),'shelves are solid');
});
test('pharmacist pages preserve shared scenario state; exit transitions once',()=>{
  const entries=new Map(),registry={has:k=>entries.has(k),get:k=>entries.get(k),set:(k,v)=>entries.set(k,v)};
  const s=new PharmacyScene();s.state=getSunnyDayState(registry);
  Object.assign(s.state,{hydration:42,waterSips:2,inventory:['water'],objective:'headHome',hasVisitedPark:true,lowestHydration:25});
  const saved=JSON.stringify(s.state);s.controls={reset(){}};s.player={setVelocity(){}};
  s.menu={open:false,show(title,message,actions){Object.assign(this,{title,message,actions,open:true});},close(){this.open=false;}};
  const destinations=[];s.scene={start:(...args)=>destinations.push(args)};
  s.interact('pharmacist');for(const message of text.greeting){assert.equal(s.menu.message,message);s.menu.actions[0].run();}
  assert.equal(s.menu.open,false);assert.equal(JSON.stringify(s.state),saved);assert.equal(getSunnyDayState(registry),s.state);
  s.interact('exit');s.interact('exit');assert.deepEqual(destinations,[['BirminghamStreet',{entry:'pharmacy'}]]);assert.equal(JSON.stringify(s.state),saved);
});
