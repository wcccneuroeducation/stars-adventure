export const TILE=32;
export const WORLD={width:64*TILE,height:32*TILE,spawn:{x:960,y:480}};
export const houses=[4,9,14,19,24,29,34].flatMap(x=>[5,22].map(y=>({x:x*TILE,y:y*TILE,width:160,height:192})));
// Home is the leftmost upper-row terrace at (128,160); door/path centre is x+80.
// Place the sprite just below the doorway, on the open front garden path.
// Its foot body (y=372..384) is clear of the house, which ends at y=352.
export const STREET_ENTRIES = {
  home: { x: houses[0].x+80, y: houses[0].y+houses[0].height+16, facing: 'down' }
};
export const shop={x:1344,y:160,width:288,height:192};
export const shopZone={x:1408,y:352,width:192,height:80};
// Existing open gate between the lower wall runs; no change to solid geometry.
export const parkZone={x:1696,y:608,width:64,height:112};
// Whole-building and wall-run rectangles, independent of visual tiles.
export const obstacles=[...houses,shop,
 // Leave the home frontage (x=128..288) open; retain the neighbours' wall.
 {x:288,y:384,width:928,height:16},{x:128,y:656,width:1120,height:16},
 {x:1312,y:656,width:384,height:16},{x:1760,y:656,width:160,height:16},
 {x:1248,y:400,width:64,height:32},{x:1696,y:384,width:96,height:48},
 {x:1856,y:416,width:24,height:24},{x:1792,y:736,width:32,height:32},
 {x:1920,y:864,width:32,height:32}];
