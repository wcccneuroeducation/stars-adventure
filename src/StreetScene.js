import{WORLD,obstacles,shopZone}from './world.js';
import{createTextures,drawStreet}from './art.js';
import{Controls}from './controls.js';
export class StreetScene extends Phaser.Scene{
 constructor(){super('BirminghamStreet');}
 create(){
  document.querySelector('#status').remove();createTextures(this);drawStreet(this);
  this.physics.world.setBounds(0,0,WORLD.width,WORLD.height);this.solids=this.physics.add.staticGroup();
  obstacles.forEach(r=>this.solids.add(this.add.rectangle(r.x+r.width/2,r.y+r.height/2,r.width,r.height,0xff0000,0)));
  this.shadow=this.add.ellipse(0,0,24,10,0x263d38,.3);
  this.player=this.physics.add.sprite(WORLD.spawn.x,WORLD.spawn.y,'player').setDepth(10).setCollideWorldBounds(true);this.player.body.setSize(18,12).setOffset(7,20);this.physics.add.collider(this.player,this.solids);
  this.zone=new Phaser.Geom.Rectangle(shopZone.x,shopZone.y,shopZone.width,shopZone.height);
  this.prompt=this.add.text(1504,380,'[ E ] VISIT SHOP',{fontFamily:'monospace',fontSize:12,color:'#fff0be',backgroundColor:'#294e4b',padding:{x:10,y:7}}).setOrigin(.5).setDepth(12).setVisible(false);
  this.debugGraphics=this.add.graphics().setDepth(30).setVisible(false);this.debugGraphics.lineStyle(2,0xff6686);obstacles.forEach(r=>this.debugGraphics.strokeRect(r.x,r.y,r.width,r.height));this.debugGraphics.lineStyle(2,0x73efda).strokeRect(this.zone.x,this.zone.y,this.zone.width,this.zone.height);
  this.playerDebug=this.add.graphics().setDepth(31).setVisible(false);this.controls=new Controls(this);
  this.cameras.main.setBounds(0,0,WORLD.width,WORLD.height).startFollow(this.player,true,.12,.12).setRoundPixels(true);
  this.dialog=document.querySelector('#shop-dialog');document.querySelector('#close-dialog').addEventListener('click',()=>this.dialog.close());
  this.dialog.addEventListener('close',()=>{this.controls.reset();document.querySelector('#game').focus({preventScroll:true});});
  document.querySelector('#debug').addEventListener('click',()=>this.toggleDebug());document.querySelector('#game').focus({preventScroll:true});
 }
 toggleDebug(){this.debugGraphics.visible=!this.debugGraphics.visible;this.playerDebug.visible=this.debugGraphics.visible;document.querySelector('#debug').setAttribute('aria-pressed',String(this.debugGraphics.visible));}
 update(){if(!this.controls)return;
  const interact=this.controls.consumeInteraction();if(Phaser.Input.Keyboard.JustDown(this.controls.keys.C))this.toggleDebug();
  const d=this.dialog.open?{x:0,y:0}:this.controls.direction();this.player.setVelocity(d.x*150,d.y*150);if(d.x)this.player.setFlipX(d.x<0);this.shadow.setPosition(this.player.x,this.player.y+12);
  const near=Phaser.Geom.Rectangle.Contains(this.zone,this.player.x,this.player.y+10);this.prompt.setVisible(near&&!this.dialog.open);
  if(near!==this.wasNear){document.querySelector('#hint').textContent=near?'Corner shop · press E or tap INTERACT':'Explore the street · look for the teal shop sign';this.wasNear=near;}
  if(near&&interact&&!this.dialog.open){this.player.setVelocity(0);this.controls.reset();this.dialog.showModal();}
  if(this.playerDebug.visible){const b=this.player.body;this.playerDebug.clear().lineStyle(2,0xffe09c).strokeRect(b.x,b.y,b.width,b.height);}
 }
}
