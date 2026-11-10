import { robotText as text } from '../scenarios/robotRescueData.js';
import { robotLightColours,robotLightState } from './lights.js';
// Reuse two scene objects; no bodies, timers or objects allocated in update.
export class RobotDisplay{
  constructor(scene){
    this.scene=scene;this.elapsed=0;this.graphics=scene.add.graphics().setDepth(3);
    this.label=scene.add.text(704,112,'',{fontFamily:'monospace',fontSize:10,color:'#fff0be',backgroundColor:'#4b7168',padding:{x:3,y:2}}).setOrigin(.5,0).setDepth(4).setVisible(false);
  }
  update(delta){
    const p=this.scene.state.robotRescue,g=this.graphics;g.clear();
    const warning=robotLightState(p)==='warning';
    if(warning&&!this.wasWarning)this.elapsed=0;
    this.wasWarning=warning;
    this.elapsed+=Math.min(delta,100);
    const lights=robotLightColours(p,this.elapsed);
    for(let i=0;i<2;i++)g.fillStyle(0x294e4b).fillRect(542+i*24,116,14,12).fillStyle(lights[i]).fillRect(545+i*24,118,8,7);
    if(!p?.available){this.label.setVisible(false);return;}
    const done=p.completed,shake=!done&&this.elapsed<1800?Math.round(Math.sin(this.elapsed/35)*3):0;
    this.label.setVisible(true).setText(done?text.complete:text.error);
    const r=(x,y,w,h,c)=>g.fillStyle(c).fillRect(x,y,w,h);
    r(536,128,48,48,0xacc0ac);r(536+shake,128,48,48,0x4e7273);r(541+shake,132,38,27,0xb7c9c0);
    const light=0x71d096;
    r(548+shake,139,8,5,light);r(565+shake,139,8,5,light);
    r(592,144,280,16,0x526867);
    for(let i=0;i<18;i++)r(592+(i*16+(done?0:Math.floor(this.elapsed/60)))%280,146,3,12,0x8ba59b);
    if(!done)for(let i=0;i<3;i++){const x=600+(i*80+Math.floor(this.elapsed/45))%248;r(x,132,18,12,0xe4c58e);r(x+2,135,14,4,0xf3efd5);}
  }
}
