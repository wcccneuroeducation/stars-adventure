import { hydrationColour } from '../mechanics/hydration.js';
import { streetText as text } from '../scenarios/streetText.js';
import { sunnyDayText } from '../scenarios/sunnyDayText.js';
import { coldMorningText } from '../scenarios/coldMorningText.js';
import { robotText } from '../scenarios/robotRescueData.js';

export class HydrationHud {
  constructor(scene, state, { onBackpack, onPause } = {}) {
    this.state = state;
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
    const actions = document.createElement('div');actions.className = 'status-actions';
    for (const [title, run] of [[text.backpack,onBackpack],[text.pause,onPause]]) {
      if (!run) continue;
      const button=document.createElement('button');button.type='button';button.textContent=title;
      button.addEventListener('click',run);actions.append(button);
    }
    this.element.append(actions);
    this.objectiveElement=document.createElement('span');this.objectiveElement.className='adventure-objective';
    this.element.append(this.objectiveElement);
    document.querySelector('#game').before(this.element);
    scene.events.once('shutdown',()=>this.element.remove());
    this.render();
  }
  render() {
    if(this.objectiveElement){
      const objective=this.state.objective||'explore';
      const label=objective==='collectPrescription'?coldMorningText.objective:objective==='repairRobot'?robotText.repairObjective:objective==='prescriptionCollection'?robotText.prescriptionObjective:sunnyDayText.objectives[objective];
      if(this.lastObjective!==objective){this.objectiveElement.textContent=sunnyDayText.objectiveLabel(label);this.lastObjective=objective;}
    }
    const value=this.state.hydration, displayed=Math.ceil(value);
    if(this.lastValue===value)return;
    this.lastValue=value;
    this.fill.style.width=`${value}%`;this.fill.dataset.colour=hydrationColour(value);
    this.meter.setAttribute('aria-valuenow',String(displayed));this.percentage.textContent=`${displayed}%`;
  }
}
