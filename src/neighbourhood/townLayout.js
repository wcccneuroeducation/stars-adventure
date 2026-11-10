// Environment-only expansion. All existing world coordinates stay unchanged.
export const TOWN={x:2816,y:0,width:1536,height:2176};
export const townShops=[
  {id:'post-office',name:'POST OFFICE',x:2880,y:160,width:256,height:192,colour:'#ad4e47',doorX:3072,entry:{x:3088,y:368}},
  {id:'fish-chips',name:'FISH & CHIPS',x:3200,y:160,width:256,height:192,colour:'#326c80',doorX:3392,entry:{x:3408,y:368}},
  {id:'supermarket',name:'SUPERMARKET',x:3520,y:160,width:384,height:192,colour:'#396e55',doorX:3840,entry:{x:3856,y:368}},
  {id:'fruit-veg',name:'FRUIT & VEG',x:3936,y:160,width:320,height:192,colour:'#735d8a',doorX:4192,entry:{x:4208,y:368}}
].map(shop=>({...shop,zone:{x:shop.entry.x-32,y:352,width:64,height:64},futureScene:null}));
export const SCHOOL_ROAD={x:3552,y:608,width:160,height:800};
export const school={x:3808,y:1472,width:480,height:256,
  entrance:{x:4048,y:1744},zone:{x:4000,y:1728,width:96,height:80},
  returnSpawn:{x:4048,y:1824,facing:'down'},futureScene:'School'};
export const campus={x:3328,y:1408,width:992,height:704};
export const schoolHouses=[832,1120].flatMap((y,i)=>[
  {x:3296,y,width:128,height:160,side:'west',variant:i,number:i*2+1},
  {x:3840,y,width:128,height:160,side:'east',variant:i+2,number:i*2+2}
]);
export const townWalls=schoolHouses.flatMap(h=>[
  {x:h.side==='west'?3472:3776,y:h.y-16,width:16,height:144},
  {x:h.side==='west'?3472:3776,y:h.y+176,width:16,height:32},
  {x:h.x,y:h.y+208,width:128,height:16}
]);
export const schoolFences=[
  {x:3328,y:1408,width:176,height:12},{x:3760,y:1408,width:560,height:12},
  {x:3488,y:1408,width:16,height:24},{x:3760,y:1408,width:16,height:24},
  {x:3328,y:1408,width:12,height:704},{x:4308,y:1408,width:12,height:704},
  {x:3328,y:2100,width:992,height:12}
];
export const townProps=[
  {kind:'signPole',x:3478,y:384,width:4,height:16},
  {kind:'signPole',x:3478,y:672,width:4,height:16},
  {kind:'signPole',x:3388,y:706,width:4,height:16},
  {kind:'signPole',x:3468,y:1390,width:4,height:16},
  {kind:'signPole',x:3784,y:1390,width:4,height:16},
  {kind:'postbox',x:3144,y:360,width:20,height:32},
  {kind:'bike',x:3192,y:368,width:48,height:16},
  {kind:'lamp',x:3472,y:368,width:16,height:16},
  {kind:'bin',x:3472,y:384,width:16,height:24},
  {kind:'trolleys',x:3728,y:360,width:64,height:24},
  {kind:'produce',x:3952,y:360,width:160,height:24},
  {kind:'bench',x:2928,y:704,width:64,height:32},
  {kind:'planter',x:3104,y:704,width:96,height:48},
  {kind:'tree',x:3360,y:744,width:32,height:32},
  {kind:'lamp',x:3472,y:1008,width:16,height:16},
  {kind:'lamp',x:3776,y:1248,width:16,height:16},
  {kind:'car',x:4000,y:1008,width:48,height:80},
  {kind:'tree',x:4224,y:1248,width:32,height:32},
  {kind:'tree',x:3392,y:1856,width:32,height:32},
  {kind:'tree',x:4160,y:1984,width:32,height:32},
  {kind:'bench',x:3456,y:1984,width:64,height:32},
  {kind:'bench',x:3872,y:2016,width:64,height:32}
];
export const townSolids=[...townShops,school,...schoolHouses,...townWalls,...schoolFences,...townProps,
  {x:2816,y:-1152,width:1536,height:1152},
  {x:0,y:1024,width:2816,height:1152}
];
export const townText={school:'School',schoolPrompt:'[ E ] SCHOOL ENTRANCE',schoolSoon:'School Day Survival — Coming Soon!',close:'Keep exploring'};
