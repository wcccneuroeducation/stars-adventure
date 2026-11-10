import { WILLOW } from '../neighbourhood/willowLayout.js';
import { SCHOOL_ROAD } from '../neighbourhood/townLayout.js';
// Existing asphalt: Birmingham y448..608, Willow x2304..2464, School x3552..3712.
export const roadLanes={eastY:488,westY:568,willowNorthX:WILLOW.road.x+40,willowSouthX:WILLOW.road.x+120,schoolNorthX:SCHOOL_ROAD.x+40,schoolSouthX:SCHOOL_ROAD.x+120};
export const busStop={id:'birmingham-h1',shelter:{x:1696,y:384,width:96,height:48},
  position:{x:1744,y:476},zone:{x:1696,y:432,width:144,height:16},
  route:'H1',destination:'HOSPITAL',dwellSeconds:4,intervalSeconds:65,futureScene:null};
export const crossing={x:3496,y:448,width:48,height:160,approach:48,sideMargin:20};
export const junctions=[{id:'willow',x:2264,y:416,width:240,height:216},{id:'school',x:3504,y:440,width:256,height:232}];
const arc=(cx,cy,r,a,b)=>Array.from({length:9},(_,i)=>({x:cx+r*Math.cos(a+(b-a)*i/8),y:cy+r*Math.sin(a+(b-a)*i/8)}));
export function makeRoute(points){
  const segments=[];let length=0;
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],size=Math.hypot(b.x-a.x,b.y-a.y);if(size<.001)continue;segments.push({a,b,start:length,length:size,angle:Math.atan2(b.y-a.y,b.x-a.x)});length+=size;}
  return {points,segments,length,point(distance){
    const d=Math.max(0,Math.min(length,distance)),s=segments.find(s=>d<=s.start+s.length)||segments.at(-1),t=(d-s.start)/s.length;
    return {x:s.a.x+(s.b.x-s.a.x)*t,y:s.a.y+(s.b.y-s.a.y)*t,angle:s.angle};
  }};
}
const P=(x,y)=>({x,y}),l=roadLanes;
export const trafficRoutes={
  east:makeRoute([P(-160,l.eastY),P(4512,l.eastY)]),
  west:makeRoute([P(4512,l.westY),P(-160,l.westY)]),
  willow:makeRoute([P(-160,l.eastY),...arc(l.willowNorthX-32,l.eastY-32,32,Math.PI/2,0),P(l.willowNorthX,-960),...arc(2384,-960,40,Math.PI,2*Math.PI),P(l.willowSouthX,536),...arc(l.willowSouthX-32,536,32,0,Math.PI/2),P(-160,l.westY)]),
  school:makeRoute([P(-160,l.eastY),...arc(l.schoolSouthX-32,l.eastY+32,32,-Math.PI/2,0),P(l.schoolSouthX,1320),...arc(3632,1320,40,0,Math.PI),P(l.schoolNorthX,600),...arc(l.schoolNorthX-32,600,32,0,-Math.PI/2),P(-160,l.westY)]),
  bus:makeRoute([P(-160,busStop.position.y),P(4512,busStop.position.y)])
};
export const trafficSettings={step:1/60,speed:88,busSpeed:100,braking:150,acceleration:55,gap:22,junctionSpeed:46,carRespawnSeconds:6};
export const trafficText={title:'BUS STOP',route:'Route H1 — Hospital',message:'Hospital service — Coming Soon!',prompt:'[ E ] BUS TIMETABLE',close:'Keep exploring'};
