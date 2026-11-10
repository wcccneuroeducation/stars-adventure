import { pixelRect } from '../pixel/tiles.js';
import { pixelLabel } from '../pixel/buildings.js';
import { PHARMACY,robotZone } from './layout.js';
import { pharmacyText as text } from '../scenarios/pharmacyText.js';

export function paintPharmacyExterior(ctx,h){
  const r=(x,y,w,d,c)=>pixelRect(ctx,x,y,w,d,c),{x,y}=h;
  // Retain the upright roof and side porch; adapt the public shop facade.
  r(x+2,y+50,92,110,'#326d55');r(x+3,y+51,90,20,'#25534b');
  pixelLabel(ctx,'PHARMACY',x+48,y+55,13,'#fff2c7');
  for(const wx of [x+7,x+51]){
    r(wx,y+78,38,73,'#e5dfbd');r(wx+3,y+81,32,67,'#527f8a');
    r(wx+5,y+83,28,7,'#99c5bd');r(wx+17,y+81,2,67,'#dfdebb');
    for(let i=0;i<3;i++)r(wx+5+i*9,y+130,6,12,['#d6ae70','#a7c690','#e5d4ad'][i]);
  }
  r(x+96,y+106,32,54,'#326d55');r(x+99,y+111,26,49,'#e7dfbb');
  r(x+102,y+114,20,44,'#376e65');r(x+104,y+116,16,26,'#94c7bb');r(x+117,y+146,3,3,'#f3cf7d');
  r(x+111,y+61,20,34,'#edf0d0');r(x+105,y+68,32,20,'#edf0d0');
  r(x+115,y+64,12,28,'#45aa69');r(x+108,y+72,26,12,'#45aa69');
}

export function paintPharmacy(ctx){
  const r=(x,y,w,h,c)=>pixelRect(ctx,x,y,w,h,c);
  r(0,0,960,768,'#365653');
  for(let y=32;y<736;y+=32)for(let x=32;x<928;x+=32){
    r(x,y,32,32,(x/32+y/32)%2?'#e0dcc6':'#d3d8c2');r(x,y,32,1,'#b8c4b2');
  }
  r(32,32,896,32,'#8eaf9a');pixelLabel(ctx,'WILLOW LANE PHARMACY',480,40,17,'#244d48');
  const shelf=(x,y,w,h)=>{
    r(x,y,w,h,'#596b61');r(x+4,y+4,w-8,h-8,'#ede3bf');
    for(let yy=y+8;yy<y+h-12;yy+=32){
      for(let xx=x+8;xx<x+w-10;xx+=16){r(xx,yy,11,18,['#8fb2a4','#ca9b75','#b5b6d2'][Math.floor(xx/16)%3]);r(xx+2,yy+4,7,4,'#faf0cf');}
      r(x+3,yy+20,w-6,4,'#8b7a60');
    }
  };
  shelf(64,80,192,144);shelf(96,384,64,160);shelf(800,384,64,160);
  // Rear workspace: static robot, conveyor and five labelled sorting spaces.
  r(512,80,384,144,'#acc0ac');r(520,88,368,3,'#537f70');
  pixelLabel(ctx,text.robot,704,94,14,'#294c49');pixelLabel(ctx,text.inactive,704,113,9,'#46665e');
  r(536,128,48,48,'#4e7273');r(541,132,38,27,'#b7c9c0');r(548,139,8,5,'#456b6b');r(565,139,8,5,'#456b6b');
  for(let i=0;i<2;i++){r(542+i*24,116,14,12,'#294e4b');r(545+i*24,118,8,7,'#71d096');}
  r(592,144,280,16,'#526867');for(let x=596;x<872;x+=16)r(x,146,3,12,'#8ba59b');
  for(const x of [616,680,744]){r(x,132,18,12,'#e4c58e');r(x+2,135,14,4,'#f3efd5');}
  for(let i=0;i<5;i++){
    const x=592+i*56;r(x,177,48,34,'#4c7871');r(x+3,180,42,5,'#b1c7b0');
    pixelLabel(ctx,i===4?'ASK':String(i+1),x+24,191,10,'#f5e8bf');
  }
  pixelLabel(ctx,text.ask,816,214,8,'#294c49');
  r(296,88,160,64,'#7e9b8c');pixelLabel(ctx,text.dispensing,376,96,11,'#f4ebcd');
  // Pharmacist behind the counter, in an upright white coat.
  r(342,200,20,20,'#bd8968');r(340,197,24,8,'#4b3c39');r(336,220,32,32,'#f1efda');r(350,223,3,25,'#7c9c96');r(357,226,6,5,'#58a57a');
  r(32,256,896,48,'#326d68');r(32,256,896,10,'#dfd7b7');r(40,270,880,4,'#528d7a');
  // Mark the exact public interaction rectangle without adding a solid barrier.
  const z=robotZone;
  for(let x=z.x;x<z.x+z.width;x+=8){const colour=(x-z.x)%16?'#293e44':'#e5c764';r(x,z.y,8,4,colour);r(x,z.y+z.height-4,8,4,colour);}
  for(let y=z.y;y<z.y+z.height;y+=8){const colour=(y-z.y)%16?'#293e44':'#e5c764';r(z.x,y,4,8,colour);r(z.x+z.width-4,y,4,8,colour);}
  r(392,243,32,13,'#354e51');r(397,230,22,15,'#4a6769');r(400,232,16,10,'#9cbfae');
  // Public waiting chairs and consultation door are separate from dispensing.
  pixelLabel(ctx,text.waiting,680,566,11,'#365951');
  for(let x=608;x<752;x+=48){r(x,592,40,32,'#416d68');r(x+3,595,34,12,'#72a797');r(x+4,620,4,8,'#3b5050');r(x+32,620,4,8,'#3b5050');}
  r(32,592,24,96,'#8f775b');r(35,598,18,80,'#b3bb9c');r(48,636,3,3,'#f1d28b');
  pixelLabel(ctx,text.consultation,122,654,10,'#365951');
  r(448,704,64,32,'#769c86');r(452,708,56,24,'#b5c6ae');pixelLabel(ctx,'EXIT',480,712,12,'#294e4b');
}

export function drawPharmacy(scene){
  const key='willow-pharmacy-interior';
  if(!scene.textures.exists(key)){
    const texture=scene.textures.createCanvas(key,PHARMACY.width,PHARMACY.height),ctx=texture.getContext();
    ctx.imageSmoothingEnabled=false;paintPharmacy(ctx);texture.refresh();
  }
  scene.add.image(0,0,key).setOrigin(0);
}
