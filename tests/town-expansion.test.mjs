import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD,obstacles,STREET_ENTRIES } from '../src/world.js';
import { townShops,school,schoolHouses,SCHOOL_ROAD } from '../src/neighbourhood/townLayout.js';
const clear=(x,y)=>!obstacles.some(r=>x-9<r.x+r.width&&x+9>r.x&&y+4<r.y+r.height&&y+16>r.y);
function walk(a,b){
  assert.ok(a.x===b.x||a.y===b.y);const length=Math.abs(b.x-a.x)+Math.abs(b.y-a.y);
  for(let d=0;d<=length;d++){
    const x=a.x+Math.sign(b.x-a.x)*d,y=a.y+Math.sign(b.y-a.y)*d;
    assert.ok(clear(x,y),`clear foot-body at ${x},${y}`);
    assert.ok(x-9>=WORLD.x&&x+9<=WORLD.x+WORLD.width&&y+4>=WORLD.y&&y+16<=WORLD.y+WORLD.height);
  }
}
test('home to high street, School Road, courtyard and school entrance is continuous and reversible',()=>{
  const route=[STREET_ENTRIES.home,{x:208,y:480},{x:2000,y:480},{x:2000,y:422},{x:3520,y:422},{x:3520,y:1744},school.entrance];
  route.slice(1).forEach((b,i)=>walk(route[i],b));route.reverse().slice(1).forEach((b,i)=>walk(route[i],b));
  assert.equal(SCHOOL_ROAD.y,608);assert.equal(WORLD.width,4352);assert.equal(WORLD.y+WORLD.height,2176);
});
test('both School Road pavements and gate gaps are walkable without hitting houses or furniture',()=>{
  for(const x of [3520,3728])walk({x,y:660},{x,y:1744});
  for(const h of schoolHouses){const y=h.y+158;walk({x:h.side==='west'?h.x+112:h.x+16,y},{x:h.side==='west'?3520:3744,y});}
});
test('four distinctive shop plots retain future door anchors with clear approaches',()=>{
  assert.deepEqual(townShops.map(s=>s.name),['POST OFFICE','FISH & CHIPS','SUPERMARKET','FRUIT & VEG']);
  assert.equal(new Set(townShops.map(s=>s.colour)).size,4);
  for(const s of townShops){assert.equal(s.futureScene,null);walk(s.entry,{x:s.entry.x,y:422});}
  assert.ok(clear(school.entrance.x,school.entrance.y));assert.equal(school.futureScene,'School');
});
test('existing home, park and pharmacy entries remain unchanged and outside all added solids',()=>{
  assert.deepEqual(STREET_ENTRIES.home,{x:208,y:368,facing:'down'});assert.deepEqual(STREET_ENTRIES.park,{x:1728,y:614,facing:'down'});assert.deepEqual(STREET_ENTRIES.pharmacy,{x:2272,y:-546,facing:'right'});
  for(const entry of Object.values(STREET_ENTRIES))assert.ok(clear(entry.x,entry.y));
});
