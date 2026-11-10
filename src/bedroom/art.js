import { PALETTE as p, pixelRect } from '../pixel/tiles.js';
import { ROOM } from './layout.js';

function canvasTexture(scene, key, width, height, paint) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const texture = scene.textures.createCanvas(key, width, height);
  const ctx = texture.getContext(); ctx.imageSmoothingEnabled = false;
  paint((x,y,w,h,color) => pixelRect(ctx,x,y,w,h,color));
  texture.refresh();
  return key;
}

export function drawBedroom(scene) {
  const key = canvasTexture(scene, 'bedroom-background', ROOM.width, ROOM.height, r => {
    r(0,0,960,540,'#263d46');r(112,56,736,440,'#1d303b');
    // Timber floor uses the same 32px grid and warm palette as the street.
    r(128,96,704,352,'#b68455');
    for(let y=96;y<448;y+=32)for(let x=128;x<832;x+=32){
      r(x+1,y+1,31,31,((x+y)/32)%3?'#c39765':'#cba16e');
      r(x+2,y+2,30,1,'#ddb37d');r(x+6,y+13,13,1,'#b58a59');r(x+16,y+25,12,1,'#b98b59');
    }
    // Wall faces and skirting; door gap keeps a clear visual exit.
    r(112,48,736,48,'#759c91');r(112,48,736,6,'#a7c1a4');
    for(let x=120;x<848;x+=16)r(x,56,2,32,'#81a99a');
    r(112,88,736,8,p.cream);r(112,96,16,368,'#5b8079');r(832,96,16,368,'#5b8079');
    r(128,448,576,16,p.cream);r(768,448,64,16,p.cream);
    r(704,448,64,32,'#70503e');r(704,448,64,4,'#edd3a0');
    for(let x=708;x<768;x+=12)r(x,455,8,21,'#a2764e');
    r(700,440,4,40,'#e5cca0');r(768,440,4,40,'#e5cca0');
    // Clear sky, rooftops and sun behind an upright sash window.
    r(436,49,88,47,'#395e64');r(440,51,80,42,p.cream);r(445,54,70,35,'#8fc9d2');
    if(scene.state.adventure==='pharmacyPanic')r(445,54,70,35,'#c2d3db');
    else {r(487,57,14,14,'#ffe09a');r(484,60,20,8,'#ffe09a');}
    r(445,83,70,6,'#8fac72');r(449,80,20,6,p.slate);r(504,79,11,7,p.brick);
    r(478,54,3,35,p.cream);r(445,71,70,3,p.cream);r(435,91,90,5,'#ead5aa');
    r(425,48,10,48,'#c58064');r(525,48,10,48,'#c58064');
    for(let x=427;x<535;x+=100)r(x,51,2,41,'#e3a780');
    // Stepped, translucent-looking sunshine is floor artwork, not a mechanic.
    r(445,96,70,16,'#dec48b');r(449,112,74,16,'#dec48b');r(453,128,78,16,'#dec48b');
    r(457,144,82,16,'#dec48b');r(481,96,3,16,'#c39f6b');r(489,128,3,32,'#c39f6b');
    // Bed, pillow and folded blanket, within the bed's collision rectangle.
    r(160,128,112,128,'#664f40');r(164,131,104,119,p.cream);
    r(168,136,96,104,'#8aa5a0');r(174,140,84,26,'#f6e8c4');r(178,144,76,3,'#fff2d3');
    r(168,174,96,66,'#4d7f87');r(168,174,96,8,'#7cabb0');
    for(let y=190;y<240;y+=16){r(174,y,84,2,'#64959c');for(let x=178;x<260;x+=16)r(x,y+5,5,5,'#91b5ad');}
    r(160,128,112,7,'#af8455');r(160,248,112,8,'#946342');r(164,248,104,2,'#d1a36c');
    // Bedside table and phone.
    furniture(304,176,64,64);r(318,184,17,29,p.ink);r(320,187,13,20,'#8fc3b5');r(324,211,5,1,'#e4c98d');
    // Wardrobe: panelled wood and brass handles.
    furniture(688,112,112,96);
    for(const x of [696,746]){r(x,122,46,77,'#906342');r(x+3,125,40,69,'#ae8152');r(x+5,128,36,2,'#c89d64');}
    r(735,156,3,11,'#f3cf78');r(750,156,3,11,'#f3cf78');
    // Dresser and desk/backpack rest exactly on their collision footprints.
    furniture(144,288,80,64);
    for(const y of [314,332]){r(150,y,68,2,'#7b583e');r(179,y+5,9,2,'#eacb87');}
    furniture(544,192,80,48);r(549,223,70,3,'#805b41');
    // A woven rug and small wall details add colour without new obstacles.
    r(352,304,256,112,'#af7259');r(356,308,248,104,'#e3bc7e');r(362,314,236,92,'#4d7d78');
    r(368,320,224,80,'#73a293');
    for(let x=376;x<592;x+=24){r(x,326,10,4,'#d6cf9c');r(x,390,10,4,'#d6cf9c');}
    r(392,342,176,36,'#65998a');r(400,350,160,20,'#82ad96');
    r(190,58,38,28,p.wood);r(193,61,32,22,p.cream);r(196,64,26,16,'#6e9e93');r(203,66,9,9,'#e5b86e');
    r(576,57,46,25,p.wood);r(579,60,40,19,'#d2c99c');r(585,65,26,3,'#70978d');r(591,71,16,3,'#9d7756');
    function furniture(x,y,w,h){
      r(x,y,w,h,'#70503c');r(x+3,y+4,w-6,h-7,'#ba8957');r(x+3,y+4,w-6,4,'#dcaf72');r(x+3,y+h-6,w-6,3,'#946342');
    }
  });
  scene.add.image(0,0,key).setOrigin(0);
  const waterKey=canvasTexture(scene,'bedroom-water',20,32,r=>{
    r(6,1,8,5,'#4a7d83');r(4,6,12,23,'#529eaf');r(6,7,8,21,'#9ed6d1');r(4,15,12,9,p.cream);r(7,9,2,6,'#d3eee0');r(6,29,8,2,'#3c7181');
  });
  const hatKey=canvasTexture(scene,'bedroom-hat',36,24,r=>{
    r(1,14,34,7,'#bf9153');r(4,11,28,10,'#efcf87');r(9,3,18,15,'#e6bc72');r(12,2,12,2,'#f7dc98');r(9,12,18,4,'#8b6748');r(4,20,28,2,'#a97c49');
  });
  const bagKey=canvasTexture(scene,'bedroom-backpack',32,38,r=>{
    r(10,0,12,6,p.ink);r(13,2,6,4,'#ac8054');r(2,9,28,27,'#355e66');r(5,5,22,31,'#52888a');r(7,8,18,3,'#79aba4');r(7,23,18,11,'#32666c');r(9,24,14,2,'#e0bd7b');r(2,13,3,16,'#c39861');r(27,13,3,16,'#c39861');
  });
  return {
    water:scene.add.image(349,205,waterKey),
    hat:scene.add.image(184,302,hatKey),
    backpack:scene.add.image(584,205,bagKey)
  };
}
