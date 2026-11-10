// Hidden, scene-local active-time clock. No timer events, intervals or UI.
export class ParkVisitClock {
  constructor(durationMs,startedAt){
    this.remainingMs=durationMs;this.lastTime=startedAt;this.wasActive=true;
    this.expired=false;this.cancelled=false;
  }
  tick(now,active){
    if(this.cancelled||this.expired)return false;
    if(this.lastTime!==null&&this.wasActive&&active){
      this.remainingMs=Math.max(0,this.remainingMs-Math.max(0,now-this.lastTime));
    }
    this.lastTime=now;this.wasActive=active;
    if(this.remainingMs>0)return false;
    this.expired=true;return true;
  }
  suspend(){this.lastTime=null;this.wasActive=false;}
  cancel(){this.cancelled=true;this.suspend();}
}
