// Native-resolution pixel art. No smoothing, randomness, or external assets.
export const PALETTE = {
  grass: '#78a253', grassLight: '#91b65e', grassDark: '#608b47',
  paving: '#c6c3ab', pavingLight: '#dbd5bc', pavingDark: '#a5ab98',
  road: '#58646c', roadLight: '#637079', roadDark: '#4d5961',
  brick: '#b9684d', brickLight: '#d1845c', brickDark: '#8b493e', mortar: '#975b48',
  slate: '#48546a', slateLight: '#63718a', slateDark: '#344254',
  cream: '#eddbad', ink: '#293e44', teal: '#326d68', wood: '#946342'
};
export function pixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}
export function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  canvas.getContext('2d').imageSmoothingEnabled = false;
  return canvas;
}

// Every entry is exactly one 32 × 32 tile. Variants use stable integer seeds.
export function createTileSet() {
  const tiles = new Map();
  const p = PALETTE;
  const noise = (seed, salt) => {
    let value = Math.imul(seed + salt * 31 + 1, 0x45d9f3b);
    value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
    return (value ^ (value >>> 16)) >>> 0;
  };
  const add = (key, paint) => {
    const canvas = makeCanvas(32, 32), ctx = canvas.getContext('2d');
    const r = (x,y,w,h,c) => pixelRect(ctx,x,y,w,h,c);
    paint(r,ctx); tiles.set(key,canvas);
  };
  for (let variant=0; variant<4; variant++) {
    add(`grass${variant}`, r => {
      r(0,0,32,32,p.grass);
      for(let i=0;i<14;i++) {
        const x=noise(i,variant+1)%30, y=noise(i,variant+9)%30;
        r(x,y,2,1,i%3?p.grassLight:p.grassDark);
        if(i%4===0) r(x+1,y-1,1,1,p.grassLight);
      }
    });
    add(`road${variant}`, r => {
      r(0,0,32,32,p.road);
      for(let i=0;i<20;i++)r(noise(i,variant+3)%32,noise(i,variant+17)%32,1,1,i%2?p.roadLight:p.roadDark);
    });
  }
  add('pavement', r => {
    r(0,0,32,32,p.pavingDark);
    for(const [x,y] of [[0,0],[16,0],[0,16],[16,16]]){
      r(x+1,y+1,15,15,p.paving);r(x+1,y+1,15,1,p.pavingLight);r(x+1,y+1,1,15,p.pavingLight);
    }
    r(7,7,2,1,'#b6b8a1');r(23,25,3,1,'#b6b8a1');
  });
  for(const side of ['north','south']) add(`kerb-${side}`, r => {
    const y=side==='north'?27:0;
    r(0,y,32,5,p.pavingDark);r(0,y,31,2,p.pavingLight);r(31,y,1,5,'#7e8e82');
  });
  add('road-marking', r => {r(0,14,32,4,'#e5dcb3');r(0,18,32,1,'#b2b5a1');});
  add('path', r => {
    r(0,0,32,32,'#ad9d79');
    for(let y=0;y<32;y+=8)for(let x=0;x<32;x+=16){r(x+1,y+1,14,6,'#c9b58d');r(x+1,y+1,14,1,'#dfca9d');}
  });
  add('gravel', r => {
    r(0,0,32,32,'#c5b98f');
    for(let i=0;i<38;i++)r(noise(i,5)%31,noise(i,29)%32,2,1,i%2?'#e0cea1':'#a89f7d');
  });
  add('brick', r => {
    r(0,0,32,32,p.mortar);
    for(let y=0;y<32;y+=8)for(let x=-16;x<32;x+=16){const xx=x+(y%16?8:0);r(xx+1,y+1,15,6,p.brick);r(xx+2,y+1,13,1,p.brickLight);r(xx+2,y+6,13,1,p.brickDark);}
  });
  add('wall', r => {
    r(0,0,32,16,p.brickDark);r(0,0,32,3,'#e0b180');r(0,3,32,2,'#b77d59');
    for(let y=5;y<16;y+=5)for(let x=-16;x<32;x+=16){const xx=x+(y%2?8:0);r(xx+1,y,15,4,p.brick);r(xx+2,y,13,1,p.brickLight);}
  });
  add('slate', r => {
    r(0,0,32,32,p.slateDark);
    for(let y=0;y<32;y+=8)for(let x=-16;x<32;x+=16){const xx=x+(y%16?8:0);r(xx+1,y+1,15,6,p.slate);r(xx+1,y+1,15,1,p.slateLight);}
  });
  return tiles;
}

// Supports partial tiles (e.g. 16px wall height) without stretching pixels.
export function tileArea(ctx, tiles, key, x, y, width, height) {
  const tile=tiles.get(key);
  if(!tile) throw new Error(`Unknown terrain tile: ${key}`);
  for(let dy=0;dy<height;dy+=32)for(let dx=0;dx<width;dx+=32){
    const w=Math.min(32,width-dx),h=Math.min(32,height-dy);
    ctx.drawImage(tile,0,0,w,h,x+dx,y+dy,w,h);
  }
}
