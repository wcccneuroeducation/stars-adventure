import { PALETTE as p, pixelRect, createTileSet, tileArea } from '../pixel/tiles.js';
import { PARK,parkPaths,parkTrees,parkFences,flowerbeds,seating,fountain,muga,friends } from './layout.js';
import { parkText } from '../scenarios/parkText.js';
import { seasonalTexture } from '../pixel/winter.js';

export function paintPark(ctx) {
  const tiles=createTileSet(),r=(x,y,w,h,c)=>pixelRect(ctx,x,y,w,h,c);
  const fill=(key,rect)=>tileArea(ctx,tiles,key,rect.x,rect.y,rect.width,rect.height);
  const label=(message,x,y,size=12,color=p.cream)=>{
    ctx.fillStyle=color;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(message,x,y);
  };
  for(let y=0;y<PARK.height;y+=32)for(let x=0;x<PARK.width;x+=32)fill(`grass${(x/32*7+y/32*11)%4}`,{x,y,width:32,height:32});
  // Connected path strips create bends, a seating spur and an eastern loop.
  for(const path of parkPaths){r(path.x-3,path.y-3,path.width+6,path.height+6,'#a8aa7d');fill('gravel',path);}
  // A shaded pergola: shade is visual only, not a passive hydration bonus.
  r(576,896,224,184,'#68894f');r(584,904,208,168,'#6f9257');
  for(let y=904;y<1072;y+=12)r(584,y,208,3,'#78975c');
  fill('path',{x:592,y:960,width:176,height:80});
  for(const [x,y] of [[584,896],[776,896],[584,1056],[776,1056]]){r(x,y,12,12,'#694e3c');r(x+2,y,3,12,'#b38a55');}
  // Pergola slats sit above the northern half without hiding the bench approach.
  for(let x=576;x<800;x+=24){r(x,864,8,68,'#725c40');r(x+1,864,3,68,'#ab8652');}
  r(576,864,224,7,'#c49c62');r(576,924,224,6,'#987749');
  for(const b of flowerbeds){
    r(b.x,b.y,b.width,b.height,'#b69665');r(b.x+4,b.y+4,b.width-8,b.height-8,'#705f43');
    for(let y=b.y+12;y<b.y+b.height-6;y+=16)for(let x=b.x+12;x<b.x+b.width-6;x+=16){
      r(x,y+3,2,6,'#639149');r(x-2,y,6,4,((x+y)/16)%3?'#ebc36b':'#d98d86');r(x,y+1,2,2,'#fae5a1');
    }
  }
  // MUGA surface, pitch markings and goals. Football gameplay is not enabled.
  r(muga.x+12,muga.y+12,muga.width-24,muga.height-24,'#4d8b79');
  for(let x=944;x<1424;x+=64)r(x,144,32,288,'#528f7b');
  outline(960,160,448,256,'#d0dec2',3);r(1182,160,3,256,'#d0dec2');
  outline(960,216,64,144,'#d0dec2',2);outline(1344,216,64,144,'#d0dec2',2);
  // Stepped centre circle reads crisply at native pixel resolution.
  outline(1152,256,64,64,'#d0dec2',2);r(1158,256,52,2,'#d0dec2');r(1158,318,52,2,'#d0dec2');
  for(const x of [944,1404]){r(x,240,20,96,'#d8ded0');r(x+3,243,14,90,'#72958b');for(let y=248;y<332;y+=8)r(x+3,y,14,1,'#b3c7b6');}
  // Rails and chain-link mesh follow exactly the solid fence rectangles.
  for(const f of parkFences){
    r(f.x,f.y,f.width,f.height,'#385d56');
    if(f.width>f.height){r(f.x,f.y,f.width,2,'#99b4a0');for(let x=f.x;x<f.x+f.width;x+=16){r(x,f.y,2,f.height,'#b1c5a7');r(x+6,f.y+5,3,2,'#769884');}}
    else {r(f.x,f.y,2,f.height,'#99b4a0');for(let y=f.y;y<f.y+f.height;y+=16){r(f.x,y,f.width,2,'#b1c5a7');r(f.x+5,y+6,2,3,'#769884');}}
  }
  r(1040,112,288,28,p.teal);label(parkText.mugaSign,1184,119,13);
  // Bench and fountain use the same timber/teal/slate palette as the street.
  r(seating.x,seating.y,seating.width,seating.height,'#5d4c3b');
  for(let i=0;i<4;i++){r(seating.x+2,seating.y+i*7,92,5,'#be8a52');r(seating.x+3,seating.y+i*7,90,1,'#e2b575');}
  r(614,946,4,28,p.ink);r(690,946,4,28,p.ink);
  r(fountain.x,fountain.y,32,48,'#486d74');r(838,720,20,30,'#6c9b9c');r(840,722,3,25,'#9ab7ad');
  r(832,704,32,16,'#a7c6b9');r(836,707,24,8,'#3e777e');r(844,703,7,4,'#dce2c8');r(851,698,4,10,'#c4d9c9');
  for(const t of parkTrees)tree(t.x,t.y);
  // Small flush path details never add collision bodies.
  for(const [x,y] of [[768,1280],[480,864],[960,656],[1280,816]]){r(x,y,16,16,'#b4a57e');r(x+3,y+3,10,10,'#d3c499');}
  r(664,1432,64,32,p.teal);label('PARK',696,1441,12);
  r(744,1480,8,24,'#d5bb86');r(848,1480,8,24,'#d5bb86');
  label(parkText.parkSign,800,1520,12,'#e6d8aa');
  function outline(x,y,w,h,c,t){r(x,y,w,t,c);r(x,y+h-t,w,t,c);r(x,y,t,h,c);r(x+w-t,y,t,h,c);}
  function tree(x,y){
    r(x-10,y+12,20,28,'#715339');r(x-7,y+14,5,24,'#aa7d47');
    r(x-28,y-36,56,64,'#315e43');r(x-40,y-20,80,40,'#447a49');
    r(x-24,y-48,48,68,'#568e4c');r(x-32,y-32,64,48,'#60994f');
    r(x-22,y-44,38,15,'#7bad58');r(x-34,y-22,23,18,'#82b55b');r(x+12,y-12,24,23,'#417648');
    for(let i=0;i<18;i++)r(x-28+(i*17)%55,y-32+(i*13)%48,4,2,i%2?'#8cba61':'#4d844b');
  }
}

