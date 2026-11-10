import { missionData as data,missionText as text } from '../scenarios/medicineMissionData.js';
import { unlockMission,chooseRoutine,toggleReminder,answerForgotten,completeMission } from './model.js';
export class MedicineMission{
  constructor(scene){this.scene=scene;scene.events.once('shutdown',()=>{this.audio?.close().catch(()=>{});});}
  open(){
    const s=this.scene,p=unlockMission(s.state);if(!p)return;
    if(p.completed){this.summary();return;}
    const actions=[{label:text.close,run:()=>s.dialog.close()}];
    const content=document.createElement('div');content.className='medicine-mission';
    const paragraph=message=>{const el=document.createElement('p');el.textContent=message;content.append(el);};
    const advance=step=>{p.step=step;this.open();};
    let title=text.title,message=text.intro;
    if(p.step==='intro'){
      paragraph(text.fictional);actions.unshift({label:text.begin,run:()=>advance('routine')});
    }else if(p.step==='routine'){
      title=text.routineTitle;message=text.instruction;paragraph(text.routinePrompt);
      this.options(content,data.timeline,id=>{if(chooseRoutine(s.state,id))this.open();},'timeline');
    }else if(p.step==='routineFeedback'){
      message=text.routineFeedback;actions.unshift({label:text.continue,run:()=>advance('reminders')});
    }else if(p.step==='reminders'||p.step==='backup'){
      title=p.step==='backup'?text.backup:text.remindersTitle;message=p.step==='backup'?text.backupPrompt:text.remindersPrompt;
      this.options(content,data.reminders,id=>{toggleReminder(s.state,id);this.open();},'reminder-options',p.reminders);
      actions.unshift({label:p.step==='backup'?text.keep:text.choose,disabled:!p.reminders.length,run:()=>advance(p.step==='backup'?'remindersFeedback':'backup')});
    }else if(p.step==='remindersFeedback'){
      message=text.remindersFeedback;actions.unshift({label:text.continue,run:()=>advance('forget')});
    }else if(p.step==='forget'){
      title=text.forgetTitle;message=text.forget;
      for(const answer of text.answers)actions.unshift({label:answer.label,run:()=>{
        if(answerForgotten(s.state,answer.id))this.open();
        else s.dialog.show(text.forgetTitle,text.correction,[{label:text.retry,run:()=>this.open()},{label:text.close,run:()=>s.dialog.close()}]);
      }});
      // Preserve A/B/C reading order above the close action.
      actions.splice(0,3,...actions.slice(0,3).reverse());
    }else if(p.step==='safeFeedback'){
      message=text.safe;actions.unshift({label:text.continue,run:()=>{if(completeMission(s.state)){this.tone();this.summary();}}});
    }
    s.dialog.show(title,message,actions,{content});
  }
  options(content,options,choose,className,selected=[]){
    const grid=document.createElement('div');grid.className=`mission-options ${className}`;
    for(const option of options){
      const button=document.createElement('button');button.type='button';button.dataset.choice=option.id;
      const icon=document.createElement('span');icon.className='mission-icon';icon.textContent=option.icon;icon.setAttribute('aria-hidden','true');
      const label=document.createElement('span');label.textContent=option.label;button.append(icon,label);
      if(className==='reminder-options')button.setAttribute('aria-pressed',String(selected.includes(option.id)));
      button.addEventListener('click',()=>choose(option.id));grid.append(button);
    }content.append(grid);
  }
  plan(){
    const p=this.scene.state.medicineMission,content=document.createElement('div');content.className='mission-plan';
    const title=document.createElement('h3');title.textContent=text.planTitle;content.append(title);
    for(const line of [text.fictional,`${text.routineLabel}: ${data.timeline.find(t=>t.id===p.routine).label}`,`${text.strategiesLabel}: ${data.reminders.filter(r=>p.reminders.includes(r.id)).map(r=>r.label).join(', ')}`,text.checkLabel]){
      const el=document.createElement('p');el.textContent=line;content.append(el);
    }return content;
  }
  summary(){
    const s=this.scene,p=s.state.medicineMission;
    const content=this.plan();content.classList.add('mission-celebration');
    s.dialog.show(text.complete,text.completeMessage,[
      {label:text.finish,run:()=>s.showPharmacyCompletion()},
      {label:p.audioEnabled?text.soundOn:text.soundOff,run:()=>{p.audioEnabled=!p.audioEnabled;if(p.audioEnabled)this.tone();this.summary();}},
      {label:text.close,run:()=>s.dialog.close()}
    ],{content});
  }
  tone(){
    if(!this.scene.state.medicineMission.audioEnabled)return;
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;this.audio??=new Audio();this.audio.resume().catch(()=>{});
      const now=this.audio.currentTime;
      [523,659,784].forEach((hz,i)=>{const o=this.audio.createOscillator(),g=this.audio.createGain();o.type='triangle';o.frequency.value=hz;g.gain.setValueAtTime(.035,now+i*.12);g.gain.exponentialRampToValueAtTime(.001,now+i*.12+.2);o.connect(g);g.connect(this.audio.destination);o.start(now+i*.12);o.stop(now+i*.12+.21);o.onended=()=>{o.disconnect();g.disconnect();};});
    }catch{/* Optional sound never blocks completing the plan. */}
  }
}
