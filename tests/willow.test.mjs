import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD,obstacles,STREET_ENTRIES,parkZone,homeZone } from '../src/world.js';
import { WILLOW,willowHouses,futureShopPlot } from '../src/neighbourhood/willowLayout.js';

const clear=(x,y)=>!obstacles.some(r=>x-9<r.x+r.width&&x+9>r.x&&y+4<r.y+r.height&&y+16>r.y);
function walk(a,b){
  assert.ok(a.x===b.x||a.y===b.y,'four-direction route');
  const length=Math.abs(b.x-a.x)+Math.abs(b.y-a.y);
  for(let d=0;d<=length;d++){
    const x=a.x+Math.sign(b.x-a.x)*d,y=a.y+Math.sign(b.y-a.y)*d;
    assert.ok(clear(x,y),`walkable foot body at ${x},${y}`);
    assert.ok(x-9>=WORLD.x&&x+9<=WORLD.x+WORLD.width&&y+4>=WORLD.y&&y+16<=WORLD.y+WORLD.height);
  }
}
test('original home and park stay fixed; continuous pavement reaches both Willow sides and returns',()=>{
  assert.deepEqual(STREET_ENTRIES.home,{x:208,y:368,facing:'down'});
  assert.deepEqual(STREET_ENTRIES.park,{x:1728,y:614,facing:'down'});
  assert.equal(homeZone.x,184);assert.equal(parkZone.x,1696);
  const route=[{x:208,y:368},{x:208,y:480},{x:2000,y:480},{x:2000,y:422},{x:2272,y:422},{x:2272,y:-1064},{x:2496,y:-1064},{x:2496,y:422},{x:2000,y:422},{x:2000,y:480},{x:208,y:480},{x:208,y:368}];
  route.slice(1).forEach((b,i)=>walk(route[i],b));
});
test('every upright house porch connects through an open garden gate to the pavement',()=>{
  for(const h of willowHouses){
    const y=h.y+158,x=h.side==='west'?h.x+112:h.x+16;
    walk({x,y},{x:h.side==='west'?2272:2496,y});
    assert.equal(h.width,128);assert.equal(h.height,160);
  }
  assert.equal(futureShopPlot.side,'west');assert.ok(futureShopPlot.y<0);
  assert.equal(WILLOW.x,2048);
});
