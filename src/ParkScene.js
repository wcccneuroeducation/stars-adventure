import { StreetScene } from './StreetScene.js';
import { Controls } from './controls.js';
import { createTextures } from './art.js';
import { PARK, parkSolids, parkObjects, nearbyParkObject, seating } from './park/layout.js';
import { drawPark } from './park/art.js';
import { fountainActions } from './park/interactions.js';
import { parkText } from './scenarios/parkText.js';
import { streetText } from './scenarios/streetText.js';
import { getSunnyDayState } from './scenarios/sunnyDayState.js';
import { SceneDialog } from './ui/SceneDialog.js';
import { HydrationHud } from './ui/HydrationHud.js';
import { openBackpack } from './ui/backpack.js';
import { setParkChrome } from './ui/sceneChrome.js';

// Reuse the tested street hydration lifecycle and collision-debug toggle without
// calling street create(): this scene has its own map, objects and interactions.
export class ParkScene extends StreetScene {
  constructor(){super('Park');}
  create(){
    document.querySelector('#status')?.remove();setParkChrome(parkText);
    this.state=getSunnyDayState(this.registry);this.resting=false;this.nearId=undefined;
    if(!this.textures.exists('player'))createTextures(this);
    drawPark(this);
    this.physics.world.setBounds(0,0,PARK.width,PARK.height);
    const solids=this.physics.add.staticGroup();
    parkSolids.forEach(r=>solids.add(this.add.rectangle(r.x+r.width/2,r.y+r.height/2,r.width,r.height,0,0)));
    this.shadow=this.add.ellipse(PARK.spawn.x,PARK.spawn.y+12,24,10,0x263d38,.3);
    this.player=this.physics.add.sprite(PARK.spawn.x,PARK.spawn.y,'player-back').setDepth(10).setCollideWorldBounds(true);
    this.player.body.setSize(18,12).setOffset(7,20);this.physics.add.collider(this.player,solids);
    this.player.setData('facing','up');
    this.cameras.main.setBounds(0,0,PARK.width,PARK.height).startFollow(this.player,true,.12,.12).setRoundPixels(true);
    this.controls=new Controls(this);this.menu=new SceneDialog(this,this.controls);
    this.dialog=this.menu.element; // Shared hydration checks the same modal state.
    this.hydrationHud=new HydrationHud(this,this.state,{
      onBackpack:()=>{if(!this.menu.open)openBackpack(this.menu,this.state,()=>this.hydrationHud.render());},
      onPause:()=>{if(!this.menu.open)this.menu.show(streetText.paused,streetText.pausedMessage,[{label:streetText.resume,run:()=>this.menu.close()}]);}
    });
    this.startHydrationTracking();
    this.prompt=this.add.text(0,0,'',{fontFamily:'monospace',fontSize:12,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:8,y:5}}).setOrigin(.5,1).setDepth(20).setVisible(false);
    this.debugGraphics=this.add.graphics().setDepth(30).setVisible(false);
    this.debugGraphics.lineStyle(2,0xff6686);parkSolids.forEach(r=>this.debugGraphics.strokeRect(r.x,r.y,r.width,r.height));
    this.debugGraphics.lineStyle(2,0x73efda);parkObjects.forEach(({zone:z})=>this.debugGraphics.strokeRect(z.x,z.y,z.width,z.height));
    this.playerDebug=this.add.graphics().setDepth(31).setVisible(false);
    const debug=document.querySelector('#debug'),toggle=()=>this.toggleDebug();
    debug.setAttribute('aria-pressed','false');debug.addEventListener('click',toggle);
    const finishRest=()=>this.finishRest();this.menu.element.addEventListener('close',finishRest);
    this.events.once('shutdown',()=>{
      debug.removeEventListener('click',toggle);debug.setAttribute('aria-pressed','false');
      this.menu.element.removeEventListener('close',finishRest);this.finishRest();
    });
    document.querySelector('#game').focus({preventScroll:true});
  }
  interact(id){
    const close=()=>this.menu.close();
    if(id==='bench')this.menu.show(parkText.objects.bench,parkText.bench,[{
      label:parkText.sit,run:()=>{
        this.restPosition={x:this.player.x,y:this.player.y};this.resting=true;
        this.player.setVelocity(0);this.player.body.enable=false;
        this.player.setTexture('player').setPosition(seating.x+seating.width/2,seating.y+4);
        this.menu.show(parkText.restingTitle,parkText.resting,[{label:parkText.stand,run:()=>{this.finishRest();close();}}]);
      }
    },{label:parkText.leave,run:close}]);
    if(id==='fountain')this.menu.show(parkText.objects.fountain,parkText.fountain,
      fountainActions(this.state,()=>this.hydrationHud.render(),close));
    if(id==='jay')this.menu.show(parkText.jayName,parkText.jay,[{label:parkText.close,run:close}]);
    if(id==='gate')this.menu.show(parkText.objects.gate,parkText.returnStreet,[{
      label:parkText.return,run:()=>{close();this.controls.reset();this.scene.start('BirminghamStreet',{entry:'park'});}
    },{label:parkText.stay,run:close}]);
  }
  finishRest(){
    if(!this.resting)return;
    this.resting=false;this.player.body.enable=true;
    this.player.body.reset(this.restPosition.x,this.restPosition.y);this.restPosition=null;
    this.hydrationMovement.reset();
  }
  updateHydration(delta){
    if(this.resting){this.hydrationMovement.reset();this.hydrationHud.render();return;}
    super.updateHydration(delta);
  }
  update(){
    if(!this.controls)return;
    const pressed=this.controls.consumeInteraction();
    if(Phaser.Input.Keyboard.JustDown(this.controls.keys.C))this.toggleDebug();
    const busy=this.menu.open||this.resting||this.physics.world.isPaused||document.hidden||!document.hasFocus();
    const d=busy?{x:0,y:0}:this.controls.direction();
    this.player.setVelocity(d.x*150,d.y*150);
    if(d.x||d.y){
      this.player.setTexture(d.y<0?'player-back':'player');this.player.setFlipX(d.x<0);
      this.player.setData('facing',d.y<0?'up':d.y>0?'down':d.x<0?'left':'right');
    }
    this.shadow.setPosition(this.player.x,this.player.y+12);
    const object=nearbyParkObject(this.player.x,this.player.y+10);
    this.prompt.setVisible(Boolean(object)&&!busy);
    if(object)this.prompt.setText(`[ E ] ${parkText.objects[object.id]}`).setPosition(this.player.x,this.player.y-26);
    if(this.nearId!==object?.id){document.querySelector('#hint').textContent=object?parkText.near(parkText.objects[object.id]):parkText.roomHint;this.nearId=object?.id;}
    if(object&&pressed&&!busy)this.interact(object.id);
    if(this.playerDebug.visible){const b=this.player.body;this.playerDebug.clear().lineStyle(2,0xffe09c).strokeRect(b.x,b.y,b.width,b.height);}
  }
}
