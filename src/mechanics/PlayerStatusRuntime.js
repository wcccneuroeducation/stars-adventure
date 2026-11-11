import { advancePlayerStatus,ensurePlayerStatus,tirednessBand } from './playerStatus.js';
import { playerStatusText as text } from '../scenarios/playerStatusText.js';
// One simulation listener for the whole game. Scene-scoped activities cannot leak.
export function ensurePlayerStatusRuntime(scene){
 scene.game.playerStatusRuntime??=new PlayerStatusRuntime(scene.game);
 scene.game.playerStatusRuntime.attachScene(scene);
 return scene.game.playerStatusRuntime;
}
export class PlayerStatusRuntime{
 constructor(game){
  this.game=game;this.activities=new WeakMap();this.rests=new WeakMap();this.attached=new WeakSet();this.previous=null;this.pendingMovement=0;this.lastBand='low';
  this.step=(_time,delta)=>this.tick(delta);game.events.on('poststep',this.step);
  game.events.once('destroy',()=>game.events.off('poststep',this.step));
 }
 attachScene(scene){
  if(this.attached.has(scene))return;this.attached.add(scene);
  scene.events?.once('shutdown',()=>{this.activities.delete(scene);this.rests.delete(scene);this.attached.delete(scene);if(this.previous?.scene===scene){this.previous=null;this.pendingMovement=0;}});
 }
 startPhysicalActivity(scene,type='pe'){this.activities.set(scene,type);this.rests.delete(scene);}
 stopPhysicalActivity(scene){this.activities.delete(scene);}
 startRest(scene,{dedicated=false}={}){this.stopPhysicalActivity(scene);this.rests.set(scene,dedicated?'dedicated':'seated');}
 stopRest(scene){this.rests.delete(scene);}
 isTired(scene){return tirednessBand(scene.state);}
 tick(delta){
  const scene=this.game.scene.getScenes(true).find(s=>s.controls&&s.player?.body&&s.sys.isActive());
  if(!scene){this.previous=null;return;}
  const state=ensurePlayerStatus(scene.state),body=scene.player.body,old=this.previous;
  if(this.lastState!==state){this.lastState=state;this.lastBand='low';this.pendingMovement=0;}
  if(old?.scene!==scene)this.pendingMovement=0;
  this.previous={scene,x:body.x,y:body.y};
  const modal=document.querySelector('dialog[open]');
  const stopped=this.game.isPaused||scene.physics?.world?.isPaused||document.hidden||!document.hasFocus()||scene.transitioning||scene.completing||scene.state.completed||scene.miniGameActive||scene.state.schoolDay?.miniGameActive;
  const rest=this.rests.get(scene)||(scene.resting||scene.football?.resting?'dedicated':null);
  const recoveryOnly=Boolean(modal&&rest&&modal.dataset.restRecovery==='true');
  const paused=Boolean(stopped||(modal&&!recoveryOnly));
  const speed=scene.football?.active?scene.football.speed:150;
  const distance=old?.scene===scene?Math.hypot(body.x-old.x,body.y-old.y):0;
  // Accumulate resolved physics displacement across 120Hz render frames. Never
  // count scene entries, teleports, collision-blocked input or suspended frames.
  if(paused||!Number.isFinite(delta)||delta<=0||delta>1000){this.pendingMovement=0;}
  else if(distance<=speed*Math.max(delta,1000/60)/1000+1)this.pendingMovement+=distance/speed*1000;
  else this.pendingMovement=0;
  const movementMs=Math.min(this.pendingMovement,Math.min(delta,250));this.pendingMovement=Math.max(0,this.pendingMovement-movementMs);
  const activity=rest?null:scene.football?.active&&!scene.football.inKickoff?'football':this.activities.get(scene);
  advancePlayerStatus(state,delta,{paused,recoveryOnly,rest,activity,movementMs,outdoors:['BirminghamStreet','Park'].includes(scene.scene.key)});
  if(!paused&&scene.football?.active){
   const band=tirednessBand(state);
   if(band!==this.lastBand){scene.football.thought.setText(band==='low'?text.recovered:text[band]).setVisible(true);scene.football.thoughtMs=5000;}
   this.lastBand=band;
  }
  scene.hydrationHud?.render();
 }
}
