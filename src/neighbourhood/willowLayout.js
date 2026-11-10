// World-space, 32px-grid extension. Existing Birmingham Street stays at (0,0).
export const WILLOW={x:2048,y:-1152,width:768,height:2176,
  road:{x:2304,y:-1056,width:160,height:1504},
  westPavement:{x:2240,y:-1088,width:64,height:1728},
  eastPavement:{x:2464,y:-1088,width:64,height:1728}};
export const willowHouses=[-960,-704,-448,-192,64].flatMap((y,i)=>[
  {x:2080,y,width:128,height:160,side:'west',variant:i%4},
  {x:2560,y,width:128,height:160,side:'east',variant:(i+2)%4}
]);
// An ordinary vacant unit, reserved for a future destination; no interaction.
export const futureShopPlot=willowHouses[2];
export const willowWalls=willowHouses.flatMap(h=>{
  const x=h.side==='west'?2224:2528;
  // Open gate aligns with the side porch/path at y+160.
  return [{x,y:h.y-16,width:16,height:144},
    {x,y:h.y+176,width:16,height:32}];
});
export const willowProps=[-832,-320,192].flatMap(y=>[
  {x:2208,y,width:16,height:16,kind:'lamp'},
  {x:2544,y:y-32,width:16,height:24,kind:'bin'},
  {x:2720,y:y-32,width:24,height:24,kind:'tree'}
]);
export const willowFences=willowHouses.map(h=>({x:h.x,y:h.y+200,width:128,height:16}));
export const willowSolids=[...willowHouses,...willowWalls,...willowProps,...willowFences,
  // Keep the new north area outside the original street inaccessible.
  {x:0,y:-1152,width:2048,height:1152},
  {x:2048,y:-1152,width:768,height:32}];
