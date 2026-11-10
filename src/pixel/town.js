import { TOWN,townShops,school,schoolHouses,townWalls,schoolFences,townProps,campus } from '../neighbourhood/townLayout.js';
import { createTileSet,tileArea,pixelRect,PALETTE as p } from './tiles.js';
import { pixelLabel } from './buildings.js';
import { paintLaneHouse } from './willowLane.js';
import { seasonalTexture } from './winter.js';

export function paintTown(ctx,top=0,height=TOWN.height){
  const tiles=createTileSet(),r=(x,y,w,h,c)=>pixelRect(ctx,x,y,w,h,c);
  const fill=(key,x,y,w,h)=>tileArea(ctx,tiles,key,x,y,w,h);
  for(let y=top;y<top+height;y+=32)for(let x=TOWN.x;x<TOWN.x+TOWN.width;x+=32)fill(`grass${(x/32+y/32)%4}`,x,y,32,32);
  fill('pavement',2816,384,1536,64);fill('pavement',2816,608,1536,64);
  fill('kerb-north',2816,416,1536,32);fill('kerb-south',2816,608,1536,32);
  for(let y=448;y<608;y+=32)for(let x=2816;x<4352;x+=32)fill(`road${(x/32+y/32)%4}`,x,y,32,32);
  for(let x=2832;x<4352;x+=96)fill('road-marking',x,512,48,32);
  fill('pavement',3488,608,64,800);fill('pavement',3712,608,64,800);
  for(let y=608;y<1408;y+=32)for(let x=3552;x<3712;x+=32)fill('road1',x,y,32,32);
  r(3548,640,4,768,p.cream);r(3712,640,4,768,p.cream);
  for(let y=696;y<1360;y+=96)r(3628,y,8,40,'#e2d9b2');
  for(let x=3560;x<3712;x+=24)r(x,648,14,4,p.cream);
  // British zebra crossing: unimpeded stripes linking both pedestrian routes.
  for(let y=452;y<608;y+=24)r(3496,y,48,12,'#ede4c9');
  for(const y of [384,672]){r(3478,y-20,4,36,p.ink);r(3474,y-26,12,10,'#edc564');r(3478,y-16,4,6,p.cream);}
  for(const s of townShops){
    fill('path',s.doorX,352,32,32);fill('brick',s.x,s.y,s.width,s.height);fill('slate',s.x,s.y,s.width,48);
    r(s.x,s.y+45,s.width,5,p.ink);r(s.x+4,s.y+56,s.width-8,32,s.colour);
    pixelLabel(ctx,s.name,s.x+s.width/2,s.y+62,17,p.cream);
    for(let x=s.x+12;x<s.doorX-12;x+=64){
      r(x,s.y+102,56,72,p.cream);r(x+3,s.y+105,50,66,'#527f8a');r(x+5,s.y+107,46,9,'#99c5bd');
      for(let i=0;i<3;i++)r(x+7+i*14,s.y+151,10,16,['#d8ac67','#9cbd79','#d48c70'][i]);
    }
    r(s.doorX-3,s.y+104,38,88,p.cream);r(s.doorX,s.y+108,32,84,s.colour);r(s.doorX+4,s.y+112,24,48,'#94c2b9');r(s.doorX+25,s.y+163,3,3,'#f1cf7c');
    if(s.id==='fish-chips')for(let x=s.x;x<s.x+s.width;x+=16)r(x,s.y+88,16,12,(x-s.x)%32?p.cream:s.colour);
    if(s.id==='post-office')pixelLabel(ctx,'POST',s.x+40,s.y+126,10,p.cream);
    if(s.id==='supermarket')r(s.x+4,s.y+89,s.width-8,5,'#d8b253');
  }
  schoolHouses.forEach(h=>{
    paintLaneHouse(ctx,tiles,h);
    const west=h.side==='west',x=west?h.x+96:3776;
    fill('path',x,h.y+160,west?96:96,32);
    r(west?h.x+128:3784,h.y+32,32,80,'#4d7847');
    fill('gravel',west?h.x:h.x+64,h.y+224,64,32);
  });
  townWalls.forEach(w=>fill('wall',w.x,w.y,w.width,w.height));
  fill('gravel',3984,992,80,112);fill('path',3776,1056,208,32);
  // Open school grounds: road leads through wide gates, then a courtyard path
  // turns east to the upright building's south-facing main entrance.
  fill('gravel',campus.x+16,campus.y+16,campus.width-32,campus.height-32);
  fill('path',3504,1408,256,448);fill('path',3504,1728,640,96);
  r(3360,1456,80,304,'#5d8f4c');r(3376,1472,48,272,'#83a755');
  r(3808,1472,480,256,'#b78265');fill('slate',3808,1472,480,48);
  r(3808,1517,480,6,p.ink);r(3816,1536,464,44,'#416f77');pixelLabel(ctx,'SCHOOL',4048,1543,27,p.cream);
  for(const y of [1592,1648])for(let x=3824;x<4272;x+=48){
    if(y===1648&&x>=4000&&x<4096)continue;
    r(x,y,36,40,p.cream);r(x+3,y+3,30,34,'#527f8a');r(x+4,y+4,28,5,'#99c5bd');r(x+17,y+3,2,34,p.cream);
  }
  r(4000,1632,96,96,p.cream);r(4006,1638,84,90,'#417b80');
  for(const x of [4010,4050]){r(x,1642,36,64,'#9ac1bc');r(x+28,1704,4,4,p.cream);}
  r(3988,1624,120,12,'#365c64');r(4000,1724,96,4,p.cream);
  schoolFences.forEach(f=>{
    r(f.x,f.y,f.width,f.height,'#335957');
    if(f.width>f.height){for(let x=f.x;x<f.x+f.width;x+=16)r(x,f.y-8,3,f.height+8,'#527e70');}
    else for(let y=f.y;y<f.y+f.height;y+=16)r(f.x,y, f.width,3,'#6b9381');
  });
  r(3468,1370,4,36,p.ink);r(3784,1370,4,36,p.ink);pixelLabel(ctx,'SCHOOL GATES',3632,1380,12,p.ink);
  for(const o of townProps){
    const {x,y,width:w,height:h}=o;
    if(o.kind==='bench'){r(x+4,y+20,5,12,p.ink);r(x+w-9,y+20,5,12,p.ink);for(let i=0;i<4;i++)r(x,y+i*6,w,4,'#bd925d');}
    if(o.kind==='lamp'){r(x+6,y-40,4,56,p.ink);r(x+1,y-48,14,12,'#496c66');r(x+4,y-45,8,6,'#f1d896');}
    if(o.kind==='bin'){r(x,y,w,h,'#376c58');r(x,y,w,4,'#bbcc9f');}
    if(o.kind==='postbox'){r(x,y,w,h,'#b64f44');r(x+2,y+2,w-4,5,'#d97960');r(x+4,y+10,12,4,p.ink);r(x+5,y+18,10,9,p.cream);}
    if(o.kind==='planter'){r(x,y,w,h,'#92755b');r(x+4,y+4,w-8,h-8,'#4f7d47');for(let i=0;i<8;i++)r(x+8+i*10,y+12+(i%2)*12,5,5,i%2?'#e9c66d':'#e1a2a0');}
    if(o.kind==='produce'){for(let i=0;i<5;i++){r(x+i*32,y,28,24,'#8f6b42');r(x+3+i*32,y+3,22,16,['#cb7758','#8aaa54','#d9bf5c','#bd8053','#72a45b'][i]);}}
    if(o.kind==='tree'){r(x+12,y,8,h,'#8f704b');r(x-8,y-28,w+16,36,'#477e4b');r(x,y-40,w,32,'#82ab57');}
    if(o.kind==='car'){r(x,y,w,h,'#344b54');r(x+3,y+3,w-6,h-6,'#697e9d');r(x+7,y+18,w-14,16,'#a1c1be');r(x+7,y+52,w-14,12,'#a1c1be');r(x+4,y+3,8,4,p.cream);r(x+w-12,y+3,8,4,p.cream);}
    if(o.kind==='bike'){for(const xx of [x+4,x+32]){r(xx,y+4,12,12,p.ink);r(xx+3,y+7,6,6,'#b7c6aa');}r(x+12,y+3,26,3,'#af7758');r(x+23,y-3,3,17,'#af7758');}
    if(o.kind==='trolleys'){for(let i=0;i<3;i++){r(x+i*18,y,24,16,'#8ba5a1');r(x+3+i*18,y+3,18,10,'#c3c9b6');r(x+4+i*18,y+18,4,4,p.ink);r(x+17+i*18,y+18,4,4,p.ink);}}
  }
  r(3388,690,4,32,p.ink);r(3380,672,144,22,p.cream);pixelLabel(ctx,'SCHOOL ROAD',3452,676,13,p.ink);
  pixelLabel(ctx,'BIRMINGHAM STREET',3032,566,11,'#aab7b1');
}

export function drawTown(scene){
  const colour=scene.state?.adventure==='pharmacyPanic'?0xb8c8cc:0x78a253;
  scene.add.rectangle(3584,-576,1536,1152,colour).setDepth(-1);
  scene.add.rectangle(1408,1600,2816,1152,colour).setDepth(-1);
  // Three moderate-sized textures instead of a huge whole-world canvas.
  for(const [i,y,height] of [[0,0,768],[1,768,768],[2,1536,640]]){
    const key=`town-expansion-${i}`;
    if(!scene.textures.exists(key)){
      const texture=scene.textures.createCanvas(key,TOWN.width,height),ctx=texture.getContext();ctx.imageSmoothingEnabled=false;
      ctx.translate(-TOWN.x,-y);paintTown(ctx,y,height);texture.refresh();
    }
    scene.add.image(TOWN.x,y,seasonalTexture(scene,key)).setOrigin(0);
  }
}
