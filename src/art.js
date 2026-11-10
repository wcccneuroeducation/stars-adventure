import { drawPixelEnvironment } from './pixel/environment.js';

// Original temporary player graphics are intentionally preserved.
export function createTextures(scene){
 const g=scene.make.graphics({x:0,y:0,add:false});
 g.fillStyle(0x263d48).fillRect(7,24,6,7).fillRect(19,24,6,7);
 g.fillStyle(0xd99a64).fillRect(9,5,14,12).fillRect(5,18,4,8).fillRect(23,18,4,8);
 g.fillStyle(0x433c3b).fillRect(8,2,16,7).fillRect(7,7,4,6);
 g.fillStyle(0xefc87d).fillRect(9,16,14,10);g.fillStyle(0xf6de9a).fillRect(10,16,5,9);
 g.generateTexture('player',32,32);g.destroy();
}

export const drawStreet = drawPixelEnvironment;
