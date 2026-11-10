export class Controls{
 constructor(scene){
  this.held=new Map();this.interaction=false;this.listeners=[];this.keys=scene.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,C');
  scene.input.keyboard.addCapture(['W','A','S','D','UP','DOWN','LEFT','RIGHT','E','C']);
  document.querySelectorAll('[data-dir]').forEach(button=>{
   this.listen(button,'pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);this.held.set(e.pointerId,button.dataset.dir);});
   for(const event of['pointerup','pointercancel','lostpointercapture'])this.listen(button,event,e=>this.held.delete(e.pointerId));
  });
  this.listen(document.querySelector('#interact'),'pointerdown',e=>{e.preventDefault();this.interaction=true;});
  this.listen(window,'blur',()=>this.reset());this.listen(document,'visibilitychange',()=>{if(document.hidden)this.reset();});
  scene.events.once('shutdown',()=>this.destroy());
 }
 listen(target,event,handler){target.addEventListener(event,handler);this.listeners.push(()=>target.removeEventListener(event,handler));}
 destroy(){this.reset();this.listeners.forEach(remove=>remove());this.listeners=[];}
 reset(){this.held.clear();this.interaction=false;Object.values(this.keys).forEach(key=>key.reset());}
 direction(){const h=new Set(this.held.values()),k=this.keys;
  const y=Number(k.S.isDown||k.DOWN.isDown||h.has('down'))-Number(k.W.isDown||k.UP.isDown||h.has('up'));
  const x=Number(k.D.isDown||k.RIGHT.isDown||h.has('right'))-Number(k.A.isDown||k.LEFT.isDown||h.has('left'));
  return y?{x:0,y}:{x,y:0};
 }
 consumeInteraction(){const pressed=Phaser.Input.Keyboard.JustDown(this.keys.E)||this.interaction;this.interaction=false;return pressed;}
}
