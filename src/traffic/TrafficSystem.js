import { TrafficModel,playerStepBlocked } from './model.js';
import { createVehicleTextures } from './art.js';
export class TrafficSystem{
  constructor(scene){
    this.scene=scene;this.model=new TrafficModel();createVehicleTextures(scene);
    this.sprites=this.model.vehicles.map(v=>scene.add.image(v.position.x,v.position.y,`traffic-${v.type}`).setDepth(8));
    this.lights=scene.add.graphics().setDepth(9);
    scene.events.once('shutdown',()=>{this.model.accumulator=0;});
  }
  update(delta,paused){
    const s=this.scene,p={x:s.player.x,y:s.player.y,vx:s.player.body.velocity.x,vy:s.player.body.velocity.y};
    this.model.update(delta,p,paused);this.lights.clear();
    this.model.vehicles.forEach((v,i)=>{
      const sprite=this.sprites[i];sprite.setVisible(v.active&&!v.yielding).setPosition(v.position.x,v.position.y).setRotation(v.position.angle);
      sprite.setTexture(`traffic-${v.type}${v.doorsOpen?'-open':''}`);
      if(v.active&&!v.yielding&&v.braking){
        const a=v.position.angle,c=Math.cos(a),sn=Math.sin(a);
        for(const side of [-1,1]){
          const x=v.position.x-c*(v.length/2-2)-sn*side*(v.width/2-6),y=v.position.y-sn*(v.length/2-2)+c*side*(v.width/2-6);
          this.lights.fillStyle(0xf36958).fillRect(Math.round(x)-2,Math.round(y)-2,4,4);
        }
      }
    });
    if(paused)return;
    // Last-resort geometric guard: stop attempted walking into a vehicle. No
    // Arcade collision, pushing, damage or position correction is applied.
    if(playerStepBlocked(this.model.vehicles,p,Math.max(1/30,Math.min(delta/1000,.25))))s.player.setVelocity(0);
  }
}
