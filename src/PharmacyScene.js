import { Controls } from './controls.js';
import { createTextures } from './art.js';
import { PHARMACY,pharmacySolids,pharmacyObjects,nearbyPharmacyObject } from './pharmacy/layout.js';
import { drawPharmacy } from './pharmacy/art.js';
import { pharmacyText as text } from './scenarios/pharmacyText.js';
import { streetText } from './scenarios/streetText.js';
import { getSunnyDayState } from './scenarios/sunnyDayState.js';
import { SceneDialog } from './ui/SceneDialog.js';
import { HydrationHud } from './ui/HydrationHud.js';
import { openBackpack } from './ui/backpack.js';
import { setBedroomChrome } from './ui/sceneChrome.js';
import { coldMorningText } from './scenarios/coldMorningText.js';

export class PharmacyScene extends Phaser.Scene{
  constructor(){super('Pharmacy');}
  create(){
    document.querySelector('#status')?.remove();setBedroomChrome(text);
    this.state=getSunnyDayState(this.registry);this.transitioning=false;this.nearId=undefined;
    if(this.state.adventure==='pharmacyPanic'){this.state.pharmacyArrived=true;this.state.objective='collectPrescription';}
    if(!this.textures.exists('player'))createTextures(this);drawPharmacy(this);
    this.physics.world.setBounds(32,32,896,704);
    const solids=this.physics.add.staticGroup();
    pharmacySolids.forEach(r=>solids.add(this.add.rectangle(r.x+r.width/2,r.y+r.height/2,r.width,r.height,0,0)));
    this.shadow=this.add.ellipse(0,0,24,10,0x263d38,.3);
    this.player=this.physics.add.sprite(PHARMACY.spawn.x,PHARMACY.spawn.y,'player').setDepth(10).setCollideWorldBounds(true);
    this.player.body.setSize(18,12).setOffset(7,20);this.physics.add.collider(this.player,solids);
    this.cameras.main.setBounds(0,0,PHARMACY.width,PHARMACY.height).startFollow(this.player,true,.12,.12).setRoundPixels(true);
    this.controls=new Controls(this);this.menu=new SceneDialog(this,this.controls);
    this.hydrationHud=new HydrationHud(this,this.state,{
      onBackpack:()=>{if(!this.menu.open)openBackpack(this.menu,this.state,()=>this.hydrationHud.render());},
      onPause:()=>{if(!this.menu.open)this.menu.show(streetText.paused,streetText.pausedMessage,[{label:streetText.resume,run:()=>this.menu.close()}]);}
    }); // No outdoor hydration listener in this indoor scene.
    this.prompt=this.add.text(0,0,'',{fontFamily:'monospace',fontSize:12,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:8,y:5}}).setOrigin(.5,1).setDepth(20);
    this.debug=this.add.graphics().setDepth(30).setVisible(false);this.debug.lineStyle(2,0xff6686);
    pharmacySolids.forEach(r=>this.debug.strokeRect(r.x,r.y,r.width,r.height));
    this.debug.lineStyle(2,0x73efda);pharmacyObjects.forEach(r=>this.debug.strokeRect(r.x,r.y,r.width,r.height));
    const button=document.querySelector('#debug'),toggle=()=>this.toggleDebug();button.setAttribute('aria-pressed','false');button.addEventListener('click',toggle);
    this.events.once('shutdown',()=>{button.removeEventListener('click',toggle);button.setAttribute('aria-pressed','false');});
    document.querySelector('#game').focus({preventScroll:true});
  }
  toggleDebug(){this.debug.setVisible(!this.debug.visible);document.querySelector('#debug').setAttribute('aria-pressed',String(this.debug.visible));}
  interact(id){
    if(this.transitioning||this.menu.open)return;
    if(id==='exit'){
      this.transitioning=true;this.controls.reset();this.player.setVelocity(0);this.scene.start('BirminghamStreet',{entry:'pharmacy'});
    }
    if(id==='pharmacist'){
      const greeting=this.state.adventure==='pharmacyPanic'?coldMorningText.pharmacist:text.greeting;
      let page=0;
      const show=()=>this.menu.show(text.pharmacist,greeting[page],[{
        label:page===greeting.length-1?text.close:text.continue,
        run:()=>{if(++page<greeting.length)show();else {if(this.state.adventure==='pharmacyPanic')this.state.introFinished=true;this.menu.close();}}
      }]);show();
    }
  }
  update(){
    if(!this.controls)return;
    const pressed=this.controls.consumeInteraction();if(Phaser.Input.Keyboard.JustDown(this.controls.keys.C))this.toggleDebug();
    const busy=this.menu.open||this.transitioning||this.physics.world.isPaused||document.hidden||!document.hasFocus();
    const d=busy?{x:0,y:0}:this.controls.direction();this.player.setVelocity(d.x*150,d.y*150);if(d.x)this.player.setFlipX(d.x<0);
    this.shadow.setPosition(this.player.x,this.player.y+12);
    const object=nearbyPharmacyObject(this.player.x,this.player.y+10);
    this.prompt.setVisible(Boolean(object)&&!busy);
    if(object)this.prompt.setText(text.prompts[object.id]).setPosition(this.player.x,this.player.y-25);
    if(this.nearId!==object?.id){document.querySelector('#hint').textContent=object?text.prompts[object.id]:text.roomHint;this.nearId=object?.id;}
    if(object&&pressed&&!busy)this.interact(object.id);
  }
}
