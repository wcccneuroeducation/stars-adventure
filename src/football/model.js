import { footballSettings as config } from '../settings/football.js';

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
// Four actors, one ball. All arrays/actors are created once per activity object.
export class FootballModel {
  constructor(){
    this.active=false;this.ball={...config.ballStart,vx:0,vy:0};
    this.player={id:'player',team:'blue',x:config.start.x,y:config.start.y+10,vx:0,vy:0};
    this.npcs=[{id:'jay',team:'blue',x:1104,y:220},{id:'orange1',team:'orange',x:1264,y:240},{id:'orange2',team:'orange',x:1320,y:352}];
    this.actors=[this.player,...this.npcs];this.score={blue:0,orange:0};this.resetSerial=0;
  }
  start(){
    this.active=true;this.awaitingChoice=false;this.eventCount=0;
    this.movementMs=0;this.nextEventMs=config.symptomAfterMs;
    this.score.blue=0;this.score.orange=0;this.lastKicker=null;this.resetDelay=0;this.aiClock=0;this.orangeChaser=1;this.resetRound();
  }
  stop(){this.active=false;this.awaitingChoice=false;}
  resetBall(){Object.assign(this.ball,config.ballStart,{vx:0,vy:0});}
  resetRound(){
    this.resetBall();this.ballLock=250;this.resetDelay=0;
    const positions=[[config.start.x,config.start.y+10],[1104,220],[1264,240],[1320,352]];
    this.actors.forEach((actor,i)=>Object.assign(actor,{x:positions[i][0],y:positions[i][1],vx:0,vy:0,cooldown:250,touching:false}));
    this.resetSerial++;
  }
  recordMovement(ms){
    if(!this.active||this.awaitingChoice||!Number.isFinite(ms)||ms<=0)return false;
    this.movementMs+=ms;
    if(this.movementMs<this.nextEventMs)return false;
    this.awaitingChoice=true;this.eventCount++;return true;
  }
  continuePlaying(){
    this.awaitingChoice=false;this.nextEventMs=this.movementMs+config.repeatAfterMs;
  }
  update(deltaMs,player,paused=false){
    if(!this.active||this.awaitingChoice||paused)return;
    const dt=Math.min(50,Math.max(0,deltaMs))/1000;
    if(this.resetDelay>0){this.resetDelay-=dt*1000;if(this.resetDelay<=0)this.resetRound();return;}
    Object.assign(this.player,{x:player.x,y:player.y,vx:player.vx||0,vy:player.vy||0});
    this.ballLock=Math.max(0,this.ballLock-dt*1000);
    this.moveNpcs(dt);
    for(const actor of this.actors){
      actor.cooldown=Math.max(0,actor.cooldown-dt*1000);
      const touching=Math.hypot(actor.x-this.ball.x,actor.y-this.ball.y)<=config.kickRange;
      const stalled=Math.hypot(this.ball.vx,this.ball.vy)<10;
      if(touching&&(!actor.touching||stalled)&&actor.cooldown===0&&this.ballLock===0)this.kick(actor);
      actor.touching=touching;
    }
    const ball=this.ball,b=config.bounds;
    const oldX=ball.x,oldY=ball.y;
    ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
    // A swept goal-line check prevents a fast ball skipping across the mouth.
    for(const [line,team] of [[b.x,'orange'],[b.x+b.width,'blue']]){
      const crossed=team==='blue'?oldX<line&&ball.x>=line:oldX>line&&ball.x<=line;
      if(!crossed)continue;
      const y=oldY+(ball.y-oldY)*(line-oldX)/(ball.x-oldX);
      if(Math.abs(y-config.ballStart.y)<=config.goalHalfHeight-7){
        this.score[team]++;ball.x=line;ball.y=y;ball.vx=0;ball.vy=0;this.resetDelay=config.kickoffMs;return;
      }
    }
    const drag=Math.exp(-config.ballFriction*dt);ball.vx*=drag;ball.vy*=drag;
    for(const [axis,min,max] of [['x',b.x+8,b.x+b.width-8],['y',b.y+8,b.y+b.height-8]]){
      if(axis==='x'&&Math.abs(ball.y-config.ballStart.y)<=config.goalHalfHeight-7)continue;
      if(ball[axis]<min||ball[axis]>max){ball[axis]=Math.max(min,Math.min(max,ball[axis]));ball['v'+axis]*=-.5;}
    }
    // A stalled ball in a goal mouth remains bounded by the actual goal line.
    ball.x=clamp(ball.x,b.x,b.x+b.width);
  }
  kick(actor){
    const ball=this.ball,dx=ball.x-actor.x,dy=ball.y-actor.y,n=Math.hypot(dx,dy);
    const nx=n?dx/n:actor.team==='blue'?1:-1,ny=n?dy/n:0;
    let x,y;
    if(actor.id==='player'){
      const speed=Math.hypot(actor.vx,actor.vy);
      x=speed?actor.vx/speed*.8+nx*.2:nx;
      y=speed?actor.vy/speed*.8+ny*.2:ny;
    }else{
      const goalX=actor.team==='blue'?config.bounds.x+config.bounds.width:config.bounds.x;
      const gx=goalX-ball.x,gy=config.ballStart.y-ball.y,g=Math.hypot(gx,gy)||1;
      x=gx/g*.8+nx*.2;y=gy/g*.8+ny*.2;
    }
    const length=Math.hypot(x,y)||1;
    ball.vx=x/length*config.kickSpeed;ball.vy=y/length*config.kickSpeed;
    actor.cooldown=config.kickCooldownMs;this.ballLock=120;this.lastKicker=actor.id;
  }
  moveNpcs(dt){
    this.aiClock-=dt;
    if(this.aiClock<=0){
      this.orangeChaser=Math.hypot(this.npcs[1].x-this.ball.x,this.npcs[1].y-this.ball.y)<=Math.hypot(this.npcs[2].x-this.ball.x,this.npcs[2].y-this.ball.y)?1:2;
      this.aiClock=.6;
    }
    const blueChases=Math.hypot(this.npcs[0].x-this.ball.x,this.npcs[0].y-this.ball.y)<Math.hypot(this.player.x-this.ball.x,this.player.y-this.ball.y);
    for(let i=0;i<this.npcs.length;i++){
      const npc=this.npcs[i],chase=i===0?blueChases:i===this.orangeChaser;
      let tx=this.ball.x,ty=this.ball.y;
      if(!chase){tx+=npc.team==='blue'?-85:95;ty+=this.ball.y<288?75:-75;}
      let dx=tx-npc.x,dy=ty-npc.y;
      // Local avoidance only: three NPCs × four actors, no pathfinding.
      for(const other of this.actors){
        if(other===npc)continue;
        const ax=npc.x-other.x,ay=npc.y-other.y,d=Math.hypot(ax,ay);
        if(d>0&&d<44){dx+=ax/d*(44-d)*2;dy+=ay/d*(44-d)*2;}
      }
      const distance=Math.hypot(dx,dy),speed=distance>5?Math.min(config.npcSpeed,distance*4):0;
      npc.vx=distance?dx/distance*speed:0;npc.vy=distance?dy/distance*speed:0;
      npc.x+=npc.vx*dt;npc.y+=npc.vy*dt;
      for(const other of this.actors){
        if(other===npc)continue;
        const ax=npc.x-other.x,ay=npc.y-other.y,d=Math.hypot(ax,ay);
        if(d<config.actorRadius*2){const n=d||1;const push=config.actorRadius*2-d;npc.x+=(d?ax/n:1)*push;npc.y+=(d?ay/n:0)*push;}
      }
      const b=config.bounds;
      npc.x=clamp(npc.x,b.x+14,b.x+b.width-14);npc.y=clamp(npc.y,b.y+8,b.y+b.height-8);
      npc.role=chase?'chase':'support';
    }
  }
}
