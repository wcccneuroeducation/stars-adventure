import { schoolTimetable } from '../settings/schoolDay.js';
import { schoolDayText as text } from '../scenarios/schoolDayText.js';
import { schoolText } from '../scenarios/schoolText.js';
import { schoolLocation } from './layout.js';
import { currentPeriod,advanceSchoolDay,recogniseArrival,completeSchoolPeriod,formatSchoolTime } from './dayModel.js';
import { getSunnyDayState } from '../scenarios/sunnyDayState.js';

// One runtime per Phaser.Game, using simulation deltas across scene transitions.
// Saved state is separate from the scene and from Adventures 1/2.
export function ensureSchoolDay(scene){
  if(scene.state.adventure!=='schoolDay')return null;
  scene.game.schoolDayRuntime??=new SchoolDayRuntime(scene.game);
  return scene.game.schoolDayRuntime;
}
export class SchoolDayRuntime{
  constructor(game){
    this.game=game;this.element=document.createElement('div');this.element.className='school-day-status';
    this.clock=document.createElement('strong');this.clock.setAttribute('aria-label',text.time);
    this.activity=document.createElement('span');
    this.timetable=document.createElement('button');this.timetable.type='button';this.timetable.textContent=text.timetable;this.timetable.addEventListener('click',()=>this.showTimetable());
    this.sound=document.createElement('button');this.sound.type='button';this.sound.addEventListener('click',()=>{const d=this.day();d.audioEnabled=!d.audioEnabled;if(d.audioEnabled){this.unlockAudio();this.bell();}this.render();});
    this.checkIn=document.createElement('button');this.checkIn.type='button';this.checkIn.textContent=text.checkIn;this.checkIn.addEventListener('click',()=>this.interactArrival());
    this.notice=document.createElement('p');this.notice.className='school-day-notice';this.notice.setAttribute('role','status');this.notice.setAttribute('aria-live','polite');this.notice.textContent=text.structure;
    this.element.append(this.clock,this.activity,this.timetable,this.sound,this.checkIn,this.notice);document.querySelector('#game').before(this.element);
    this.onStep=(_time,delta)=>this.tick(delta);game.events.on('poststep',this.onStep);
    this.gesture=()=>this.unlockAudio();window.addEventListener('pointerdown',this.gesture);window.addEventListener('keydown',this.gesture);
    game.events.once('destroy',()=>{game.events.off('poststep',this.onStep);window.removeEventListener('pointerdown',this.gesture);window.removeEventListener('keydown',this.gesture);this.audio?.close().catch(()=>{});this.element.remove();});
    this.render();
  }
  day(){return getSunnyDayState(this.game.registry).schoolDay;}
  scene(){return this.game.scene.getScenes(true).find(scene=>scene.controls&&scene.sys.isActive());}
  menu(){const s=this.scene();return s?.menu??s?.dialog;}
  unlockAudio(){
    if(!this.day()?.audioEnabled)return;
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;this.audio??=new Audio();this.audio.resume().catch(()=>{});}catch{/* Visual bell is always available. */}
  }
  bell(){
    if(!this.day().audioEnabled||this.audio?.state!=='running')return;
    try{const now=this.audio.currentTime;for(const offset of [0,.18]){
      const g=this.audio.createGain();g.gain.setValueAtTime(.028,now+offset);g.gain.exponentialRampToValueAtTime(.001,now+offset+.35);g.connect(this.audio.destination);
      for(const frequency of [880,1320]){const o=this.audio.createOscillator();o.type='sine';o.frequency.value=frequency;o.connect(g);o.start(now+offset);o.stop(now+offset+.36);o.onended=()=>o.disconnect();}
      setTimeout(()=>g.disconnect(),700);
    }}catch{/* No audio requirement for navigation. */}
  }
  tick(delta){
    const active=this.game.registry.get('kickstart.activeAdventure')==='schoolDay';this.element.hidden=!active;if(!active)return;
    const d=this.day(),s=this.scene();if(!s)return;
    const paused=this.game.isPaused||s.physics?.world?.isPaused||document.hidden||!document.hasFocus()||Boolean(document.querySelector('dialog[open]'))||s.transitioning||s.miniGameActive||s.football?.model?.active;
    const changed=advanceSchoolDay(d,delta,paused),messages=[];
    if(!paused&&this.noticeRemaining>0){this.noticeRemaining-=Math.min(delta,250);if(this.noticeRemaining<=0)this.notice.hidden=true;}
    for(const period of changed){this.bell();messages.push(period.id==='finish'?text.finishNotice:text.periodNotice(period.label,schoolText.locations[period.room]));}
    const room=s.scene.key==='School'?schoolLocation(s.player.x,s.player.y+10):null;
    if(recogniseArrival(d,room))messages.push(text.arrived(schoolText.locations[room]));
    if(messages.length){this.notice.hidden=false;this.noticeRemaining=6000;this.notice.textContent=messages.join(' ');this.notice.classList.remove('school-bell-flash');void this.notice.offsetWidth;this.notice.classList.add('school-bell-flash');}
    this.render();
  }
  render(){
    const d=this.day();if(!d)return;const p=currentPeriod(d);
    const time=formatSchoolTime(d.minutes);if(this.clock.textContent!==time)this.clock.textContent=time;
    const label=`${p.label} · ${schoolText.locations[p.room]}`;if(this.activity.textContent!==label)this.activity.textContent=label;
    const soundLabel=d.audioEnabled?text.soundOn:text.soundOff;if(this.sound.textContent!==soundLabel)this.sound.textContent=soundLabel;
    this.checkIn.hidden=!(d.arrived&&d.currentRoom===d.destination&&!d.completedPeriods.includes(p.id));
  }
  showTimetable(){
    const menu=this.menu(),d=this.day();if(!menu||document.querySelector('dialog[open]'))return;
    const content=document.createElement('div');content.className='school-timetable';
    const next=schoolTimetable[d.periodIndex+1];
    for(const message of [`${text.time}: ${formatSchoolTime(d.minutes)}`,`${text.current}: ${currentPeriod(d).label}`,`${text.next}: ${next?`${next.time} — ${next.label}`:text.endNext}`,`${text.destination}: ${schoolText.locations[d.destination]}`,text.structure]){
      const p=document.createElement('p');p.textContent=message;content.append(p);
    }
    const list=document.createElement('ol');
    schoolTimetable.forEach((period,i)=>{const item=document.createElement('li');item.textContent=`${period.time} — ${period.label} · ${schoolText.locations[period.room]}`;if(i===d.periodIndex){item.setAttribute('aria-current','true');item.className='current-period';}list.append(item);});content.append(list);
    menu.show(text.timetable,'',[{label:text.close,run:()=>menu.close()}],{content});
  }
  canCheckIn(){const d=this.day();return Boolean(d&&d.arrived&&d.currentRoom===d.destination&&!d.completedPeriods.includes(currentPeriod(d).id));}
  interactArrival(){
    const menu=this.menu();if(!menu||document.querySelector('dialog[open]')||!this.canCheckIn())return;
    const d=this.day(),period=currentPeriod(d);
    menu.show(period.label,text.placeholder(period.label),[{label:text.continue,run:()=>{completeSchoolPeriod(d,period.id);menu.close();this.notice.hidden=false;this.noticeRemaining=4000;this.notice.textContent=text.acknowledged;this.render();}}]);
  }
}
