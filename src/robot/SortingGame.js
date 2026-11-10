import { medicines,sortingBins,robotText as text } from '../scenarios/robotRescueData.js';
import { rescueState,currentMedicine,sortMedicine,continueSorting } from './model.js';
import { addRobotLights,robotLightState } from './lights.js';

export class SortingGame{
  constructor(scene){
    this.scene=scene;this.progress=rescueState(scene.state);this.selected=false;
    scene.events.once('shutdown',()=>{this.audio?.close().catch(()=>{});});
  }
  tone(success=true){
    if(!this.progress.audioEnabled)return;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      this.audio??=new Audio();this.audio.resume().catch(()=>{});
      const now=this.audio.currentTime;
      for(let i=0;i<(success?2:1);i++){
        const o=this.audio.createOscillator(),g=this.audio.createGain();o.type='square';o.frequency.value=success?660+i*220:220;
        g.gain.setValueAtTime(.025,now+i*.12);g.gain.exponentialRampToValueAtTime(.001,now+i*.12+.12);
        o.connect(g);g.connect(this.audio.destination);o.start(now+i*.12);o.stop(now+i*.12+.13);
        o.onended=()=>{o.disconnect();g.disconnect();};
      }
    }catch{/* Optional audio must never block sorting. */}
  }
  open(){
    if(this.progress.completed&&!this.progress.feedbackMedicine){this.scene.showRobotCelebration();return;}
    this.selected=false;
    const content=document.createElement('div');content.className='robot-rescue';
    const make=(tag,className,message)=>{const el=document.createElement(tag);el.className=className;if(message)el.textContent=message;return el;};
    const robot=make('div','sorting-robot',text.robot);robot.setAttribute('aria-hidden','true');content.append(robot);
    addRobotLights(robot,this.progress);
    const label=make('label','repair-label',text.progress);const progress=make('progress','repair-progress');progress.max=this.progress.sequence.length;progress.value=this.progress.index;progress.setAttribute('aria-label',text.progress);content.append(label,progress);
    const belt=make('div',this.progress.completed?'sorting-belt stopped':'sorting-belt');const box=make('button','medicine-box');box.type='button';box.draggable=true;
    const feedback=this.progress.feedbackMedicine&&medicines.find(m=>m.id===this.progress.feedbackMedicine);
    const medicine=feedback||currentMedicine(this.progress);box.textContent=medicine.name;box.setAttribute('aria-label',`${text.select}: ${medicine.name}`);box.setAttribute('aria-pressed','false');
    if(feedback)box.classList.add('sorted-box');
    belt.append(box);content.append(belt);
    const status=make('p','sorting-status',feedback?medicine.explanation:text.instructions);status.setAttribute('role','status');status.setAttribute('aria-live','polite');content.append(status);
    const bins=make('div','sorting-bins');
    const select=()=>{if(feedback)return;this.selected=true;box.setAttribute('aria-pressed','true');status.textContent=text.selected;};
    box.addEventListener('click',select);box.addEventListener('dragstart',e=>{select();e.dataTransfer.setData('text/plain',medicine.id);e.dataTransfer.effectAllowed='move';});
    this.binButtons=[];
    const hint=make('button','sorting-hint',text.hint);hint.type='button';hint.hidden=!this.progress.incorrect||Boolean(feedback);hint.addEventListener('click',()=>{status.textContent=medicine.hint;});
    for(const bin of sortingBins){
      const button=make('button','sorting-bin',bin.label);button.type='button';button.disabled=Boolean(feedback);button.dataset.bin=bin.id;
      const attempt=()=>{
        if(!this.selected){status.textContent=text.selectFirst;box.focus();return;}
        const result=sortMedicine(this.scene.state,bin.id);
        if(result==='retry'){
          status.textContent=text.wrong;hint.hidden=false;box.classList.remove('wrong-box');void box.offsetWidth;box.classList.add('wrong-box');
        }else if(result==='correct'){
          const from=box.getBoundingClientRect(),to=button.getBoundingClientRect();
          const flight=make('div','sorting-flight',medicine.name);flight.setAttribute('aria-hidden','true');
          Object.assign(flight.style,{left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`});content.append(flight);
          const animation=flight.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${to.left+to.width/2-from.left-from.width/2}px,${to.top+to.height/2-from.top-from.height/2}px) scale(.25)`,opacity:0}],{duration:500,easing:'ease-in'});
          animation.onfinish=()=>flight.remove();animation.oncancel=()=>flight.remove();
          this.selected=false;box.draggable=false;box.disabled=true;box.classList.add('sorted-box');button.classList.add('receiving-box');
          this.binButtons.forEach(b=>b.disabled=true);hint.hidden=true;status.textContent=medicine.explanation;progress.value=this.progress.index;next.hidden=false;next.focus();this.tone();
          if(this.progress.completed){belt.classList.add('stopped');robot.classList.add('repaired');robot.dataset.lightState=robotLightState(this.progress);this.scene.hydrationHud.render();}
        }
      };
      button.addEventListener('click',attempt);button.addEventListener('dragover',e=>{if(!button.disabled)e.preventDefault();});
      button.addEventListener('drop',e=>{e.preventDefault();if(button.disabled||e.dataTransfer.getData('text/plain')!==medicine.id)return;select();attempt();});
      this.binButtons.push(button);bins.append(button);
    }
    content.append(bins,hint);
    const next=make('button','sorting-next',text.continue);next.type='button';next.hidden=!feedback;
    next.addEventListener('click',()=>{if(continueSorting(this.scene.state)){this.scene.hydrationHud.render();this.scene.showRobotCelebration();}else this.open();});content.append(next);
    const note=make('p','sorting-examples',text.examples);content.append(note);
    this.scene.menu.show(text.title,'',[
      {label:this.progress.audioEnabled?text.soundOn:text.soundOff,run:()=>{this.progress.audioEnabled=!this.progress.audioEnabled;this.tone();this.open();}},
      {label:text.close,run:()=>this.scene.menu.close()}
    ],{content});
    this.scene.menu.element.classList.add('sorting-dialog');
    // The existing dialog handles keyboard capture and Escape/focus restoration.
    box.disabled=Boolean(feedback);(feedback?next:box).focus();
  }
}
