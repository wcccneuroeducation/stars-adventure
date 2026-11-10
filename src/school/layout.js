export const SCHOOL={width:1600,height:2176,spawn:{x:800,y:2048},exit:{x:752,y:2096,width:96,height:48}};
export const schoolRooms=[
  {id:'science',label:'SCIENCE',x:64,y:544,width:640,height:320,side:'left',floor:'#c7d6ca'},
  {id:'library',label:'LIBRARY',x:896,y:544,width:640,height:320,side:'right',floor:'#cbbd99'},
  {id:'classroom-1',label:'CLASSROOM 1',x:64,y:896,width:640,height:320,side:'left',floor:'#d8c59e'},
  {id:'classroom-2',label:'CLASSROOM 2',x:896,y:896,width:640,height:320,side:'right',floor:'#c8d1bd'},
  {id:'canteen',label:'CANTEEN',x:64,y:1248,width:640,height:320,side:'left',floor:'#e0d2ae'},
  {id:'sports',label:'SPORTS HALL',x:896,y:1248,width:640,height:672,side:'right',floor:'#bd945f'},
  {id:'office',label:'OFFICE / SUPPORT',x:64,y:1600,width:640,height:160,side:'left',floor:'#c9c8b3'},
  {id:'toilets',label:'TOILETS',x:64,y:1760,width:640,height:160,side:'left',floor:'#c2d9d2'}
].map(room=>{
  const doorY=room.y+(room.height===160?64:208);
  return {...room,door:{x:room.side==='left'?room.x+room.width-16:room.x,y:doorY,width:16,height:64},
    entry:{x:room.side==='left'?room.x+room.width-32:room.x+32,y:doorY+24}};
});
export const schoolWalls=[
  {x:32,y:512,width:16,height:1648},{x:1552,y:512,width:16,height:1648},
  {x:32,y:512,width:720,height:16},{x:848,y:512,width:720,height:16},
  {x:32,y:2144,width:1536,height:16},
  ...schoolRooms.flatMap(r=>{
    const doorSide=r.side==='left'?r.x+r.width-16:r.x,solidSide=r.side==='left'?r.x:r.x+r.width-16;
    return [{x:r.x,y:r.y,width:r.width,height:16},{x:r.x,y:r.y+r.height-16,width:r.width,height:16},
      {x:solidSide,y:r.y,width:16,height:r.height},
      {x:doorSide,y:r.y,width:16,height:r.door.y-r.y},
      {x:doorSide,y:r.door.y+64,width:16,height:r.y+r.height-r.door.y-64}];
  }),
  {x:32,y:32,width:1536,height:12},{x:32,y:32,width:12,height:480},{x:1556,y:32,width:12,height:480}
];
export const schoolFurniture=[];
const prop=(room,kind,x,y,width,height,extra={})=>schoolFurniture.push({id:`${room}-${schoolFurniture.length}`,room,kind,x,y,width,height,...extra});
for(const room of schoolRooms){
  const {id,x,y}=room;
  if(id.startsWith('classroom')){
    prop(id,'teacher-desk',x+48,y+48,80,40);
    prop(id,'books',x+480,y+32,96,40);
    for(const dx of [64,160,256,352,448,544])for(const dy of [112,192])prop(id,'student-desk',x+dx,y+dy,48,48);
  }
  if(id==='science'){
    for(const dx of [64,320])for(const dy of [96,176])prop(id,'lab',x+dx,y+dy,160,56);
    prop(id,'sink',x+480,y+32,96,40);prop(id,'cabinet',x+32,y+32,112,40);
  }
  if(id==='library'){
    for(const dx of [48,144,240])prop(id,'books',x+dx,y+56,48,144);
    prop(id,'reading-table',x+336,y+104,112,88);
    prop(id,'computer',x+464,y+40,112,40);prop(id,'sofa',x+464,y+216,112,48);
  }
  if(id==='canteen'){
    prop(id,'serving',x+48,y+40,384,48);prop(id,'drinks',x+480,y+40,96,48);
    for(const dx of [80,288])for(const dy of [128,224])prop(id,'dining',x+dx,y+dy,128,56);
    prop(id,'bin',x+560,y+264,24,24);
  }
  if(id==='sports'){
    prop(id,'cabinet',x+448,y+32,128,64);
    prop(id,'bench',x+48,y+576,160,32);prop(id,'bench',x+352,y+576,160,32);
  }
  if(id==='office'){
    prop(id,'computer',x+64,y+48,112,40);prop(id,'sofa',x+256,y+48,128,48);prop(id,'cabinet',x+480,y+32,96,48);
  }
  if(id==='toilets'){
    for(const dx of [32,128,224])prop(id,'cubicle',x+dx,y+32,80,72);
    prop(id,'sink',x+448,y+32,128,40);
  }
}
// Hallway edges stay clear of the 96px door openings to rooms/courtyard.
for(const y of [544,896,1248])prop('corridor','locker',720,y,32,96);
prop('corridor','locker',720,1736,32,64);
prop('corridor','bench',832,736,48,32);prop('corridor','bench',832,1088,48,32);
for(const y of [816,1168,1520])prop('corridor','noticeboard',832,y,48,32);
prop('corridor','clock',848,1920,32,32);
prop('reception','reception',1088,1984,256,64);prop('reception','sofa',224,2000,224,48);
prop('courtyard','bench',224,128,160,32);prop('courtyard','bench',1152,416,160,32);
prop('courtyard','tree',128,304,32,32);prop('courtyard','tree',1440,160,32,32);
prop('courtyard','planter',1056,64,288,48);
for(const x of [128,416])prop('courtyard','canopy-post',x,64,12,96);
export const schoolSolids=[...schoolWalls,...schoolFurniture];
export const schoolPoints={
  entrance:SCHOOL.spawn,exit:SCHOOL.exit,reception:{x:1056,y:2048},corridor:{x:800,y:1904},courtyard:{x:800,y:352},
  ...Object.fromEntries(schoolRooms.map(room=>[room.id,room.entry]))
};
export function schoolLocation(x,y){
  if(y<512)return 'courtyard';
  if(y>=1952)return 'reception';
  return schoolRooms.find(r=>x>=r.x&&x<r.x+r.width&&y>=r.y&&y<r.y+r.height)?.id??'corridor';
}
