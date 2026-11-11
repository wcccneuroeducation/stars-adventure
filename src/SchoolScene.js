import { Controls } from './controls.js';
import { createTextures } from './art.js';
import { getSunnyDayState } from './scenarios/sunnyDayState.js';
import { SceneDialog } from './ui/SceneDialog.js';
import { HydrationHud } from './ui/HydrationHud.js';
import { openBackpack } from './ui/backpack.js';
import { setBedroomChrome } from './ui/sceneChrome.js';
import { streetText } from './scenarios/streetText.js';
import { schoolText as text } from './scenarios/schoolText.js';
import { SCHOOL,schoolSolids,schoolLocation } from './school/layout.js';
import { drawSchool } from './school/art.js';
import { ensureSchoolDay } from './school/SchoolDayRuntime.js';
import { SchoolStory } from './school/SchoolStory.js';
import { schoolStoryText } from './scenarios/schoolStory.js';
import { schoolDayText } from './scenarios/schoolDayText.js';

// Shared school environment; Adventure 3 alone adds timetable-linked characters.
export class SchoolScene extends Phaser.Scene{
  constructor(){super('School');}
  create(){
    document.querySelector('#status')?.remove();setBedroomChrome(text);
    this.state=getSunnyDayState(this.registry);this.transitioning=false;this.location=undefined;
    if(!this.textures.exists('player'))createTextures(this);drawSchool(this);
    this.physics.world.setBounds(32,32,1536,2128);
    const solids=this.physics.add.staticGroup();
    schoolSolids.filter(r=>r.width>0&&r.height>0).forEach(r=>solids.add(this.add.rectangle(r.x+r.width/2,r.y+r.height/2,r.width,r.height,0,0)));
    this.shadow=this.add.ellipse(0,0,24,10,0x263d38,.3);
    this.player=this.physics.add.sprite(SCHOOL.spawn.x,SCHOOL.spawn.y,'player').setDepth(10).setCollideWorldBounds(true);
    this.player.body.setSize(18,12).setOffset(7,20);this.player.setData('facing','up');this.physics.add.collider(this.player,solids);
    this.cameras.main.setBounds(0,0,SCHOOL.width,SCHOOL.height).startFollow(this.player,true,.12,.12).setRoundPixels(true);
    this.cameras.main.fadeIn(180);
    this.controls=new Controls(this);this.menu=new SceneDialog(this,this.controls);
    this.hydrationHud=new HydrationHud(this,this.state,{
      onBackpack:()=>{if(!this.menu.open)openBackpack(this.menu,this.state,()=>this.hydrationHud.render());},
      onPause:()=>{if(!this.menu.open)this.menu.show(streetText.paused,streetText.pausedMessage,[{label:streetText.resume,run:()=>this.menu.close()}]);}
    }); // Shared status persists; ordinary school exploration adds no tiredness.
    this.schoolDay=ensureSchoolDay(this);
    if(this.schoolDay){
      if(!this.state.schoolDay.entered){this.player.setPosition(800,416);this.state.schoolDay.entered=true;}
      this.story=new SchoolStory(this,solids);
    }
    this.prompt=this.add.text(800,2096,text.exit,{fontFamily:'monospace',fontSize:12,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:8,y:6}}).setOrigin(.5,1).setDepth(20).setVisible(false);
    this.debug=this.add.graphics().setDepth(30).setVisible(false);this.debug.lineStyle(2,0xff6686);
    schoolSolids.forEach(r=>this.debug.strokeRect(r.x,r.y,r.width,r.height));
    const z=SCHOOL.exit;this.debug.lineStyle(2,0x73efda).strokeRect(z.x,z.y,z.width,z.height);
    const button=document.querySelector('#debug'),toggle=()=>this.toggleDebug();button.setAttribute('aria-pressed','false');button.addEventListener('click',toggle);
    this.events.once('shutdown',()=>{button.removeEventListener('click',toggle);button.setAttribute('aria-pressed','false');});
    document.querySelector('#game').focus({preventScroll:true});
  }
  toggleDebug(){this.debug.setVisible(!this.debug.visible);document.querySelector('#debug').setAttribute('aria-pressed',String(this.debug.visible));}
  leave(){
    if(this.transitioning||this.menu.open)return;
    this.transitioning=true;this.player.setVelocity(0);this.controls.reset();this.scene.start('BirminghamStreet',{entry:'school'});
  }
  update(time){
    if(!this.controls)return;
    const pressed=this.controls.consumeInteraction();if(Phaser.Input.Keyboard.JustDown(this.controls.keys.C))this.toggleDebug();
    const busy=this.menu.open||this.transitioning||this.physics.world.isPaused||document.hidden||!document.hasFocus();
    const d=busy?{x:0,y:0}:this.controls.direction();this.player.setVelocity(d.x*150,d.y*150);if(d.x)this.player.setFlipX(d.x<0);
    this.shadow.setPosition(this.player.x,this.player.y+12);
    const z=SCHOOL.exit,near=this.player.x>=z.x&&this.player.x<z.x+z.width&&this.player.y+10>=z.y&&this.player.y+10<z.y+z.height;
    this.story?.update(time,busy);
    const person=this.story?.nearby();
    const checkIn=!this.story&&this.schoolDay?.canCheckIn();
    this.prompt.setVisible((near||Boolean(person)||Boolean(checkIn))&&!busy);
    if(near)this.prompt.setText(text.exit).setPosition(800,2096);
    else if(person)this.prompt.setText(schoolStoryText.talk(person.label.text)).setPosition(person.sprite.x,person.sprite.y-46);
    else if(checkIn)this.prompt.setText(schoolDayText.arrivalPrompt).setPosition(this.player.x,this.player.y-25);
    const location=schoolLocation(this.player.x,this.player.y+10);
    if(location!==this.location||near!==this.wasNear){document.querySelector('#hint').textContent=near?text.exitHint:text.locations[location];this.location=location;this.wasNear=near;}
    if(near&&pressed&&!busy)this.leave();
    else if(pressed&&!busy){if(!this.story?.interact())this.schoolDay?.interactArrival();}
  }
}
