import test from 'node:test';
import assert from 'node:assert/strict';
import { drawPark } from '../src/park/art.js';
import { drawPixelEnvironment } from '../src/pixel/environment.js';

test('repeated map visits reuse baked textures instead of painting or allocating again',()=>{
  let operations=0,images=0;
  const makeContext=()=>({translate(){},fillRect(){operations++;},drawImage(){operations++;},fillText(){operations++;}});
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>makeContext()})};
  const textures=new Map([['player',{getSourceImage:()=>({})}]]),created=[];
  const scene={textures:{
    exists:key=>textures.has(key),get:key=>textures.get(key),
    createCanvas(key,width,height){
      assert.ok(!textures.has(key));created.push({key,width,height});
      const ctx=makeContext(),texture={getContext:()=>ctx,refresh(){}};textures.set(key,texture);return texture;
    },
    remove(){assert.fail('A cached map should not be removed on scene entry');}
  },add:{rectangle(){return {setDepth(){return this;}};},image(){images++;return {setOrigin(){return this;}};}}};
  drawPixelEnvironment(scene);drawPark(scene);
  const firstPaint=operations;
  assert.ok(firstPaint>0&&firstPaint<60000,`Terrain painting should remain bounded: ${firstPaint}`);
  for(let visit=0;visit<20;visit++){drawPixelEnvironment(scene);drawPark(scene);}
  assert.equal(operations,firstPaint);assert.equal(images,126);
  assert.deepEqual(created.map(texture=>texture.key),['birmingham-environment','willow-lane-environment','town-expansion-0','town-expansion-1','town-expansion-2','small-heath-park','player-back']);
  assert.ok(created.every(t=>t.width<=2048&&t.height<=2176),'Map sections stay within modest texture sizes');
  assert.equal(textures.size,8);
});
