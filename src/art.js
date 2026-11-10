import{WORLD,houses,shop,obstacles}from './world.js';
// Future PNGs can replace these drawing functions without changing collision data.
export function createTextures(scene){
 const g=scene.make.graphics({x:0,y:0,add:false});
 g.fillStyle(0x263d48).fillRect(7,24,6,7).fillRect(19,24,6,7);
 g.fillStyle(0xd99a64).fillRect(9,5,14,12).fillRect(5,18,4,8).fillRect(23,18,4,8);
 g.fillStyle(0x433c3b).fillRect(8,2,16,7).fillRect(7,7,4,6);
 g.fillStyle(0xefc87d).fillRect(9,16,14,10);g.fillStyle(0xf6de9a).fillRect(10,16,5,9);
 g.generateTexture('player',32,32);g.destroy();
}
export function drawStreet(scene){
 const g=scene.add.graphics();
 const r=(x,y,w,h,c)=>{g.fillStyle(c).fillRect(x,y,w,h);};
 const label=(x,y,text,size=12,color='#f5e6bb')=>scene.add.text(x,y,text,{fontFamily:'monospace',fontSize:size,color,fontStyle:'bold'}).setOrigin(.5);
 r(0,0,WORLD.width,WORLD.height,0x7f9870);
 for(let y=0;y<WORLD.height;y+=32)for(let x=0;x<WORLD.width;x+=32)if((x/32*7+y/32*13)%9<3)r(x+8,y+12,3,3,0x8fa67d);
 r(0,416,WORLD.width,224,0x959b89);
 for(let x=0;x<WORLD.width;x+=32){r(x,416,31,31,0xbac0ab);r(x,608,31,31,0xbac0ab);}
 r(0,448,WORLD.width,160,0x58666a);r(0,448,WORLD.width,4,0xd5c9a0);r(0,604,WORLD.width,4,0xd5c9a0);
 for(let x=0;x<WORLD.width;x+=96)r(x+16,526,48,4,0xd9d8bd);
 for(const h of houses){
  r(h.x,h.y===160?352:672,160,32,0x9ba27e);r(h.x+64,h.y===160?352:672,32,32,0xc1b99c);
  r(h.x+5,h.y+7,160,192,0x5c715e);r(h.x,h.y,160,192,0x9f5948);
  for(let y=h.y+8;y<h.y+192;y+=12){r(h.x,y,160,1,0xb7745a);for(let x=h.x+((y/12|0)%2)*12;x<h.x+160;x+=24)r(x,y-11,1,11,0xb7745a);}
  r(h.x-3,h.y-4,166,62,0x4b5256);for(let y=h.y;y<h.y+52;y+=12)r(h.x,y,160,2,0x606667);
  r(h.x+18,h.y-12,18,30,0x854d40);r(h.x+16,h.y-12,22,5,0xc09472);
  for(const dx of[20,105])for(const dy of[79,126]){r(h.x+dx-3,h.y+dy-3,30,33,0xd8c6a0);r(h.x+dx,h.y+dy,24,26,0x45656a);r(h.x+dx+11,h.y+dy,2,26,0xaac4bd);r(h.x+dx,h.y+dy+12,24,2,0xaac4bd);}
  r(h.x+66,h.y+135,28,57,0x344f50);r(h.x+70,h.y+140,20,16,0x91aaa0);r(h.x+86,h.y+171,3,3,0xe5bd76);
 }
 r(shop.x+6,168,288,192,0x5c715e);r(shop.x,160,288,192,0xb77759);r(shop.x-4,154,296,60,0x555d5b);
 r(shop.x+10,221,268,34,0x2d645e);label(shop.x+144,238,'CORNER SHOP',15);
 r(shop.x+16,268,160,64,0xe5d0a1);r(shop.x+21,273,150,54,0x6c9993);
 for(let x=shop.x+30;x<shop.x+170;x+=26){r(x,305,14,17,0xd8b66e);r(x+3,286,10,15,0x9ab28b);}
 r(shop.x+208,268,48,84,0x294e4b);r(shop.x+215,275,34,49,0x86aca1);
 for(let x=0;x<288;x+=24)r(shop.x+x,255,24,12,x%48?0xe8d7ac:0x528478);
 r(shop.x+208,352,48,64,0xc3b99d);
 for(const wall of obstacles.slice(15,19)){r(wall.x,wall.y,wall.width,16,0x995d4c);r(wall.x,wall.y,wall.width,4,0xc08b6c);for(let x=wall.x;x<wall.x+wall.width;x+=24)r(x,wall.y+5,1,11,0xbc8166);}
 r(1248,400,64,22,0x795944);r(1248,400,64,4,0xb58d61);r(1254,422,5,10,0x3d5150);r(1301,422,5,10,0x3d5150);
 r(1696,384,96,48,0x567b77);r(1702,390,84,30,0xa2bbb1);r(1692,380,104,8,0x354f50);r(1741,390,4,38,0x3c5e59);
 r(1811,371,5,60,0xe1d8b3);r(1800,362,27,25,0xc78162);label(1813,374,'BUS',9);r(1856,416,24,24,0x3c6257);r(1853,413,30,5,0x2e5049);
 r(1696,640,64,384,0xb9b499);r(1664,704,128,32,0xb9b499);r(1688,645,8,40,0xe1cc9c);r(1760,645,8,40,0xe1cc9c);label(1730,716,'SMALL HEATH PARK',10,'#2e5049');
 for(const[x,y]of[[1808,752],[1936,880],[96,96],[1856,192],[448,944],[1472,896]]){r(x-5,y,10,32,0x755d46);r(x-24,y-28,48,42,0x426e52);r(x-16,y-40,32,20,0x5a845e);r(x-20,y-20,12,12,0x668f61);}
 label(640,568,'B I R M I N G H A M   S T R E E T',11,'#bbc3b2');
}
