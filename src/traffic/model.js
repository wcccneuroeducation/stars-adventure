import { trafficRoutes,junctions,crossing,busStop,trafficSettings as config } from './routes.js';
import { vehicleTypes } from './vehicles.js';
export function vehicleBounds(v,point=v.position,padding=0){
  const c=Math.abs(Math.cos(point.angle)),s=Math.abs(Math.sin(point.angle));
  const hx=c*v.length/2+s*v.width/2+padding,hy=s*v.length/2+c*v.width/2+padding;
  return {x:point.x-hx,y:point.y-hy,width:2*hx,height:2*hy};
}
export const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
export const playerBounds=p=>({x:p.x-16,y:p.y-18,width:32,height:36});
export function playerStepBlocked(vehicles,p,seconds=1/30){
  const current=playerBounds(p),next=playerBounds({x:p.x+p.vx*seconds,y:p.y+p.vy*seconds});
  return vehicles.some(v=>v.active&&!v.yielding&&!overlaps(current,vehicleBounds(v))&&overlaps(next,vehicleBounds(v,undefined,2)));
}
export function crossingInUse(p){
  const inside=p.x>=crossing.x-crossing.sideMargin&&p.x<=crossing.x+crossing.width+crossing.sideMargin;
  if(!inside)return false;
  const top=crossing.y,bottom=top+crossing.height;
  if(p.y>=top&&p.y<=bottom)return true;
  const waiting=Math.abs(p.vx)<10&&Math.abs(p.vy)<10;
  return (p.y>=top-crossing.approach&&p.y<top&&(p.vy>25||waiting))||
    (p.y>bottom&&p.y<=bottom+crossing.approach&&(p.vy< -25||waiting));
}
export class TrafficModel{
  constructor(){
    const create=(id,route,d,type,delay=0)=>({id,route:trafficRoutes[route],routeId:route,d,speed:0,length:vehicleTypes[type].length,width:vehicleTypes[type].width,type,delay,active:delay===0,braking:false,doorsOpen:false,dwell:0,served:false,position:trafficRoutes[route].point(d)});
    this.vehicles=[create('blue','east',810,'blue'),create('red','west',1212,'red'),create('grey','willow',1660,'grey'),create('van','school',3110,'van'),create('bus','bus',0,'bus',8)];
    this.locks=new Map();this.accumulator=0;this.crossingRequested=false;this.crossingEntered=false;this.crossingFinished=false;
  }
  update(delta,p,paused=false){
    if(paused){this.accumulator=0;return;}
    this.accumulator+=Math.min(Math.max(delta,0),100)/1000;
    while(this.accumulator>=config.step){this.step(config.step,p);this.accumulator-=config.step;}
  }
  step(dt,p){
    // Release reservations through scene-local model state, not scene timers.
    for(const [id,lock] of this.locks){
      const v=this.vehicles.find(v=>v.id===lock.owner),j=junctions.find(j=>j.id===id);
      if(!v.active){this.locks.delete(id);continue;}
      // Release beyond the larger lookahead padding, so the same junction
      // cannot be re-reserved just behind a departing vehicle.
      if(overlaps(vehicleBounds(v,undefined,12),j))lock.entered=true;
      else if(lock.entered)this.locks.delete(id);
    }
    const top=crossing.y,bottom=top+crossing.height,insideCrossing=p.y>=top&&p.y<=bottom;
    const leftApproach=p.x<crossing.x-crossing.sideMargin||p.x>crossing.x+crossing.width+crossing.sideMargin||p.y<top-crossing.approach||p.y>bottom+crossing.approach;
    if(leftApproach)this.crossingFinished=false;
    const towardsRoad=(p.y<top&&p.vy>25)||(p.y>bottom&&p.vy< -25);
    if(crossingInUse(p)&&(!this.crossingFinished||towardsRoad||insideCrossing)){this.crossingRequested=true;if(insideCrossing)this.crossingEntered=true;}
    const turnedAway=!insideCrossing&&!this.crossingEntered&&(Math.abs(p.vx)>25||(p.y<top&&p.vy< -25)||(p.y>bottom&&p.vy>25));
    const finished=this.crossingEntered&&(p.y<=top-18||p.y>=bottom+18);
    if(leftApproach||turnedAway||finished){this.crossingRequested=false;this.crossingEntered=false;if(finished)this.crossingFinished=true;}
    const pedestrian=playerBounds(p),crossingActive=this.crossingRequested;
    const predictions=[0,.2,.4,.6].map(t=>playerBounds({x:p.x+p.vx*t,y:p.y+p.vy*t}));
    for(const v of this.vehicles){
      if(!v.active){v.delay-=dt;if(v.delay<=0){
        const entry=v.route.point(0),bounds=vehicleBounds(v,entry,config.gap);
        if(!overlaps(bounds,pedestrian)&&!this.vehicles.some(o=>o!==v&&o.active&&overlaps(bounds,vehicleBounds(o)))){v.active=true;v.delay=0;v.d=0;v.position=entry;v.speed=0;v.served=false;}
      }continue;}
      v.yielding=overlaps(vehicleBounds(v),pedestrian); // Only spawn/teleport overlap; ordinary walking is guarded by the adapter.
      if(v.yielding){v.speed=0;v.braking=true;continue;}
      if(v.dwell>0){v.dwell=Math.max(0,v.dwell-dt);v.doorsOpen=v.dwell>.5&&v.dwell<3.6;v.speed=0;v.braking=true;continue;}
      v.doorsOpen=false;
      let clearance=280,maxSpeed=v.type==='bus'?config.busSpeed:config.speed;
      for(let ahead=0;ahead<=280;ahead+=8){
        const point=v.route.point(v.d+ahead),bounds=vehicleBounds(v,point,2);
        const playerAhead=predictions.some(box=>overlaps(bounds,box));
        const queue=this.vehicles.some(o=>o!==v&&o.active&&
          (o.position.x-point.x)*Math.cos(point.angle)+(o.position.y-point.y)*Math.sin(point.angle)>0&&
          overlaps(vehicleBounds(v,point,config.gap),vehicleBounds(o)));
        // Let an already-committed vehicle clear the stripes rather than park
        // across them. Normal player prediction still prevents unsafe movement.
        const zebra=crossingActive&&!overlaps(vehicleBounds(v,undefined,2),crossing)&&overlaps(bounds,crossing);
        if(playerAhead||queue||zebra){clearance=Math.max(0,ahead-10);break;}
      }
      for(const j of junctions){
        let distance=Infinity;
        for(let a=0;a<200;a+=8)if(overlaps(vehicleBounds(v,v.route.point(v.d+a),8),j)){distance=a;break;}
        if(distance<160)maxSpeed=Math.min(maxSpeed,config.junctionSpeed);
        const lock=this.locks.get(j.id);
        if(lock&&lock.owner!==v.id)clearance=Math.min(clearance,Math.max(0,distance-18));
        else if(!lock&&distance<64&&clearance>distance+20)this.locks.set(j.id,{owner:v.id,entered:overlaps(vehicleBounds(v,undefined,6),j)});
      }
      if(v.type==='bus'&&!v.served){
        const toStop=busStop.position.x-v.position.x;
        if(toStop>=-.1)clearance=Math.min(clearance,toStop);
        if(toStop<=4.5&&toStop>=-.1){v.served=true;v.dwell=busStop.dwellSeconds;v.speed=0;v.braking=true;continue;}
      }
      const desired=Math.min(maxSpeed,Math.sqrt(2*config.braking*Math.max(0,clearance-4)));
      v.braking=desired<v.speed-.1||clearance<10;
      v.speed=Math.max(0,desired<v.speed?Math.max(desired,v.speed-config.braking*dt):Math.min(desired,v.speed+config.acceleration*dt));
      const travel=Math.min(v.speed*dt,Math.max(0,clearance));
      const candidate=v.route.point(v.d+travel),candidateBounds=vehicleBounds(v,candidate,2);
      let safe=!predictions.slice(0,2).some(b=>overlaps(candidateBounds,b));
      if(crossingActive&&!overlaps(vehicleBounds(v,undefined,2),crossing)&&overlaps(candidateBounds,crossing))safe=false;
      for(const other of this.vehicles)if(other!==v&&other.active&&overlaps(vehicleBounds(v,candidate,8),vehicleBounds(other)))safe=false;
      for(const j of junctions)if(overlaps(candidateBounds,j)&&this.locks.get(j.id)?.owner!==v.id)safe=false;
      if(safe){v.d+=travel;v.position=candidate;}else {v.speed=0;v.braking=true;}
      if(v.d>=v.route.length-.01){v.active=false;v.speed=0;v.delay=v.type==='bus'?busStop.intervalSeconds:config.carRespawnSeconds;}
    }
  }
}
