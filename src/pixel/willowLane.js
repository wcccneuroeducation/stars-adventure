import { WILLOW as lane,willowHouses,willowWalls,willowProps,futureShopPlot } from '../neighbourhood/willowLayout.js';
import { PALETTE as p,createTileSet,tileArea,pixelRect } from './tiles.js';
import { pixelLabel } from './buildings.js';
import { paintPharmacyExterior } from '../pharmacy/art.js';
import { seasonalTexture } from './winter.js';

// Upright houses with a projecting side porch towards the vertical street.
// No transformed sprites: roofs remain above windows and doors on both sides.
export function paintLaneHouse(ctx,tiles,h){
  const {x,y,side,variant}=h,r=(a,b,w,d,c)=>pixelRect(ctx,a,b,w,d,c);
  const mainX=x+(side==='east'?32:0),porchX=x+(side==='west'?96:0);
  tileArea(ctx,tiles,'brick',mainX,y+48,96,112);
  tileArea(ctx,tiles,'slate',mainX,y,96,48);
  r(mainX,y,96,3,'#8992a0');r(mainX,y+45,96,5,p.ink);
  r(mainX+12,y+3,16,25,p.brickDark);r(mainX+10,y+2,20,4,p.cream);
  r(mainX+14,y-4,4,8,p.brick);r(mainX+23,y-4,4,8,p.brick);
  for(const wy of [y+64,y+114])for(const wx of [mainX+12,mainX+61]){
    r(wx-2,wy-2,27,33,p.cream);r(wx,wy,23,28,'#42677b');
    r(wx+2,wy+2,19,4,'#81b1b8');r(wx+10,wy,2,28,p.cream);r(wx,wy+12,23,2,p.cream);
    r(wx-3,wy+28,29,3,'#e4c99b');
  }
  tileArea(ctx,tiles,'brick',porchX,y+104,32,56);
  tileArea(ctx,tiles,'slate',porchX,y+88,32,16);r(porchX,y+102,32,3,p.ink);
  const colour=['#345e63','#764e4d','#526a49','#35516d'][variant];
  r(porchX+4,y+112,24,48,p.cream);r(porchX+6,y+114,20,44,colour);
  r(porchX+9,y+117,14,10,'#83a7a8');r(porchX+20,y+139,3,3,'#f5cb71');
  r(porchX,y+158,32,2,p.cream);
  pixelLabel(ctx,String(2+willowHouses.indexOf(h)),mainX+48,y+99,8,p.cream);
}

export function paintWillowLane(ctx){
  const tiles=createTileSet(),r=(x,y,w,h,c)=>pixelRect(ctx,x,y,w,h,c);
  const fill=(key,x,y,w,h)=>tileArea(ctx,tiles,key,x,y,w,h);
  for(let y=lane.y;y<1024;y+=32)for(let x=lane.x;x<lane.x+lane.width;x+=32)
    fill(`grass${((x+y)/32%4+4)%4}`,x,y,32,32);
  // Birmingham Street continues unchanged into a T-junction beyond the park.
  fill('pavement',2048,416,768,32);fill('pavement',2048,608,768,32);
  fill('kerb-north',2048,416,768,32);fill('kerb-south',2048,608,768,32);
  for(let y=448;y<608;y+=32)for(let x=2048;x<2816;x+=32)fill('road0',x,y,32,32);
  for(let x=2064;x<2816;x+=96)fill('road-marking',x,512,48,32);
  fill('pavement',2240,-1088,288,64);
  fill('pavement',2240,-1024,64,1472);fill('pavement',2464,-1024,64,1472);
  for(let y=-1056;y<448;y+=32)for(let x=2304;x<2464;x+=32)fill('road1',x,y,32,32);
  // Vertical kerbs are drawn directly; no rotation of textured architecture.
  r(2300,-1056,4,1472,p.cream);r(2464,-1056,4,1472,p.cream);
  r(2304,-1056,160,4,p.cream);
  for(let y=-1008;y<400;y+=96)r(2380,y,8,40,'#e2d9b2');
  // Continuous paved corners and give-way markings at the mouth.
  fill('pavement',2240,416,64,32);fill('pavement',2464,416,64,32);
  for(let x=2312;x<2464;x+=24)r(x,436,14,4,p.cream);
  willowHouses.forEach(h=>{
    const west=h.side==='west',gx=west?h.x+h.width:2528;
    fill('grass1',gx,h.y,32,208);
    // Door threshold at the foot of the upright porch turns out to the lane.
    fill('path',west?h.x+96:2528,h.y+160,64,32);
    fill('path',west?2208:2528,h.y+128,32,64);
    for(let i=0;i<4;i++){
      r(gx+7,h.y+16+i*24,18,13,'#456d43');r(gx+10,h.y+17+i*24,4,4,i%2?'#efc875':'#e7a0a1');
    }
    paintLaneHouse(ctx,tiles,h);
    if(h===futureShopPlot){
      paintPharmacyExterior(ctx,h);
    }
  });
  willowWalls.forEach(w=>{
    fill('wall',w.x,w.y,w.width,w.height);
    // Gate posts frame an open, walkable entrance rather than blocking it.
    r(w.x,w.y+w.height-4,16,4,p.cream);
  });
  // Low garden fences follow the property edges, clear of every path.
  willowHouses.forEach(h=>{for(let x=h.x;x<h.x+128;x+=16){r(x,h.y+200,4,16,p.wood);r(x,h.y+204,16,3,'#c29262');}});
  willowProps.forEach(o=>{
    if(o.kind==='lamp'){r(o.x+5,o.y-40,5,52,p.ink);r(o.x,o.y-46,16,12,p.ink);r(o.x+3,o.y-44,10,8,'#f2d894');}
    if(o.kind==='bin'){r(o.x,o.y,16,24,p.teal);r(o.x-1,o.y,18,4,'#a6b695');r(o.x+4,o.y+7,1,12,'#659579');}
    if(o.kind==='tree'){r(o.x+8,o.y,8,24,p.wood);r(o.x-8,o.y-32,40,40,'#3e7549');r(o.x-3,o.y-40,30,28,'#72a753');}
  });
  // Readable upright sign, away from the clear 64px pedestrian corner.
  r(2164,386,4,30,p.ink);r(2152,368,144,22,p.cream);
  pixelLabel(ctx,'WILLOW LANE',2224,372,13,p.ink);
  pixelLabel(ctx,'BIRMINGHAM STREET',2632,568,10,'#aab7b1');
}

export function drawWillowLane(scene){
  const key='willow-lane-environment';
  if(!scene.textures.exists(key)){
    const texture=scene.textures.createCanvas(key,lane.width,lane.height),ctx=texture.getContext();
    ctx.imageSmoothingEnabled=false;ctx.translate(-lane.x,-lane.y);paintWillowLane(ctx);texture.refresh();
  }
  // Unreachable land above the original map prevents a blank camera backdrop.
  scene.add.rectangle(1024,-576,2048,1152,scene.state?.adventure==='pharmacyPanic'?0xb8c8cc:0x78a253).setDepth(-1);
  scene.add.image(lane.x,lane.y,seasonalTexture(scene,key)).setOrigin(0);
}
