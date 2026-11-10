import { SCHOOL,schoolRooms,schoolWalls,schoolFurniture } from './layout.js';
import { schoolText as text } from '../scenarios/schoolText.js';
import { createTileSet,tileArea,pixelRect } from '../pixel/tiles.js';
import { pixelLabel } from '../pixel/buildings.js';
import { seasonalTexture } from '../pixel/winter.js';

export function paintSchool(ctx,top,height){
  const tiles=createTileSet(),r=(x,y,w,h,c)=>pixelRect(ctx,x,y,w,h,c),label=(t,x,y,size=12,c='#294e4b')=>pixelLabel(ctx,t,x,y,size,c);
  r(0,top,1600,height,'#29464b');
  // The courtyard shares the town's grass/paving tiles; indoor floor is continuous.
  if(top<512){
    for(let y=0;y<512;y+=32)for(let x=0;x<1600;x+=32)tileArea(ctx,tiles,(x>=704&&x<896)||y>=352?'pavement':'grass1',x,y,32,32);
    r(1056,128,320,224,'#7e9b88');r(1060,132,312,216,'#8fae99');
    for(let y=160;y<336;y+=32)r(1152,y,64,2,'#efe2af');r(1183,160,2,176,'#efe2af');
    label(text.courtyard,800,384,18);r(128,64,300,16,'#49736b');
    for(let x=128;x<428;x+=24)r(x,64,12,16,'#87a396');
  }
  for(let y=Math.max(512,top);y<Math.min(2176,top+height);y+=32)for(let x=48;x<1552;x+=32){r(x,y,32,32,'#d5d7bc');r(x,y,32,1,'#bcc7b2');}
  for(const room of schoolRooms){
    r(room.x,room.y,room.width,room.height,room.floor);
    for(let y=room.y+16;y<room.y+room.height-16;y+=32)for(let x=room.x+16;x<room.x+room.width-16;x+=32){r(x,y,30,1,'#b4bda6');}
    label(room.label,room.x+room.width/2,room.y+18,14);
    // Upright windows and wall displays, decorative on the solid perimeter.
    const d=room.door;r(d.x-3,d.y,22,64,'#e1c897');r(d.x+3,d.y+3,10,58,'#c3bd94');
    if(room.id.startsWith('classroom')||room.id==='science'){
      r(room.x+224,room.y+40,192,32,'#718d7b');r(room.x+228,room.y+44,184,24,'#f1efd8');
      r(room.x+260,room.y+51,100,2,'#90a7a0');r(room.x+280,room.y+59,112,2,'#a3b5a6');
    }
    if(room.id==='science'){
      for(const x of [room.x+176,room.x+448]){r(x,room.y+32,32,44,'#e8deb6');r(x+10,room.y+40,12,12,'#bd7767');r(x+7,room.y+56,18,7,'#6194a0');}
    }
    if(room.id==='sports'){
      const x=room.x+48,y=room.y+96,w=528,h=432;
      r(x,y,w,3,'#eee5bd');r(x,y+h,w,3,'#eee5bd');r(x,y,3,h,'#eee5bd');r(x+w,y,3,h,'#eee5bd');r(x,y+h/2,w,3,'#eee5bd');
      ctx.strokeStyle='#eee5bd';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+w/2,y+h/2,48,0,Math.PI*2);ctx.stroke();
      for(const yy of [y,y+h-48]){r(x+176,yy,176,48,'#a88054');r(x+176,yy,176,3,'#eee5bd');r(x+176,yy,3,48,'#eee5bd');r(x+350,yy,3,48,'#eee5bd');}
      for(const yy of [y-24,y+h+8]){r(x+w/2-32,yy,64,8,'#e6dfba');r(x+w/2-12,yy+5,24,5,'#be7757');}
    }
    if(room.id==='library')label(text.quiet,room.x+520,room.y+280,9);
  }
  // Broad wall records are also the source of visible wall art.
  for(const w of schoolWalls){r(w.x,w.y,w.width,w.height,'#54786f');r(w.x,w.y,w.width,Math.min(3,w.height),'#9db69c');}
  for(const room of schoolRooms)for(let x=room.x+32;x<room.x+room.width-32;x+=160){r(x,room.y+2,80,12,'#4d767f');r(x+3,room.y+3,74,7,'#9fc6bf');r(x+38,room.y+2,3,12,'#ecdfb7');}
  // Glazed panels along the corridor's solid classroom walls.
  for(const y of [656,1008,1360])for(const x of [690,898]){r(x,y,12,64,'#486d79');r(x+2,y+3,8,58,'#9fc6bf');r(x+1,y+30,10,3,'#ecdfb7');}
  // Doorways remain visible gaps; labels sit on the floor beside them.
  for(const room of schoolRooms){const d=room.door;r(d.x,d.y,16,64,'#d9c599');r(d.x+5,d.y+4,5,56,'#b39b77');}
  for(const f of schoolFurniture)paintFurniture(f);
  for(const [i,y] of [680,1032,1384,1856].entries()){
    r(760,y,96,24,'#426e69');label(text.corridorSigns[i],808,y+6,8,'#f6e5b8');
  }
  // Clock on the corridor wall, noticeboard and a reception welcome sign.
  label(text.reception,800,1976,18);label(text.welcome,1208,1960,14);
  r(96,1968,112,64,'#8d7755');r(100,1972,104,56,'#d8cba5');label(text.notice,152,1980,8);
  for(let i=0;i<4;i++)r(104+i*24,1998,18,24,i%2?'#a8bba0':'#cba085');
  r(752,2112,96,32,'#8cab99');label(text.exitLabel,800,2118,10);
  function paintFurniture(f){
    const {x,y,width:w,height:h,kind}=f;
    if(kind==='noticeboard'){r(x,y,w,h,'#9d7a54');r(x+3,y+3,w-6,h-6,'#e6d6ac');for(let i=0;i<3;i++)r(x+5+i*13,y+8,9,16,['#92b2a0','#c89270','#b5b8c8'][i]);return;}
    if(kind==='clock'){r(x,y,w,h,'#4b7168');r(x+4,y+4,24,24,'#f0e5bf');r(x+15,y+8,2,10,'#36544f');r(x+15,y+16,8,2,'#36544f');return;}
    if(kind==='tree'){r(x+12,y,8,h,'#90704d');r(x-8,y-32,w+16,40,'#477e4b');r(x,y-44,w,32,'#82ab57');return;}
    if(kind==='planter'){r(x,y,w,h,'#987b59');r(x+4,y+4,w-8,h-8,'#5e8d4d');for(let i=0;i<w/20;i++)r(x+8+i*20,y+16,6,5,i%2?'#e5bb6b':'#d99a91');return;}
    if(kind==='canopy-post'){r(x,y,w,h,'#5b7f70');return;}
    r(x,y,w,h,'#52675d');r(x+3,y+3,w-6,h-6,'#ba9a65');
    if(kind==='locker'){
      r(x+3,y+3,w-6,h-6,'#7ba39b');for(let yy=y+8;yy<y+h;yy+=32){r(x+5,yy,w-10,2,'#a9c5b3');r(x+w-10,yy+12,3,5,'#e9dcac');}return;
    }
    if(kind==='books'){
      for(let yy=y+6;yy<y+h-4;yy+=24){for(let xx=x+5;xx<x+w-5;xx+=8)r(xx,yy,5,15,['#9cb682','#bb805b','#7195a5'][Math.floor(xx/8)%3]);r(x+3,yy+16,w-6,3,'#836a4c');}return;
    }
    if(kind==='sink'){
      r(x+3,y+3,w-6,h-6,'#c1d3c6');for(let xx=x+8;xx<x+w-20;xx+=32){r(xx,y+12,24,18,'#527d83');r(xx+3,y+15,18,12,'#a4c5bf');r(xx+11,y+5,3,10,'#ecdfb7');}return;
    }
    if(kind==='cubicle'){
      r(x+4,y+4,w-8,h-8,'#e0dfc2');r(x+18,y+12,32,36,'#f4efd6');r(x+23,y+20,22,20,'#b1c7be');r(x+5,y+h-14,w-10,8,'#7da398');r(x+w-15,y+h-14,3,4,'#e7d9ac');return;
    }
    if(kind==='sofa'||kind==='bench'){
      r(x+3,y+3,w-6,h-6,kind==='sofa'?'#6e9e91':'#b5905d');r(x+6,y+5,w-12,8,kind==='sofa'?'#9cbda1':'#d0b17a');return;
    }
    if(kind==='bin'){r(x+2,y+2,w-4,h-4,'#4f8371');return;}
    if(kind==='student-desk'||kind==='dining'||kind==='reading-table'){
      r(x+3,y+3,w-6,h-20,'#dab77d');r(x+8,y+h-14,w-16,10,'#668d83');
      if(kind==='student-desk'){r(x+9,y+7,18,12,'#f1e7c6');r(x+31,y+10,7,3,'#8ca686');}return;
    }
    if(kind==='lab'){
      r(x+3,y+3,w-6,h-18,'#668a89');for(const dx of [16,64,112]){r(x+dx,y+h-14,18,10,'#8a805f');r(x+dx+2,y+12,5,15,'#b8cfc2');r(x+dx,y+24,10,5,'#b17d6f');}return;
    }
    if(kind==='computer'||kind==='teacher-desk'||kind==='reception'){
      r(x+12,y+6,28,22,'#35575d');r(x+15,y+9,22,14,'#a4c6bc');r(x+10,y+30,36,5,'#e1d5ab');r(x+w-32,y+10,20,18,'#eee4c4');return;
    }
    if(kind==='serving'||kind==='drinks'){
      r(x+3,y+3,w-6,10,'#c5d2bc');for(let xx=x+10;xx<x+w-16;xx+=32){r(xx,y+18,22,18,'#eee4bd');r(xx+4,y+22,14,9,kind==='drinks'?'#86b4b4':'#a6ac69');}return;
    }
    if(kind==='cabinet'){r(x+w/2-1,y+4,2,h-8,'#8c805c');r(x+w/2+6,y+h/2,4,5,'#e5cc91');}
  }
}

export function drawSchool(scene){
  for(const [key,y,height] of [['school-courtyard',0,512],['school-building-0',512,832],['school-building-1',1344,832]]){
    if(!scene.textures.exists(key)){
      const texture=scene.textures.createCanvas(key,SCHOOL.width,height),ctx=texture.getContext();ctx.imageSmoothingEnabled=false;ctx.translate(0,-y);paintSchool(ctx,y,height);texture.refresh();
    }
    scene.add.image(0,y,key==='school-courtyard'?seasonalTexture(scene,key):key).setOrigin(0);
  }
}
