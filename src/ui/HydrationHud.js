import { hydrationColour } from '../mechanics/hydration.js';
import { streetText as text } from '../scenarios/streetText.js';
import { sunnyDayText } from '../scenarios/sunnyDayText.js';
import { coldMorningText } from '../scenarios/coldMorningText.js';
import { robotText } from '../scenarios/robotRescueData.js';
import { prescriptionText } from '../scenarios/prescriptionData.js';
import { openPrescriptionCard } from '../prescription/card.js';
import { missionText } from '../scenarios/medicineMissionData.js';
import { schoolDayText } from '../scenarios/schoolDayText.js';
import { ensurePlayerStatusRuntime } from '../mechanics/PlayerStatusRuntime.js';
import { ensurePlayerStatus } from '../mechanics/playerStatus.js';
import { playerStatusText } from '../scenarios/playerStatusText.js';

export class HydrationHud {
  constructor(scene, state, { onBackpack, onPause } = {}) {
    this.state = state;
    ensurePlayerStatus(state);ensurePlayerStatusRuntime(scene);
    this.element = document.createElement('div');
    this.element.className = 'adventure-status';
    const meterGroup = document.createElement('div');meterGroup.className = 'hydration-group';
    const label = document.createElement('span');label.textContent = text.hydration;
    this.meter = document.createElement('div');this.meter.className = 'hydration-meter';
    this.meter.setAttribute('role', 'meter');this.meter.setAttribute('aria-label', `${text.hydration}. ${text.fictional}`);
    this.meter.setAttribute('aria-valuemin', '0');this.meter.setAttribute('aria-valuemax', '100');
    this.fill = document.createElement('div');this.fill.className = 'hydration-fill';this.meter.append(this.fill);
    this.percentage = document.createElement('span');this.percentage.className = 'hydration-value';
    const note = document.createElement('small');note.textContent = text.fictional;
    meterGroup.append(label,this.meter,this.percentage,note);this.element.append(meterGroup);
    const tired=document.createElement('div');tired.className='hydration-group tiredness-group';
    const tiredLabel=document.createElement('span');tiredLabel.textContent=playerStatusText.tiredness;
    this.tiredMeter=document.createElement('div');this.tiredMeter.className='hydration-meter';
    this.tiredMeter.setAttribute('role','meter');this.tiredMeter.setAttribute('aria-label',`${playerStatusText.tiredness}. ${playerStatusText.fictional}`);
    this.tiredMeter.setAttribute('aria-valuemin','0');this.tiredMeter.setAttribute('aria-valuemax','100');
    this.tiredFill=document.createElement('div');this.tiredFill.className='tiredness-fill';this.tiredMeter.append(this.tiredFill);
    this.tiredValue=document.createElement('span');this.tiredValue.className='hydration-value';tired.append(tiredLabel,this.tiredMeter,this.tiredValue);this.element.append(tired);
    const actions = document.createElement('div');actions.className = 'status-actions';
    for (const [title, run] of [[text.backpack,onBackpack],[text.pause,onPause]]) {
      if (!run) continue;
      const button=document.createElement('button');button.type='button';button.textContent=title;
      button.addEventListener('click',run);actions.append(button);
    }
    this.element.append(actions);
    this.prescriptionButton=document.createElement('button');this.prescriptionButton.type='button';this.prescriptionButton.textContent=prescriptionText.card;
    this.prescriptionButton.addEventListener('click',()=>{
      const menu=scene.menu??scene.dialog;
      if(!menu?.open&&!scene.dialog?.open)openPrescriptionCard(menu,state);
    });actions.append(this.prescriptionButton);
    this.basketElement=document.createElement('span');this.basketElement.className='prescription-basket';actions.append(this.basketElement);
    this.objectiveElement=document.createElement('span');this.objectiveElement.className='adventure-objective';
    this.element.append(this.objectiveElement);
    document.querySelector('#game').before(this.element);
    scene.events.once('shutdown',()=>this.element.remove());
    this.render();
  }
  render() {
    if(this.tiredFill){const value=this.state.tiredness??0;if(value!==this.lastTiredness){this.lastTiredness=value;this.tiredFill.style.width=`${value}%`;this.tiredMeter.setAttribute('aria-valuenow',String(Math.round(value)));this.tiredValue.textContent=`${Math.round(value)}%`;}}
    if(this.prescriptionButton){
      const active=Boolean(this.state.prescription?.started);this.prescriptionButton.hidden=!active;this.basketElement.hidden=!active;
      if(active)this.basketElement.textContent=prescriptionText.basket(this.state.prescription.found.length);
    }
    if(this.objectiveElement){
      const objective=this.state.objective||'explore';
      const prescriptionLabels={findPrescription:prescriptionText.findObjective,returnPharmacist:prescriptionText.returnObjective,takePrescriptionHome:prescriptionText.homeObjective,medicinePlan:missionText.objective,pharmacyComplete:missionText.adventureTitle,schoolTimetable:schoolDayText.objective};
      const label=prescriptionLabels[objective]??(objective==='collectPrescription'?coldMorningText.objective:objective==='repairRobot'?robotText.repairObjective:objective==='prescriptionCollection'?robotText.prescriptionObjective:sunnyDayText.objectives[objective]);
      if(this.lastObjective!==objective){this.objectiveElement.textContent=sunnyDayText.objectiveLabel(label);this.lastObjective=objective;}
    }
    const value=this.state.hydration, displayed=Math.ceil(value);
    if(this.lastValue===value)return;
    this.lastValue=value;
    this.fill.style.width=`${value}%`;this.fill.dataset.colour=hydrationColour(value);
    this.meter.setAttribute('aria-valuenow',String(displayed));this.percentage.textContent=`${displayed}%`;
  }
}
