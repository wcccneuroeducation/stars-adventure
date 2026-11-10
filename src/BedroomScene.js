import { createTextures } from './art.js';
import { Controls } from './controls.js';
import { drawBedroom } from './bedroom/art.js';
import { ROOM, roomBounds, bedroomSolids, bedroomObjects, nearbyObject } from './bedroom/layout.js';
import { PhoneRing } from './bedroom/PhoneRing.js';
import { sunnyDayText as text } from './scenarios/sunnyDayText.js';
import { getSunnyDayState, startNewAdventure, collectItem, chooseOutfit, recordHomeDeparture } from './scenarios/sunnyDayState.js';
import { completionAdvice } from './scenarios/completionAdvice.js';
import { SceneDialog } from './ui/SceneDialog.js';
import { setBedroomChrome } from './ui/sceneChrome.js';
import { HydrationHud } from './ui/HydrationHud.js';
import { inventoryItemLabel } from './ui/backpack.js';
import { coldMorningText } from './scenarios/coldMorningText.js';
const sunnyText=()=>text;

export class BedroomScene extends Phaser.Scene {
  constructor() { super('Bedroom'); }
  create(data={}) {
    this.completing=false;
    document.querySelector('#status')?.remove();
    this.state = getSunnyDayState(this.registry);
    setBedroomChrome(this.state.adventure==='pharmacyPanic'?coldMorningText:text);
    this.hydrationHud = new HydrationHud(this,this.state);
    if (!this.textures.exists('player')) createTextures(this);
    this.items = drawBedroom(this);
    this.state.inventory.forEach(id => this.items[id]?.setVisible(false));
    const b = roomBounds;
    this.physics.world.setBounds(b.x,b.y,b.width,b.height);
    const solids = this.physics.add.staticGroup();
    bedroomSolids.forEach(r => solids.add(this.add.rectangle(r.x+r.width/2,r.y+r.height/2,r.width,r.height,0,0)));
    this.shadow = this.add.ellipse(ROOM.spawn.x,ROOM.spawn.y+12,24,10,0x263d38,.3);
    this.player = this.physics.add.sprite(ROOM.spawn.x,ROOM.spawn.y,'player').setDepth(10).setCollideWorldBounds(true);
    this.player.body.setSize(18,12).setOffset(7,20);
    this.physics.add.collider(this.player,solids);
    this.cameras.main.setBounds(0,0,ROOM.width,ROOM.height).startFollow(this.player,true,.12,.12).setRoundPixels(true);
    this.controls = new Controls(this);
    this.dialog = new SceneDialog(this,this.controls);
    this.prompt = this.add.text(0,0,'',{fontFamily:'monospace',fontSize:12,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:8,y:5}}).setOrigin(.5,1).setDepth(20);
    this.debugGraphics = this.add.graphics().setDepth(30).setVisible(false);
    this.debugGraphics.lineStyle(2,0xff6686).strokeRect(b.x,b.y,b.width,b.height);
    bedroomSolids.forEach(r=>this.debugGraphics.strokeRect(r.x,r.y,r.width,r.height));
    this.debugGraphics.lineStyle(2,0x73efda);
    bedroomObjects.forEach(({zone:z})=>this.debugGraphics.strokeRect(z.x,z.y,z.width,z.height));
    this.playerDebug = this.add.graphics().setDepth(31).setVisible(false);
    const debugButton=document.querySelector('#debug');
    debugButton.setAttribute('aria-pressed','false');
    const toggle=()=>this.toggleDebug();debugButton.addEventListener('click',toggle);
    this.ring = new PhoneRing();
    this.events.once('shutdown',()=>{
      this.ring.stop();debugButton.removeEventListener('click',toggle);
      debugButton.setAttribute('aria-pressed','false');
    });
    this.nearId = undefined;
    if(this.state.adventure!=='pharmacyPanic'&&data.returnHome&&this.state.hasVisitedPark)this.beginHomecoming();
    else if (!this.state.callComplete) this.startCall();
    else document.querySelector('#game').focus({preventScroll:true});
  }
  beginHomecoming(){
    if(this.state.completed)return;
    this.completing=true;this.controls.reset();this.player.setVelocity(0);
    this.showCompletion();
  }
  showCompletion(){
    this.state.completed=true;this.state.objective='complete';this.hydrationHud.render();
    const content=document.createElement('div');content.className='completion-advice';
    completionAdvice(this.state).forEach(paragraphs=>{
      const box=document.createElement('section');box.className='advice-box';
      paragraphs.forEach(message=>{const p=document.createElement('p');p.textContent=message;box.append(p);});
      content.append(box);
    });
    this.dialog.show(text.completeTitle,text.completeMessage,[
      {label:text.nextAdventure,run:()=>this.playAgain('pharmacyPanic')}
    ],{required:true,content});
  }
  playAgain(adventure='sunnyDay'){
    this.controls.reset();this.player.setVelocity(0);startNewAdventure(this.registry,adventure);
    this.dialog.close();this.scene.restart();
  }
  startCall() {
    const text=this.state.adventure==='pharmacyPanic'?coldMorningText:sunnyText();
    this.ring.start();
    this.ringText=this.add.text(326,169,text.ringing,{fontFamily:'monospace',fontSize:10,color:'#ffe4a2',backgroundColor:'#294347',padding:{x:4,y:3}}).setOrigin(.5).setDepth(20);
    this.ringTween=this.tweens.add({targets:this.ringText,alpha:.25,duration:450,yoyo:true,repeat:-1});
    let page=0;
    const show=()=>this.dialog.show(text.callTitle,text.call[page],[{
      label:text.continue,
      run:()=>{
        this.ring.stop();this.ringTween.stop();this.ringText.setVisible(false);
        if(page===0){page=1;show();}
        else {this.state.callComplete=true;this.dialog.close();}
      }
    }],{required:true});
    show();
  }
  interact(id) {
    const text=this.state.adventure==='pharmacyPanic'?coldMorningText:sunnyText();
    const title=text.objects[id];
    const close={label:text.close,run:()=>this.dialog.close()};
    if(id==='window') this.dialog.show(title,text.window,[close]);
    if(id==='wardrobe') {
      const content=document.createElement('div');
      const label=document.createElement('label');label.textContent=text.wardrobe;
      const select=document.createElement('select');
      text.outfits.forEach(outfit=>{const option=document.createElement('option');option.value=outfit.id;option.textContent=outfit.label;select.append(option);});
      select.value=this.state.outfit;label.append(select);content.append(label);
      const current=text.outfits.find(outfit=>outfit.id===this.state.outfit);
      this.dialog.show(title,text.currentOutfit(current.label),[{
        label:text.wear,run:()=>{chooseOutfit(this.state,select.value,text.outfits);this.dialog.close();}
      },close],{content});
    }
    if(id==='water'||id==='hat') this.dialog.show(title,text.pickup(title),[{
      label:text.take,run:()=>{collectItem(this.state,id);this.items[id].setVisible(false);this.dialog.close();}
    },{label:text.leaveItem,run:()=>this.dialog.close()}]);
    if(id==='backpack') {
      const list=document.createElement('ul');
      this.state.inventory.forEach(item=>{const row=document.createElement('li');row.textContent=inventoryItemLabel(this.state,item);list.append(row);});
      this.dialog.show(title,this.state.inventory.length?text.inventoryIntro:text.emptyBackpack,[close],{content:this.state.inventory.length?list:null});
    }
    if(id==='door') this.dialog.show(title,text.door,[{
      label:text.leaveRoom,run:()=>{recordHomeDeparture(this.state);this.dialog.close();this.scene.start('BirminghamStreet',{entry:'home'});}
    },{label:text.stay,run:()=>this.dialog.close()}]);
  }
  toggleDebug() {
    const visible=!this.debugGraphics.visible;
    this.debugGraphics.setVisible(visible);this.playerDebug.setVisible(visible);
    document.querySelector('#debug').setAttribute('aria-pressed',String(visible));
  }
  update() {
    const text=this.state?.adventure==='pharmacyPanic'?coldMorningText:sunnyText();
    if(!this.controls)return;
    const pressed=this.controls.consumeInteraction();
    if(Phaser.Input.Keyboard.JustDown(this.controls.keys.C))this.toggleDebug();
    const d=this.dialog.open||this.completing?{x:0,y:0}:this.controls.direction();
    this.player.setVelocity(d.x*150,d.y*150);
    if(d.x)this.player.setFlipX(d.x<0);
    this.shadow.setPosition(this.player.x,this.player.y+12);
    const object=nearbyObject(bedroomObjects,this.player.x,this.player.y+10,this.state.inventory);
    this.prompt.setVisible(Boolean(object)&&!this.dialog.open);
    if(object)this.prompt.setText(`[ E ] ${text.objects[object.id]}`).setPosition(this.player.x,this.player.y-25);
    if(this.nearId!==object?.id){
      document.querySelector('#hint').textContent=object?text.nearObject(text.objects[object.id]):text.roomHint;
      this.nearId=object?.id;
    }
    if(object&&pressed&&!this.dialog.open&&!this.completing)this.interact(object.id);
    if(this.playerDebug.visible){const b=this.player.body;this.playerDebug.clear().lineStyle(2,0xffe09c).strokeRect(b.x,b.y,b.width,b.height);}
  }
}
