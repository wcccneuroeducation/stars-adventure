export const PARK = { width:1600, height:1536, spawn:{x:800,y:1392} };
export const parkPaths = [
  {x:736,y:1152,width:128,height:352}, {x:448,y:1088,width:416,height:128},
  {x:448,y:768,width:128,height:448}, {x:448,y:704,width:576,height:128},
  {x:896,y:480,width:128,height:352}, {x:896,y:480,width:448,height:128},
  {x:544,y:976,width:192,height:80}, {x:928,y:800,width:96,height:160},
  {x:928,y:864,width:416,height:96}, {x:1248,y:576,width:96,height:384},
  {x:1120,y:416,width:96,height:128}
];
export const seating = {x:608,y:944,width:96,height:32};
export const fountain = {x:832,y:704,width:32,height:48};
export const muga = {x:928,y:128,width:512,height:332};
export const friends = [
  {id:'jay',x:1088,y:528,shirt:'#b9684d',skin:'#bd845e',hair:'#3c3535'},
  {id:'friend1',x:1152,y:544,shirt:'#4b7a9b',skin:'#80543e',hair:'#2e3035'},
  {id:'friend2',x:1216,y:512,shirt:'#ac8854',skin:'#e1b187',hair:'#75523b'},
  {id:'friend3',x:1280,y:544,shirt:'#756292',skin:'#bb825c',hair:'#3a3330'}
];
export const flowerbeds = [
  {x:176,y:1136,width:160,height:80}, {x:1024,y:1152,width:192,height:64},
  {x:224,y:512,width:160,height:80}, {x:1104,y:704,width:96,height:96},
  {x:640,y:160,width:128,height:64}
];
const intersects = (a,b,margin=0) => a.x<b.x+b.width+margin&&a.x+a.width>b.x-margin&&a.y<b.y+b.height+margin&&a.y+a.height>b.y-margin;
const reserved = [...parkPaths,muga,...flowerbeds,{x:576,y:864,width:224,height:224}];
export const parkTrees = [];
for(let y=160;y<1408;y+=176)for(let x=128;x<1536;x+=192){
  const tree={x:x+((y/176|0)%2)*32,y};
  const area={x:tree.x-40,y:tree.y-48,width:80,height:100};
  if(!reserved.some(r=>intersects(area,r,16)))parkTrees.push(tree);
}
export const parkFences = [
  {x:32,y:32,width:1536,height:12},{x:32,y:32,width:12,height:1472},
  {x:1556,y:32,width:12,height:1472},
  {x:32,y:1492,width:704,height:12},{x:864,y:1492,width:704,height:12},
  {x:928,y:128,width:512,height:12},{x:928,y:128,width:12,height:332},
  {x:1428,y:128,width:12,height:332},
  {x:928,y:448,width:192,height:12},{x:1216,y:448,width:224,height:12}
];
export const parkSolids = [
  ...parkFences,seating,fountain,...flowerbeds,
  ...parkTrees.map(t=>({x:t.x-10,y:t.y+12,width:20,height:28})),
  ...friends.map(f=>({x:f.x-9,y:f.y+4,width:18,height:12})),
  // Pergola posts and goal frames are the other solid park fixtures.
  ...[[584,896],[776,896],[584,1056],[776,1056]].map(([x,y])=>({x,y,width:12,height:12})),
  {x:944,y:240,width:20,height:96},{x:1404,y:240,width:20,height:96}
];
export const parkObjects = [
  {id:'gate',zone:{x:736,y:1408,width:128,height:84}},
  {id:'bench',zone:{x:576,y:976,width:192,height:80}},
  {id:'fountain',zone:{x:800,y:752,width:96,height:80}},
  {id:'jay',zone:{x:1040,y:560,width:272,height:96}}
];
export function nearbyParkObject(x,y) {
  return parkObjects.find(({zone:z})=>x>=z.x&&x<z.x+z.width&&y>=z.y&&y<z.y+z.height);
}
