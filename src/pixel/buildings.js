import { PALETTE as p, pixelRect, makeCanvas, tileArea } from './tiles.js';

function painter(ctx) { return (x,y,w,h,c)=>pixelRect(ctx,x,y,w,h,c); }
function windowArt(r,x,y,w=26,h=30) {
  r(x-3,y-3,w+6,h+7,p.brickDark);r(x-2,y-2,w+4,3,p.cream);
  r(x,y,w,h,'#e4d9b3');r(x+3,y+3,w-6,h-6,'#42677b');
  r(x+4,y+4,w-8,3,'#81b1b8');r(x+4,y+7,3,h-12,'#6a949d');
  r(x+3,y+3,3,h-6,'#c5be9d');r(x+w-6,y+3,3,h-6,'#c5be9d');
  r(x+w/2-1,y+2,2,h-4,p.cream);r(x+2,y+12,w-4,2,p.cream);
  r(x-4,y+h, w+8,3,'#f1d8a7');r(x-3,y+h+3,w+6,2,p.brickDark);
}
function doorArt(r,x,y,color) {
  r(x-3,y-3,34,59,p.brickDark);r(x-2,y-4,32,3,p.cream);
  r(x,y,28,56,color);r(x+3,y+4,22,14,'#83a7a8');r(x+5,y+5,18,2,'#b6d3c6');
  r(x+4,y+24,8,23,'#213f48');r(x+16,y+24,8,23,'#213f48');
  r(x+5,y+25,6,20,color);r(x+17,y+25,6,20,color);
  r(x+21,y+29,3,3,'#f5cb71');r(x-4,y+54,36,2,'#ded1b0');
}

// Reusable 5 × 6 tile terrace module. Both street rows stay visually upright:
// roof at the top, facade below, with no rotation or vertical flipping.
export function makeTerrace(tiles, variant=0) {
  const canvas=makeCanvas(160,192),ctx=canvas.getContext('2d'),r=painter(ctx);
  const facadeY=64,roofY=0;
  tileArea(ctx,tiles,'brick',0,facadeY,160,128);
  r(0,facadeY,4,128,p.brickDark);r(156,facadeY,4,128,p.brickDark);
  r(5,facadeY+3,150,2,p.brickLight);r(0,facadeY+56,160,3,'#d1a074');
  for(const x of [20,108]) {windowArt(r,x,facadeY+12);windowArt(r,x,facadeY+75);}
  const doorColors=['#345e63','#764e4d','#526a49','#35516d'];
  const doorY=facadeY+72;
  doorArt(r,66,doorY,doorColors[variant%4]);
  // Slate pitch, ridge, lead flashing, gutter and terracotta chimney pots.
  tileArea(ctx,tiles,'slate',0,roofY,160,64);
  r(0,roofY,160,3,'#8992a0');r(0,roofY+3,160,2,p.slateDark);
  r(0,roofY+59,160,5,'#293e4c');r(1,roofY+59,158,1,'#7b8692');
  r(18,roofY+8,20,29,p.brickDark);r(19,roofY+8,17,25,p.brick);
  for(let y=roofY+11;y<roofY+32;y+=7)r(19,y,17,1,p.brickLight);
  r(15,roofY+7,26,4,'#d2b48d');r(20,roofY+1,5,7,'#c18360');r(31,roofY+1,5,7,'#c18360');
  r(20,roofY,5,2,'#71473c');r(31,roofY,5,2,'#71473c');
  r(5,facadeY+3,3,121,'#78634d');r(151,facadeY+3,3,121,'#78634d');
  return canvas;
}

export function drawShop(ctx,tiles,shop) {
  const r=painter(ctx),{x,y,width:w,height:h}=shop;
  tileArea(ctx,tiles,'brick',x,y,w,h);tileArea(ctx,tiles,'slate',x,y,w,56);
  r(x,y,w,3,'#83909d');r(x,y+53,w,5,p.ink);
  r(x+8,y+61,w-16,34,p.ink);r(x+10,y+63,w-20,28,p.teal);
  pixelLabel(ctx,'CORNER SHOP',x+w/2,y+70,16,p.cream);
  r(x+16,y+108,164,68,p.cream);r(x+20,y+112,156,60,'#527c89');
  r(x+23,y+115,150,9,'#8db8b6');r(x+25,y+126,148,2,'#7199a4');
  for(let row=0;row<2;row++)for(let i=0;i<6;i++){
    const xx=x+27+i*24,yy=y+137+row*22;
    r(xx,yy,15,14,['#d7a657','#abca75','#cf7959'][i%3]);r(xx+2,yy+1,11,2,'#efcf8d');r(xx-2,yy+14,20,3,p.wood);
  }
  r(x+92,y+112,3,60,p.cream);r(x+16,y+175,164,5,p.brickDark);
  doorArt(r,x+218,y+136,p.teal);r(x+214,y+108,36,28,p.cream);r(x+218,y+112,28,21,'#8eb4b1');
  for(let i=0;i<w;i+=16){r(x+i,y+95,16,13,i%32?p.cream:'#59967c');r(x+i,y+108,16,4,i%32?'#c9b68b':'#346f61');}
  r(x+4,y+112,4,80,p.brickDark);r(x+w-8,y+112,4,80,p.brickDark);
  pixelLabel(ctx,'LOCAL • FRESH • EVERYDAY',x+96,y+182,8,p.cream);
}

// Text is rasterised once at native resolution alongside the pixel artwork.
export function pixelLabel(ctx,text,x,y,size=10,color=p.cream) {
  ctx.fillStyle=color;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(text,x,y);
}
