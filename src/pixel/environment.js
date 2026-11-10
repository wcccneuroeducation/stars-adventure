import { WORLD, TILE, houses, shop, obstacles } from '../world.js';
import { PALETTE as p, createTileSet, tileArea, pixelRect } from './tiles.js';
import { makeTerrace, drawShop, pixelLabel } from './buildings.js';

export function paintEnvironment(ctx) {
  const tiles=createTileSet();
  const r=(x,y,w,h,c)=>pixelRect(ctx,x,y,w,h,c);
  const fill=(key,x,y,w,h)=>tileArea(ctx,tiles,key,x,y,w,h);
  const label=(text,x,y,size=10,color=p.cream)=>pixelLabel(ctx,text,x,y,size,color);
  // Pass 1: terrain. Stable variants avoid obvious repeated grass/asphalt noise.
  for(let y=0;y<WORLD.height;y+=TILE)for(let x=0;x<WORLD.width;x+=TILE){
    const variant=(x/TILE*7+y/TILE*11)%4;
    fill(`grass${variant}`,x,y,TILE,TILE);
  }
  fill('pavement',0,416,WORLD.width,32);fill('pavement',0,608,WORLD.width,32);
  for(let y=448;y<608;y+=32)for(let x=0;x<WORLD.width;x+=32)fill(`road${(x/32+y/32)%4}`,x,y,32,32);
  fill('kerb-north',0,416,WORLD.width,32);fill('kerb-south',0,608,WORLD.width,32);
  for(let x=16;x<WORLD.width;x+=96)fill('road-marking',x,512,48,32);
  // Drain covers sit flush in the road and introduce no new obstacles.
  for(let x=320;x<WORLD.width;x+=480){r(x,453,24,10,'#384a53');for(let i=0;i<6;i++)r(x+2+i*4,455,1,6,'#8b9691');}
  fill('gravel',1696,640,64,384);fill('gravel',1664,704,128,32);
  fill('path',shop.x+208,352,48,64);

  // Pass 2: garden modules and terraces, anchored to the existing footprints.
  const terraceCache=new Map();
  houses.forEach((h,index)=>{
    const north=h.y>WORLD.height/2,gardenY=north?h.y-32:h.y+h.height;
    fill('grass1',h.x,gardenY,h.width,32);fill('path',h.x+64,gardenY,32,32);
    r(h.x+3,gardenY+3,52,25,'#5d7949');r(h.x+5,gardenY+5,48,21,'#405a3e');
    // Small flowerbeds are ground detail; no new solid-looking furniture.
    for(let i=0;i<6;i++){
      const xx=h.x+9+i*7,yy=gardenY+9+(i%2)*7;
      r(xx,yy+2,2,5,'#83a855');r(xx-1,yy,4,3,index%3?'#f3cb71':'#e6a5a1');
    }
    r(h.x+108,gardenY+6,44,19,'#5f8b48');r(h.x+110,gardenY+5,40,4,'#92b260');
    const variant=Math.floor(index/2)%4,key=variant;
    if(!terraceCache.has(key))terraceCache.set(key,makeTerrace(tiles,variant));
    ctx.drawImage(terraceCache.get(key),h.x,h.y);
    label(String(12+index*2),h.x+80,h.y+124,7,'#f2d6ab');
  });
  drawShop(ctx,tiles,shop);

  // Walls use the existing collision records directly, so art cannot drift.
  obstacles.filter(o=>o.height===16).forEach(w=>fill('wall',w.x,w.y,w.width,w.height));
  // Path continuation to the original gaps in the garden wall.
  fill('path',1248,640,64,64);

  // Pass 3: street furniture, all within the previous obstacle footprints.
  bench(1248,400);
  shelter(1696,384);
  r(1809,390,6,41,'#728879');r(1810,391,1,39,'#c1c9b0');
  r(1799,362,28,29,p.cream);r(1801,364,24,17,'#bd604c');
  label('BUS',1813,367,9);r(1804,385,18,2,'#8b9b8c');
  r(1856,416,24,24,'#315b50');r(1858,419,20,17,'#477b61');
  for(let i=0;i<4;i++)r(1861+i*4,422,1,13,'#638f71');
  r(1856,416,24,4,'#aec09a');r(1862,417,12,2,'#253d3e');
  // The park gate is open: no bars cross the walkable 64px entrance.
  for(const x of [1688,1760]){r(x,645,8,40,'#936047');r(x,645,8,5,'#e1c391');r(x+2,651,2,32,'#c08257');}
  // A painted nameplate sits on the existing wall to the right of the gate.
  r(1774,657,138,13,p.teal);label('SMALL HEATH PARK',1843,659,9);
  // These two trees keep exactly the previous trunk/canopy footprint.
  tree(1808,752);tree(1936,880);
  // Other existing decorative trees are away from street routes.
  for(const [x,y] of [[96,96],[1856,192],[448,944],[1472,896]])tree(x,y);
  label('B I R M I N G H A M   S T R E E T',640,565,10,'#aab7b1');

  function bench(x,y){
    r(x+4,y+22,5,10,p.ink);r(x+55,y+22,5,10,p.ink);
    r(x,y,64,23,'#624b3d');
    for(let i=0;i<4;i++){r(x+1,y+i*6,62,4,'#b7804f');r(x+2,y+i*6,60,1,'#d6a467');}
    r(x+5,y+2,3,20,'#35494a');r(x+56,y+2,3,20,'#35494a');
  }
  function shelter(x,y){
    r(x,y,96,48,'#344e53');r(x+4,y+6,88,35,'#7da7a2');
    for(const xx of [x+7,x+49]){r(xx,y+9,36,25,'#a0c6b5');r(xx+3,y+10,6,23,'#bad7bc');r(xx+12,y+12,3,18,'#91b3aa');}
    r(x+44,y+6,4,36,'#416662');r(x+4,y+34,87,8,'#426563');
    r(x+10,y+34,33,3,'#d0a36d');r(x+10,y+37,3,6,'#3e514e');r(x+40,y+37,3,6,'#3e514e');
    r(x+60,y+12,19,22,p.cream);r(x+62,y+14,15,3,'#c57756');
    for(let yy=0;yy<4;yy++)r(x+63,y+21+yy*3,12,1,'#718b81');
    r(x,y,96,7,'#2f5557');r(x,y,96,2,'#92b5a5');
  }
  function tree(x,y){
    r(x-5,y,10,32,'#70543c');r(x-3,y+2,3,28,'#ab7c4b');
    r(x-18,y-24,36,36,'#315d43');r(x-24,y-20,48,24,'#3e7549');
    r(x-16,y-40,32,48,'#4f874b');r(x-21,y-28,42,28,'#58934f');
    r(x-13,y-37,25,12,'#72a753');r(x-19,y-23,14,12,'#80b359');
    r(x+4,y-13,16,13,'#417748');r(x-9,y+3,20,5,'#386b43');
    for(let i=0;i<12;i++)r(x-15+(i*13)%31,y-30+(i*7)%28,3,2,i%2?'#8bb65d':'#477d48');
  }
}

export function drawPixelEnvironment(scene) {
  // One GPU texture and one world image; no thousands of per-tile GameObjects.
  const key='birmingham-environment';
  if(scene.textures.exists(key))scene.textures.remove(key);
  const texture=scene.textures.createCanvas(key,WORLD.width,WORLD.height);
  const ctx=texture.getContext();ctx.imageSmoothingEnabled=false;
  paintEnvironment(ctx);texture.refresh();
  scene.add.image(0,0,key).setOrigin(0);
}
