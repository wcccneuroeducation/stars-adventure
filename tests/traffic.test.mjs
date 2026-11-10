import test from 'node:test';
import assert from 'node:assert/strict';
import { TrafficModel,vehicleBounds,playerBounds,overlaps,crossingInUse,playerStepBlocked } from '../src/traffic/model.js';
import { trafficRoutes,busStop,junctions } from '../src/traffic/routes.js';
import { vehicleTypes } from '../src/traffic/vehicles.js';
const away={x:100,y:300,vx:0,vy:0};
function single(id='blue',x=650){const m=new TrafficModel();m.vehicles.forEach(v=>{v.active=false;v.delay=99999;});const v=m.vehicles.find(v=>v.id===id);v.active=true;v.d=x+160;v.position=v.route.point(v.d);v.speed=88;return {m,v};}
function run(m,seconds,p=away,hz=60){for(let i=0;i<seconds*hz;i++)m.update(1000/hz,p);}
test('routes stay on the inspected asphalt, including curved UK-left turns and terminal turnarounds',()=>{
  const road=(x,y)=>(x>=0&&x<=4352&&y>=448&&y<=608)||(x>=2304&&x<=2464&&y>=-1056&&y<=448)||(x>=3552&&x<=3712&&y>=608&&y<=1408);
  for(const [name,route] of Object.entries(trafficRoutes))for(let d=0;d<=route.length;d+=4){
    const spec=vehicleTypes[{east:'blue',west:'red',willow:'grey',school:'van',bus:'bus'}[name]];
    const p=route.point(d),{length,width}=spec,c=Math.cos(p.angle),s=Math.sin(p.angle);
    for(const a of [-1,1])for(const b of [-1,1]){
      const x=p.x+c*a*length/2-s*b*width/2,y=p.y+s*a*length/2+c*b*width/2;
      if(x<0||x>4352)continue;assert.ok(road(x,y),`${name} footprint leaves asphalt at ${x},${y}`);
    }
  }
  assert.equal(trafficRoutes.east.point(400).y,488);assert.equal(trafficRoutes.west.point(400).y,568);
});
test('a vehicle brakes before a stationary player, waits, then resumes after the road clears',()=>{
  const {m,v}=single(),p={x:850,y:488,vx:0,vy:0};
  for(let i=0;i<600;i++){m.update(1000/60,p);assert.equal(overlaps(vehicleBounds(v),playerBounds(p)),false);}
  assert.ok(v.position.x<815);assert.equal(v.speed,0);assert.equal(v.braking,true);const stopped=v.d;run(m,3,p);assert.equal(v.d,stopped);
  run(m,4);assert.ok(v.position.x>850);
});
test('crossing approach distinguishes perpendicular crossing intent from pavement walking',()=>{
  assert.equal(crossingInUse({x:3520,y:426,vx:150,vy:0}),false);
  assert.equal(crossingInUse({x:3520,y:426,vx:0,vy:150}),true);
  assert.equal(crossingInUse({x:3520,y:528,vx:0,vy:0}),true);
  const {m,v}=single('blue',3200);run(m,8,{x:3520,y:426,vx:0,vy:150});assert.ok(vehicleBounds(v).x+vehicleBounds(v).width<3496);assert.equal(v.speed,0);
  const stopped=v.d;run(m,2,{x:3520,y:426,vx:0,vy:0});assert.equal(v.d,stopped,'wait for a pedestrian who approached and then paused');
  run(m,8,{x:3520,y:384,vx:0,vy:0});assert.ok(v.position.x>3550);
});
test('waiting at either zebra kerb stops approaching traffic, including the bus',()=>{
  for(const [id,x,p] of [
    ['blue',3200,{x:3520,y:422,vx:0,vy:0}],
    ['red',3900,{x:3520,y:634,vx:0,vy:0}],
    ['bus',3100,{x:3520,y:422,vx:0,vy:0}]
  ]){
    const {m,v}=single(id);v.d=id==='red'?4512-x:x+160;v.position=v.route.point(v.d);if(id==='bus')v.served=true;
    run(m,12,p);assert.equal(v.speed,0);assert.equal(v.braking,true);
    const b=vehicleBounds(v);assert.ok(id==='red'?b.x>3544:b.x+b.width<3496,`${id} waits before stripes`);
    const saved=v.d;run(m,3,p);assert.equal(v.d,saved);
    run(m,8,{x:3400,y:422,vx:0,vy:0});assert.ok(v.d>saved+50);
  }
});
test('cars clear an occupied crossing before yielding, and do not re-request after the player finishes crossing',()=>{
  const {m,v}=single('blue',3520);run(m,3,{x:3520,y:422,vx:0,vy:0});assert.ok(v.position.x>3580);
  const other=single('blue',3200);other.m.update(1000/60,{x:3520,y:528,vx:0,vy:150});
  other.m.update(1000/60,{x:3520,y:634,vx:0,vy:0});assert.equal(other.m.crossingRequested,false);
  run(other.m,10,{x:3520,y:634,vx:0,vy:0});assert.ok(other.v.position.x>3550);assert.equal(other.m.crossingRequested,false);
  const walking=single('blue',3200);
  for(let y=422;y<=647;y+=2.5)walking.m.update(1000/60,{x:3520,y,vx:0,vy:150});
  run(walking.m,10,{x:3520,y:647,vx:0,vy:0});assert.equal(walking.m.crossingRequested,false);assert.ok(walking.v.position.x>3550);
});
test('vehicles queue without overlapping and resume together when the player clears',()=>{
  const {m,v}=single('blue',650),front=m.vehicles.find(v=>v.id==='grey');front.route=trafficRoutes.east;front.d=980;front.position=front.route.point(front.d);front.active=true;front.speed=88;
  const p={x:1100,y:488,vx:0,vy:0};
  for(let i=0;i<1200;i++){m.update(1000/60,p);assert.equal(overlaps(vehicleBounds(v),vehicleBounds(front)),false);}
  assert.equal(v.speed,0);assert.equal(front.speed,0);run(m,8);assert.ok(v.position.x>1100);assert.ok(front.position.x>v.position.x);
});
test('one bus serves the original shelter, opens/closes doors, departs and enters its interval',()=>{
  const {m,v}=single('bus',1600);v.served=false;let opened=false,stoppedX;
  for(let i=0;i<1200;i++){m.update(1000/60,away);if(v.dwell>0)stoppedX=v.position.x;if(v.doorsOpen)opened=true;}
  assert.ok(Math.abs(stoppedX-busStop.position.x)<5);assert.equal(opened,true);assert.equal(v.doorsOpen,false);assert.ok(v.position.x>1900);
  run(m,40);assert.equal(m.vehicles.filter(v=>v.type==='bus').length,1);assert.equal(v.active,false);assert.ok(v.delay>0);
});
test('fixed-step progression agrees across frame rates; pauses do not accumulate service time',()=>{
  const results=[];for(const hz of [30,60,120,144]){const {m,v}=single();run(m,4,away,hz);results.push(v.d);const saved=v.d;m.update(10000,away,true);assert.equal(v.d,saved);}
  assert.ok(Math.max(...results)-Math.min(...results)<2);
});
test('abrupt player direction changes and walking into a stopped car are guarded without displacement or damage',()=>{
  const {m,v}=single('blue',650),p={x:850,y:488,vx:0,vy:0};run(m,5,p);
  for(let i=0;i<240;i++){
    p.vx=-150;p.vy=0;m.update(1000/60,p);
    if(!playerStepBlocked(m.vehicles,p))p.x+=p.vx/60;
    assert.equal(overlaps(vehicleBounds(v),playerBounds(p)),false);assert.notEqual(v.yielding,true);
  }
  const before=p.x;p.vx=0;p.vy=-150;
  for(let i=0;i<100;i++){m.update(1000/60,p);if(!playerStepBlocked(m.vehicles,p))p.y+=p.vy/60;}
  assert.equal(p.x,before);run(m,4,away);assert.ok(v.speed>0);
});
test('the bus stop footpath is clear of the relocated bin and original shelter',async()=>{
  const {obstacles}=await import('../src/world.js');
  for(let x=1664;x<=1904;x++)assert.ok(!obstacles.some(r=>x-9<r.x+r.width&&x+9>r.x&&428+4<r.y+r.height&&428+16>r.y),`pavement ${x}`);
});
test('the final walking guard remains safe at low and high render rates',()=>{
  for(const hz of [10,15,30,60,144]){
    const {m,v}=single('blue',650),p={x:850,y:488,vx:0,vy:0};run(m,5,p,hz);
    for(let i=0;i<hz*3;i++){
      p.vx=-150;m.update(1000/hz,p);
      if(!playerStepBlocked(m.vehicles,p,Math.max(1/30,1/hz)))p.x+=p.vx/hz;
      assert.equal(overlaps(vehicleBounds(v),playerBounds(p)),false,`${hz}Hz`);assert.notEqual(v.yielding,true);
    }
  }
});
test('extended service stays bounded, junction-exclusive and free of vehicle overlap',()=>{
  const m=new TrafficModel(),finished=new Set(),last=new Map(m.vehicles.map(v=>[v.id,v.d]));
  for(let i=0;i<10800;i++){
    m.update(1000/60,away);
    for(const v of m.vehicles){if(!v.active&&v.d>=v.route.length-.01)finished.add(v.id);last.set(v.id,v.d);}
    const active=m.vehicles.filter(v=>v.active);
    for(let a=0;a<active.length;a++)for(let b=a+1;b<active.length;b++)assert.equal(overlaps(vehicleBounds(active[a]),vehicleBounds(active[b])),false,`${active[a].id}/${active[b].id}`);
    for(const j of junctions)assert.ok(active.filter(v=>overlaps(vehicleBounds(v),j)).length<=1,`junction ${j.id}`);
  }
  assert.equal(m.vehicles.length,5);assert.ok(finished.has('blue'));assert.ok(finished.has('red'));assert.ok(finished.has('grey'));assert.ok(finished.has('van'));assert.ok(finished.has('bus'));
});
test('junction and crossing queues recover after repeated normal player interruptions',()=>{
  const m=new TrafficModel(),finished=new Set();
  for(let i=0;i<18000;i++){
    const time=i/60;
    const p=time>=8&&time<20?{x:2376,y:488,vx:0,vy:0}:time>=45&&time<57?{x:3632,y:568,vx:0,vy:0}:time>=90&&time<104?{x:3520,y:528,vx:0,vy:0}:away;
    m.update(1000/60,p);
    for(const v of m.vehicles)if(!v.active&&v.d>=v.route.length-.01)finished.add(v.id);
    const active=m.vehicles.filter(v=>v.active&&!v.yielding);
    for(let a=0;a<active.length;a++)for(let b=a+1;b<active.length;b++)assert.equal(overlaps(vehicleBounds(active[a]),vehicleBounds(active[b])),false);
  }
  assert.equal(finished.size,5,'all routes still finish after the roads clear');
});
