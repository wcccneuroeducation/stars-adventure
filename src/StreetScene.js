import{WORLD,STREET_ENTRIES,obstacles,shopZone,parkZone,homeZone}from './world.js';
import{createTextures,drawStreet}from './art.js';
import{Controls}from './controls.js';
import { restoreStreetChrome } from './ui/sceneChrome.js';
import { getSunnyDayState } from './scenarios/sunnyDayState.js';
import { streetText } from './scenarios/streetText.js';
import { HydrationMovement } from './mechanics/hydration.js';
import { HydrationHud } from './ui/HydrationHud.js';
import { SceneDialog } from './ui/SceneDialog.js';
import { openBackpack } from './ui/backpack.js';
import { sunnyDayText } from './scenarios/sunnyDayText.js';
import { pharmacyZone } from './pharmacy/layout.js';
import { pharmacyText } from './scenarios/pharmacyText.js';
import { school,townText } from './neighbourhood/townLayout.js';
import { TrafficSystem } from './traffic/TrafficSystem.js';
import { busStop,trafficText } from './traffic/routes.js';
// Temporary diagnostics are disabled after verifying the initial-focus regression.
const DEBUG_HYDRATION = false;
export class StreetScene extends Phaser.Scene{
 constructor(key='BirminghamStreet'){super(key);}
 create(data={}){
  this.wasNear=undefined;
  const spawn=Object.hasOwn(STREET_ENTRIES,data.entry)?STREET_ENTRIES[data.entry]:WORLD.spawn;
  this.state=getSunnyDayState(this.registry);
  document.querySelector('#status')?.remove();restoreStreetChrome();if(!this.textures.exists('player'))createTextures(this);drawStreet(this);
  this.physics.world.setBounds(WORLD.x,WORLD.y,WORLD.width,WORLD.height);this.solids=this.physics.add.staticGroup();
  obstacles.forEach(r=>this.solids.add(this.add.rectangle(r.x+r.width/2,r.y+r.height/2,r.width,r.height,0xff0000,0)));
  this.shadow=this.add.ellipse(0,0,24,10,0x263d38,.3);
  this.player=this.physics.add.sprite(spawn.x,spawn.y,'player').setDepth(10).setCollideWorldBounds(true);this.player.body.setSize(18,12).setOffset(7,20);this.physics.add.collider(this.player,this.solids);
  // The unchanged temporary player texture is front-facing (towards screen-down).
  if(spawn.facing==='down')this.player.setFlipX(false);
  this.player.setData('facing',spawn.facing??'down');
  this.zone=new Phaser.Geom.Rectangle(shopZone.x,shopZone.y,shopZone.width,shopZone.height);
  this.parkZone=new Phaser.Geom.Rectangle(parkZone.x,parkZone.y,parkZone.width,parkZone.height);
  this.homeZone=new Phaser.Geom.Rectangle(homeZone.x,homeZone.y,homeZone.width,homeZone.height);
  this.schoolZone=new Phaser.Geom.Rectangle(school.zone.x,school.zone.y,school.zone.width,school.zone.height);
  this.schoolPrompt=this.add.text(school.entrance.x,school.zone.y,townText.schoolPrompt,{fontFamily:'monospace',fontSize:12,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:8,y:7}}).setOrigin(.5).setDepth(12).setVisible(false);
  this.pharmacyZone=new Phaser.Geom.Rectangle(pharmacyZone.x,pharmacyZone.y,pharmacyZone.width,pharmacyZone.height);
  this.pharmacyPrompt=this.add.text(2208,pharmacyZone.y,pharmacyText.exteriorPrompt,{fontFamily:'monospace',fontSize:12,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:8,y:7}}).setOrigin(.5).setDepth(12).setVisible(false);
  if(spawn.facing==='right'){this.player.setFlipX(false);this.player.setData('facing','right');}
  this.homePrompt=this.add.text(208,352,sunnyDayText.homePrompt,{fontFamily:'monospace',fontSize:12,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:8,y:7}}).setOrigin(.5).setDepth(12).setVisible(false);
  this.parkPrompt=this.add.text(1728,640,streetText.parkPrompt,{fontFamily:'monospace',fontSize:12,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:8,y:7}}).setOrigin(.5).setDepth(12).setVisible(false);
  this.prompt=this.add.text(1504,380,'[ E ] VISIT SHOP',{fontFamily:'monospace',fontSize:12,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:10,y:7}}).setOrigin(.5).setDepth(12).setVisible(false);
  this.debugGraphics=this.add.graphics().setDepth(30).setVisible(false);this.debugGraphics.lineStyle(2,0xff6686);obstacles.forEach(r=>this.debugGraphics.strokeRect(r.x,r.y,r.width,r.height));this.debugGraphics.lineStyle(2,0x73efda).strokeRect(this.zone.x,this.zone.y,this.zone.width,this.zone.height);
  this.playerDebug=this.add.graphics().setDepth(31).setVisible(false);this.controls=new Controls(this);
  this.debugGraphics.lineStyle(2,0x73efda).strokeRect(parkZone.x,parkZone.y,parkZone.width,parkZone.height);
  this.debugGraphics.strokeRect(homeZone.x,homeZone.y,homeZone.width,homeZone.height);
  this.debugGraphics.strokeRect(school.zone.x,school.zone.y,school.zone.width,school.zone.height);
  this.debugGraphics.strokeRect(pharmacyZone.x,pharmacyZone.y,pharmacyZone.width,pharmacyZone.height);
  this.dialog=document.querySelector('#shop-dialog');
  this.menu=new SceneDialog(this,this.controls);
  this.hydrationHud=new HydrationHud(this,this.state,{
   onBackpack:()=>{if(!this.dialog.open&&!this.menu.open)openBackpack(this.menu,this.state,()=>this.hydrationHud.render());},
   onPause:()=>{if(!this.dialog.open&&!this.menu.open)this.menu.show(streetText.paused,streetText.pausedMessage,[{label:streetText.resume,run:()=>this.menu.close()}]);}
  });
  this.startHydrationTracking();
  this.traffic=new TrafficSystem(this);
  this.busZone=new Phaser.Geom.Rectangle(busStop.zone.x,busStop.zone.y,busStop.zone.width,busStop.zone.height);
  this.busPrompt=this.add.text(1760,432,trafficText.prompt,{fontFamily:'monospace',fontSize:11,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:7,y:5}}).setOrigin(.5,1).setDepth(12).setVisible(false);
  this.cameras.main.setBounds(WORLD.x,WORLD.y,WORLD.width,WORLD.height).startFollow(this.player,true,.12,.12).setRoundPixels(true);
  const close=()=>this.dialog.close();const restoreFocus=()=>{this.controls.reset();document.querySelector('#game').focus({preventScroll:true});};
  const debug=()=>this.toggleDebug();const closeButton=document.querySelector('#close-dialog');const debugButton=document.querySelector('#debug');
  closeButton.addEventListener('click',close);this.dialog.addEventListener('close',restoreFocus);debugButton.addEventListener('click',debug);debugButton.setAttribute('aria-pressed','false');
  this.events.once('shutdown',()=>{closeButton.removeEventListener('click',close);this.dialog.removeEventListener('close',restoreFocus);debugButton.removeEventListener('click',debug);if(this.dialog.open)this.dialog.close();});
  document.querySelector('#game').focus({preventScroll:true});
 }
 startHydrationTracking(){
  this.hydrationMovement=new HydrationMovement(this.state);
  this.outdoorMovementRequested=false;
  const resetMovement=()=>{
   this.hydrationMovement.reset();this.outdoorMovementRequested=false;
   // Focus/visibility can change during plugin/display-list shutdown, after
   // Phaser has destroyed the sprite's body but before our DOM listeners detach.
   if(this.player?.body)this.player.setVelocity(0);
  };
  // Sample once per completed physics step, after collision resolution.
  // Render deltas may be shorter than a fixed physics step on 120Hz displays;
  // comparing those deltas to physics displacement falsely rejects real walking.
  const measureMovement=deltaSeconds=>this.updateHydration(deltaSeconds*1000);
  // Arcade Physics shuts down before this user callback and clears plugin.world.
  // Retain the emitter we subscribed to; do not dereference plugin.world later.
  const hydrationWorld=this.physics.world;
  hydrationWorld.on('worldstep',measureMovement);
  for(const event of ['pause','resume','sleep','wake'])this.events.on(event,resetMovement);
  window.addEventListener('blur',resetMovement);window.addEventListener('focus',resetMovement);document.addEventListener('visibilitychange',resetMovement);
  this.events.once('shutdown',()=>{
   hydrationWorld.off('worldstep',measureMovement);
   for(const event of ['pause','resume','sleep','wake'])this.events.off(event,resetMovement);
   window.removeEventListener('blur',resetMovement);window.removeEventListener('focus',resetMovement);document.removeEventListener('visibilitychange',resetMovement);
  });
 }
 updateHydration(delta){
  const before=this.state.hydration;
  const previous=this.hydrationMovement.previous;
  const distance=previous?Math.hypot(this.player.body.x-previous.x,this.player.body.y-previous.y):0;
  const context={
   outdoors:true,moving:distance>0.001,dialogOpen:this.dialog.open||this.menu.open,rateMultiplier:this.hydrationRateMultiplier??1,
   // Use the same current browser focus state as movement. Game.hasFocus starts
   // false and is event-driven, so it can be stale on an already-focused page.
   paused:this.game.isPaused||this.physics.world.isPaused||!this.sys.isActive(),focused:!document.hidden&&document.hasFocus()
  };
  const movementMs=this.hydrationMovement.sample(this.player.body.x,this.player.body.y,delta,context);
  this.hydrationHud.render();
  if(DEBUG_HYDRATION)console.debug('[hydration]',{
   scene:'BirminghamStreet',delta,body:{x:this.player.body.x,y:this.player.body.y},
   distance,
   ...context,documentFocused:document.hasFocus(),gameHasFocus:this.game.hasFocus,
   before,after:this.state.hydration,skipped:before===this.state.hydration
  });
  return movementMs;
 }
 toggleDebug(){this.debugGraphics.visible=!this.debugGraphics.visible;this.playerDebug.visible=this.debugGraphics.visible;document.querySelector('#debug').setAttribute('aria-pressed',String(this.debugGraphics.visible));}
 update(_time,delta=1000/60){if(!this.controls)return;
  const interact=this.controls.consumeInteraction();if(Phaser.Input.Keyboard.JustDown(this.controls.keys.C))this.toggleDebug();
  const busy=this.dialog.open||this.menu.open||this.physics.world.isPaused||!document.hasFocus()||document.hidden;
  const d=busy?{x:0,y:0}:this.controls.direction();this.outdoorMovementRequested=Boolean(d.x||d.y);this.player.setVelocity(d.x*150,d.y*150);if(d.x)this.player.setFlipX(d.x<0);this.shadow.setPosition(this.player.x,this.player.y+12);
  this.traffic?.update(delta,busy||this.game.isPaused);
  const atBus=Boolean(this.busZone)&&Phaser.Geom.Rectangle.Contains(this.busZone,this.player.x,this.player.y+10);
  this.busPrompt?.setVisible(atBus&&!busy);
  const near=Phaser.Geom.Rectangle.Contains(this.zone,this.player.x,this.player.y+10);
  const atPark=Phaser.Geom.Rectangle.Contains(this.parkZone,this.player.x,this.player.y+10);
  const atHome=Boolean(this.homeZone)&&Phaser.Geom.Rectangle.Contains(this.homeZone,this.player.x,this.player.y+10);
  const atSchool=Boolean(this.schoolZone)&&Phaser.Geom.Rectangle.Contains(this.schoolZone,this.player.x,this.player.y+10);
  this.schoolPrompt?.setVisible(atSchool&&!busy);
  const atPharmacy=Boolean(this.pharmacyZone)&&Phaser.Geom.Rectangle.Contains(this.pharmacyZone,this.player.x,this.player.y+10);
  this.pharmacyPrompt?.setVisible(atPharmacy&&!busy);
  this.prompt.setVisible(near&&!busy);this.parkPrompt.setVisible(atPark&&!busy);
  this.homePrompt?.setVisible(atHome&&!busy);
  const location=near?'shop':atPark?'park':atHome?'home':atPharmacy?'pharmacy':atSchool?'school':atBus?'bus':null;
  if(location!==this.wasNear){document.querySelector('#hint').textContent=near?'Corner shop · press E or tap INTERACT':atPark?streetText.parkHint:atHome?sunnyDayText.homeHint:'Explore the street · look for the teal shop sign';this.wasNear=location;}
  if(near&&interact&&!busy){this.player.setVelocity(0);this.controls.reset();this.dialog.showModal();}
  if(atPark&&interact&&!busy){this.player.setVelocity(0);this.controls.reset();this.scene.start('Park',{visitStartedAt:performance.now()});}
  if(atHome&&interact&&!busy){this.player.setVelocity(0);this.controls.reset();this.scene.start('Bedroom',{returnHome:this.state.hasVisitedPark,fromStreet:true});}
  if(atPharmacy){document.querySelector('#hint').textContent=pharmacyText.exteriorHint;}
  if(atPharmacy&&interact&&!busy){this.player.setVelocity(0);this.controls.reset();this.scene.start('Pharmacy');}
  if(atSchool)document.querySelector('#hint').textContent=townText.schoolPrompt;
  if(atSchool&&interact&&!busy){this.player.setVelocity(0);this.controls.reset();this.scene.start(school.futureScene);}
  if(atBus)document.querySelector('#hint').textContent=trafficText.prompt;
  if(atBus&&interact&&!busy)this.menu.show(trafficText.title,`${trafficText.route}\n\n${trafficText.message}`,[{label:trafficText.close,run:()=>this.menu.close()}]);
  if(this.playerDebug.visible){const b=this.player.body;this.playerDebug.clear().lineStyle(2,0xffe09c).strokeRect(b.x,b.y,b.width,b.height);}
 }
}