// Keep the waiting group on a reusable layer so Jay is not duplicated while
// joining the pitch. The positions and park artwork outside a match are retained.
export function drawWaitingFriends(scene){
  const g=scene.add.graphics().setDepth(2);
  const r=(x,y,w,h,c)=>g.fillStyle(Number(c.replace('#','0x'))).fillRect(x,y,w,h);
  for(const f of friends){
    const x=f.x-16,y=f.y-16;
    r(x+7,y+24,6,7,p.ink);r(x+19,y+24,6,7,p.ink);
    r(x+9,y+5,14,12,f.skin);r(x+8,y+2,16,7,f.hair);r(x+9,y+16,14,10,f.shirt);
    r(x+5,y+18,4,8,f.skin);r(x+23,y+18,4,8,f.skin);
    r(x+12,y+10,2,2,p.ink);r(x+20,y+10,2,2,p.ink);
  }
  const label=scene.add.text(1088,492,parkText.jayName,{fontFamily:'monospace',fontSize:11,color:p.cream,fontStyle:'bold'}).setOrigin(.5,0).setDepth(2);
  return {setVisible(visible){g.setVisible(visible);label.setVisible(visible);}};
}

export function drawPark(scene) {
  const key='small-heath-park';
  // TextureManager outlives scenes. Reuse the baked map on subsequent visits.
  if(!scene.textures.exists(key)){
    const texture=scene.textures.createCanvas(key,PARK.width,PARK.height);
    const ctx=texture.getContext();ctx.imageSmoothingEnabled=false;paintPark(ctx);texture.refresh();
  }
  scene.add.image(0,0,seasonalTexture(scene,key)).setOrigin(0);
  // Only add a back view for looking into the park; existing player art is intact.
  if(!scene.textures.exists('player-back')){
    const back=scene.textures.createCanvas('player-back',32,32),c=back.getContext();
    c.imageSmoothingEnabled=false;c.drawImage(scene.textures.get('player').getSourceImage(),0,0);
    pixelRect(c,9,5,14,12,'#433c3b');pixelRect(c,10,16,12,9,'#efc87d');back.refresh();
  }
}
