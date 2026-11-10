export class Controls{
 constructor(scene){
  this.held=new Map();this.interaction=false;this.keys=scene.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,C');
  scene.input.keyboard.addCapture(['W','A','S','D','UP','DOWN','LEFT','RIGHT','E','C']);
  document.querySelectorAll('[data-dir]').forEach(button=>{
   button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);this.held.set(e.pointerId,button.dataset.dir);});
   for(const event of['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>this.held.delete(e.pointerId));
  });
  document.querySelector('#interact').addEventListener('pointerdown',e=>{e.preventDefault();this.interaction=true;});
  window.addEventListener('blur',()=>this.reset());document.addEventListener('visibilitychange',()=>{if(document.hidden)this.reset();});
 }
 reset(){this.held.clear();this.interaction=false;Object.values(this.keys).forEach(key=>key.reset());}
 direction(){const h=new Set(this.held.values()),k=this.keys;
  const y=Number(k.S.isDown||k.DOWN.isDown||h.has('down'))-Number(k.W.isDown||k.UP.isDown||h.has('up'));
  const x=Number(k.D.isDown||k.RIGHT.isDown||h.has('right'))-Number(k.A.isDown||k.LEFT.isDown||h.has('left'));
  return y?{x:0,y}:{x,y:0};
 }
 consumeInteraction(){const pressed=Phaser.Input.Keyboard.JustDown(this.keys.E)||this.interaction;this.interaction=false;return pressed;}
}
