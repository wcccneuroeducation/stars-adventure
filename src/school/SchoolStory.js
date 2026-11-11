import { schoolCharacters,schoolStoryText as text } from '../scenarios/schoolStory.js';
import { availableStories,finishStory,storyState } from './storyModel.js';
import { schoolTimetable } from '../settings/schoolDay.js';

// Bounded, collider-safe route through the existing courtyard/corridor doorways.
export const escort=[[800,480],[800,680],[800,880],[800,1128],[672,1128]];
export const homes={jay:[800,352],patel:[624,984],harris:[624,632],evans:[624,1064],lewis:[944,984],taylor:[944,1392],sam:[624,1160],alex:[928,816]};
export class SchoolStory{
 constructor(scene,solids){
  this.scene=scene;this.day=scene.state.schoolDay;this.state=storyState(this.day);this.actors=[];
  for(const [id,c] of Object.entries(schoolCharacters)){
   const key=`school-person-${id}`;
   if(!scene.textures.exists(key)){
    const t=scene.textures.createCanvas(key,96,32),ctx=t.getContext();ctx.imageSmoothingEnabled=false;
    for(let frame=0;frame<3;frame++){
     const x=frame*32,r=(a,b,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x+a,b,w,h);};
     r(8,24,6,frame===1?5:7,'#263d48');r(18,24,6,frame===2?5:7,'#263d48');
     r(9,5,14,12,c.skin);r(8,2,16,7,c.hair);r(7,7,4,5,c.hair);
     r(9,16,14,10,c.shirt);r(5,18,4,8,c.skin);r(23,18,4,8,c.skin);
     r(12,10,2,2,'#263d48');r(20,10,2,2,'#263d48');
     if(c.adult){r(15,17,3,8,'#e6d7b2');r(21,19,2,3,'#f5eccd');}
    }
    t.refresh();scene.textures.addSpriteSheet(`${key}-frames`,t.getSourceImage(),{frameWidth:32,frameHeight:32});
   }
   const [x,y]=homes[id],sprite=scene.physics.add.sprite(x,y,`${key}-frames`,0).setImmovable(true);
   sprite.body.setSize(18,12).setOffset(7,20);scene.physics.add.collider(sprite,solids);scene.physics.add.collider(scene.player,sprite);
   const label=scene.add.text(x,y-24,c.name,{fontFamily:'monospace',fontSize:11,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:3,y:2}}).setOrigin(.5,1);
   this.actors.push({id,sprite,label,target:null});
  }
  // Returning to school preserves escort progress, without teleporting a walking NPC.
  if(this.state.completed.includes('arrival')){const j=this.actor('jay');const point=escort[Math.max(0,this.state.jayRoute-1)];j.sprite.setPosition(...point);}
  scene.events.once('shutdown',()=>{this.state.active=null;});
 }
 actor(id){return this.actors.find(a=>a.id===id);}
 nearby(){return this.actors.filter(a=>Phaser.Math.Distance.Between(a.sprite.x,a.sprite.y,this.scene.player.x,this.scene.player.y)<64).sort((a,b)=>Phaser.Math.Distance.Between(a.sprite.x,a.sprite.y,this.scene.player.x,this.scene.player.y)-Phaser.Math.Distance.Between(b.sprite.x,b.sprite.y,this.scene.player.x,this.scene.player.y))[0];}
 update(time,busy){
  const pending=availableStories(this.day);
  for(const a of this.actors){
   const s=a.sprite;let target=null;
   if(a.id==='jay'){
    const court=pending.some(e=>e.actor==='jay'&&['break','finish'].includes(e.id));
    if(court){if(a.place!=='courtyard'){s.setPosition(800,352);a.place='courtyard';this.state.jayRoute=escort.length;}}
    else if(pending.some(e=>e.id==='lunch')&&!pending.some(e=>e.id==='english')){
     if(a.place!=='canteen'){s.setPosition(576,1360);a.place='canteen';}
    }
    else if(this.state.completed.includes('arrival')&&this.state.jayRoute<escort.length&&!busy){
     target=escort[this.state.jayRoute];
     // Jay waits for the player rather than disappearing down the corridor.
     const distance=Phaser.Math.Distance.Between(s.x,s.y,this.scene.player.x,this.scene.player.y);
     const ahead=(this.scene.player.x-s.x)*(target[0]-s.x)+(this.scene.player.y-s.y)*(target[1]-s.y)>0;
     if(distance>140||(distance<44&&ahead))target=null;
    }
   }
   if(a.id==='sam'){
    const lunch=pending.some(e=>e.id==='lunch')&&!pending.some(e=>e.id==='english');
    const desired=lunch?'lunch':'english';if(a.place!==desired){s.setPosition(624,lunch?1360:1160);a.place=desired;}
   }
   s.setVelocity(0);
   if(target){const dx=target[0]-s.x,dy=target[1]-s.y,dist=Math.hypot(dx,dy);if(dist<5)this.state.jayRoute++;else{s.setVelocity(dx/dist*90,dy/dist*90);if(dx)s.setFlipX(dx<0);}}
   const moving=s.body.velocity.length()>0;s.setFrame(moving?1+Math.floor(time/160)%2:Math.floor(time/1600)%2);
   s.setDepth(s.y);a.label.setPosition(s.x,s.y-22).setDepth(s.y+1);
  }
  this.scene.player.setDepth(this.scene.player.y);this.scene.shadow.setDepth(this.scene.player.y-1);
 }
 interact(){
  const a=this.nearby(),menu=this.scene.menu;if(!a||menu.open)return false;
  const events=availableStories(this.day).filter(e=>e.actor===a.id);
  if(events.length>1){menu.show(schoolCharacters[a.id].name,text.catchUp,[...events.map(e=>({label:schoolTimetable.find(p=>p.id===e.id).label,run:()=>this.open(e)})),{label:text.later,run:()=>menu.close()}]);}
  else if(events.length)this.open(events[0]);
  else menu.show(schoolCharacters[a.id].name,a.id==='patel'?text.support:text.idle,[{label:text.continue,run:()=>menu.close()}]);
  return true;
 }
 open(event){
  const menu=this.scene.menu;this.state.active=event.id;
  const speak=()=>menu.show(schoolCharacters[event.actor].name,event.intro,[...event.choices.map((choice,i)=>({label:choice.label,run:()=>menu.show(schoolCharacters[event.actor].name,choice.reply,[{label:text.continue,run:()=>{finishStory(this.day,event.id,i);menu.close();this.scene.schoolDay.render();}}],{required:true})})),{label:text.later,run:()=>{this.state.active=null;menu.close();}}],{required:true});
  if(event.lead)menu.show(event.id==='english'?schoolCharacters.evans.name:text.classMoment,event.lead,[{label:text.continue,run:speak}],{required:true});else speak();
 }
}
