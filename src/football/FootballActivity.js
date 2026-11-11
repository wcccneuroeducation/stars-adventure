import { FootballModel } from './model.js';
import { footballSettings as config } from '../settings/football.js';
import { footballText as text } from '../scenarios/footballText.js';
import { parkText } from '../scenarios/parkText.js';
import { PARK } from '../park/layout.js';
import { openBackpack } from '../ui/backpack.js';
import { footballHydrationEffects,footballSpeed } from './hydrationEffects.js';

export class FootballActivity {
  constructor(scene){
    this.scene=scene;this.model=new FootballModel();this.resting=false;
    this.ball=scene.add.graphics().setDepth(15).setVisible(false);
    this.target=scene.add.graphics().setDepth(5).setVisible(false);
    const b=config.bounds,y=config.ballStart.y-config.goalHalfHeight;
    this.target.lineStyle(3,0x78baf2).strokeRect(b.x-12,y,12,config.goalHalfHeight*2)
      .lineStyle(3,0xf4b16e).strokeRect(b.x+b.width,y,12,config.goalHalfHeight*2);
    this.teams=scene.add.graphics().setDepth(14).setVisible(false);
    this.thought=scene.add.text(0,0,'',{fontFamily:'monospace',fontSize:11,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:7,y:5}}).setOrigin(.5,1).setDepth(21).setVisible(false);
    this.scoreElement=document.createElement('span');this.scoreElement.className='football-score';this.scoreElement.hidden=true;
    scene.hydrationHud.element.querySelector('.status-actions').append(this.scoreElement);
    this.leaveButton=document.createElement('button');this.leaveButton.type='button';this.leaveButton.textContent=text.leave;this.leaveButton.hidden=true;
    this.leaveButton.addEventListener('click',()=>this.stop());
    scene.hydrationHud.element.querySelector('.status-actions').append(this.leaveButton);
    this.restButton=document.createElement('button');this.restButton.type='button';this.restButton.textContent=text.rest;this.restButton.hidden=true;
    this.restButton.addEventListener('click',()=>this.takeRest());
    scene.hydrationHud.element.querySelector('.status-actions').append(this.restButton);
    this.onClose=()=>{if(this.model.awaitingChoice||this.resting)this.stop();};
    scene.menu.element.addEventListener('close',this.onClose);
    scene.events.once('shutdown',()=>{
      this.model.stop();this.resting=false;scene.hydrationRateMultiplier=1;
      this.leaveButton.remove();this.restButton.remove();this.scoreElement.remove();scene.waitingFriends?.setVisible(true);scene.menu.element.removeEventListener('close',this.onClose);
    });
  }
  get active(){return this.model.active&&!this.resting;}
  get speed(){return footballSpeed(this.scene.state);}
  get inKickoff(){return this.active&&this.model.resetDelay>0;}
  start(){
    if(this.scene.visitClock?.expired)return false;
    if(this.resting){this.resume();return;}
    if(this.active)return;
    const s=this.scene;this.returnPosition={x:s.player.x,y:s.player.y};
    if(s.state.hydration<=config.stopThreshold){this.showLow();return;}
    this.model.start();s.controls.reset();s.player.setVelocity(0);
    const b=config.bounds;s.physics.world.setBounds(b.x,b.y,b.width,b.height);
    s.player.body.reset(config.start.x,config.start.y);
    this.lastPlayerPosition={x:config.start.x,y:config.start.y+10};this.seenReset=this.model.resetSerial;
    s.hydrationMovement.reset();s.hydrationRateMultiplier=config.hydrationMultiplier;
    this.leaveButton.hidden=false;this.restButton.hidden=false;this.ball.setVisible(true);this.target.setVisible(true);
    this.teams.setVisible(true);this.scoreElement.hidden=false;this.lastScore=null;this.thoughtMs=0;
    s.waitingFriends?.setVisible(false);this.checkHydration();
    s.prompt.setVisible(false);document.querySelector('#hint').textContent=text.hint;
    this.draw();
  }
  stop(){
    if(!this.model.active&&!this.resting)return;
    const s=this.scene;this.model.stop();this.resting=false;s.player.setVelocity(0);
    s.physics.world.setBounds(0,0,PARK.width,PARK.height);
    s.player.body.reset(this.returnPosition.x,this.returnPosition.y);
    s.controls.reset();s.hydrationMovement.reset();s.hydrationRateMultiplier=1;
    this.leaveButton.hidden=true;this.restButton.hidden=true;this.ball.setVisible(false);this.target.setVisible(false);
    this.teams.setVisible(false);this.scoreElement.hidden=true;this.thought.setVisible(false);s.waitingFriends?.setVisible(true);
    s.nearId=undefined;
  }
  pauseForRest(){
    if(this.resting)return;
    const s=this.scene;
    this.restFieldPosition=this.model.active?{x:s.player.x,y:s.player.y}:null;
    this.resting=true;s.player.setVelocity(0);
    s.physics.world.setBounds(0,0,PARK.width,PARK.height);
    if(this.returnPosition)s.player.body.reset(this.returnPosition.x,this.returnPosition.y);
    s.controls.reset();s.hydrationMovement.reset();s.hydrationRateMultiplier=1;
    this.restButton.hidden=true;this.teams.setVisible(false);this.ball.setVisible(false);this.target.setVisible(false);this.scoreElement.hidden=true;this.thought.setVisible(false);
    s.waitingFriends?.setVisible(true);
  }
  takeRest(water=false){
    if(this.scene.visitClock?.expired){this.stop();this.scene.menu.close();return;}
    this.scene.state.rested=true;
    this.pauseForRest();this.showRest();
    if(water)this.openRestBackpack();
  }
  showRest(){
    const s=this.scene;
    s.menu.show(text.restTitle,text.restMessage+'\n\n'+text.safety,[
      {label:text.resume,disabled:s.state.hydration<=config.stopThreshold||s.visitClock?.expired,run:()=>this.resume()},
      {label:text.backpack,run:()=>this.openRestBackpack()},
      {label:text.leave,run:()=>{this.stop();s.menu.close();}},
      {label:text.tellAdult,run:()=>this.showAdult()}
    ],{restRecovery:true});
  }
  openRestBackpack(){
    const s=this.scene;
    openBackpack(s.menu,s.state,()=>s.hydrationHud.render(),()=>this.showRest());
  }
  resume(){
    const s=this.scene;
    if(s.visitClock?.expired){this.stop();s.menu.close();return;}
    if(s.state.hydration<=config.stopThreshold){this.showRest();return;}
    if(!this.model.active){this.stop();s.menu.close();this.start();return;}
    if(this.model.awaitingChoice)this.model.continuePlaying();
    const b=config.bounds;s.physics.world.setBounds(b.x,b.y,b.width,b.height);
    s.player.body.reset(this.restFieldPosition.x,this.restFieldPosition.y);
    this.lastPlayerPosition={x:this.restFieldPosition.x,y:this.restFieldPosition.y+10};
    this.resting=false;s.controls.reset();s.hydrationMovement.reset();s.hydrationRateMultiplier=config.hydrationMultiplier;
    this.leaveButton.hidden=false;this.restButton.hidden=false;this.ball.setVisible(true);this.target.setVisible(true);this.teams.setVisible(true);this.scoreElement.hidden=false;s.waitingFriends?.setVisible(false);
    s.menu.close();this.draw();
  }
  recordMovement(ms){
    if(!this.active)return;
    this.checkHydration();
    if(!this.active||this.scene.menu.open||this.inKickoff)return;
    // Sampler reports distance at the ordinary walking speed; recover actual
    // moving time for the independent script when the football speed is reduced.
    if(this.model.recordMovement(ms*150/this.speed))this.showSymptom();
  }
  checkHydration(){
    if(!this.active)return;
    const effect=footballHydrationEffects(this.scene.state);
    if(effect==='stop'){this.showLow();return;}
    if(effect){this.thought.setText(text[effect]).setVisible(true);this.thoughtMs=5000;}
  }
  showLow(){
    this.pauseForRest();
    this.scene.menu.show(text.title,text.low+'\n\n'+text.gameRule+'\n\n'+text.safety,[
      {label:text.rest,run:()=>this.takeRest()},
      {label:text.water,run:()=>this.takeRest(true)},
      {label:text.tellAdult,run:()=>this.showAdult()},
      {label:text.close,run:()=>{this.stop();this.scene.menu.close();}}
    ]);
  }
  showAdult(){
    this.stop();this.scene.menu.show(text.adultTitle,text.adultReply,[{label:text.close,run:()=>this.scene.menu.close()}]);
  }
  showSymptom(){
    const s=this.scene;
    s.menu.show(text.title,(this.model.eventCount===1?text.first:text.continuing)+'\n\n'+text.explanation+(this.model.eventCount>1?'\n\n'+text.safety:''),[
      {label:text.rest,run:()=>this.takeRest()},
      {label:text.water,run:()=>this.takeRest(true)},
      {label:text.continue,run:()=>{this.model.continuePlaying();s.controls.reset();s.hydrationMovement.reset();s.menu.close();}}
    ]);
  }
  finishWithReply(message,water=false){
    const s=this.scene;this.stop();
    const actions=[{label:text.close,run:()=>s.menu.close()}];
    actions.unshift({label:text.tellAdult,run:()=>this.showAdult()});
    if(water)actions.unshift({label:text.backpack,run:()=>openBackpack(s.menu,s.state,()=>s.hydrationHud.render())});
    s.menu.show(parkText.jayName,message+'\n\n'+text.safety,actions);
  }
  update(delta,paused){
    const s=this.scene,x=s.player.x,y=s.player.y+10,dt=Math.max(1,delta)/1000;
    this.model.update(delta,{x,y,vx:(x-this.lastPlayerPosition.x)/dt,vy:(y-this.lastPlayerPosition.y)/dt},paused);
    this.lastPlayerPosition.x=x;this.lastPlayerPosition.y=y;
    if(this.seenReset!==this.model.resetSerial){
      s.player.setVelocity(0);s.player.body.reset(config.start.x,config.start.y);s.hydrationMovement.reset();
      this.lastPlayerPosition={x:config.start.x,y:config.start.y+10};this.seenReset=this.model.resetSerial;
    }
    const score=text.score(this.model.score.blue,this.model.score.orange);
    if(score!==this.lastScore){this.scoreElement.textContent=score;this.lastScore=score;}
    if(!paused){this.thoughtMs=Math.max(0,this.thoughtMs-delta);this.thought.setVisible(this.thoughtMs>0);}
    this.thought.setPosition(s.player.x,s.player.y-32);this.draw();
  }
  draw(){
    if(!this.active)return;
    const b=this.model.ball;
    this.ball.clear().fillStyle(0x243d45).fillRect(Math.round(b.x)-7,Math.round(b.y)-7,14,14)
      .fillStyle(0xf4ead0).fillRect(Math.round(b.x)-6,Math.round(b.y)-6,12,12)
      .fillStyle(0x334951).fillRect(Math.round(b.x)-2,Math.round(b.y)-2,4,4)
      .fillRect(Math.round(b.x)-6,Math.round(b.y)-6,3,3).fillRect(Math.round(b.x)+3,Math.round(b.y)+3,3,3);
    const g=this.teams;g.clear();
    // Blue kit overlay on the existing player; the base art remains unchanged.
    g.fillStyle(0x438bd0).fillRect(Math.round(this.scene.player.x)-7,Math.round(this.scene.player.y)+1,14,9);
    for(const actor of this.model.npcs){
      const x=Math.round(actor.x)-16,y=Math.round(actor.y)-26;
      g.fillStyle(0x273d47).fillRect(x+7,y+24,6,7).fillRect(x+19,y+24,6,7);
      g.fillStyle(actor.id==='jay'?0xbd845e:actor.id==='orange1'?0x80543e:0xe1b187).fillRect(x+9,y+5,14,12).fillRect(x+5,y+18,4,8).fillRect(x+23,y+18,4,8);
      g.fillStyle(0x3c3535).fillRect(x+8,y+2,16,7);
      g.fillStyle(actor.team==='blue'?0x438bd0:0xe5914e).fillRect(x+9,y+16,14,10);
    }
  }
}
