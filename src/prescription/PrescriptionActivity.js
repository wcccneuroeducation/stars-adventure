import { prescriptionData as data,prescriptionText as text } from '../scenarios/prescriptionData.js';
import { canStartPrescription,startPrescription,collectPrescriptionMedicine,allMedicinesFound,receivePrescriptionBag } from './model.js';
import { openPrescriptionCard } from './card.js';
export class PrescriptionActivity{
  constructor(scene){this.scene=scene;this.preparing=false;}
  lines(lines,onFinish){
    const s=this.scene;let page=0;
    const show=()=>s.menu.show('Pharmacist',lines[page],[{label:text.continue,run:()=>{if(++page<lines.length)show();else onFinish();}}]);show();
  }
  pharmacist(){
    const s=this.scene;if(!canStartPrescription(s.state))return;
    if(!s.state.prescription){
      startPrescription(s.state);s.hydrationHud.render();
      this.lines([...text.intro,text.disclaimer],()=>openPrescriptionCard(s.menu,s.state));return;
    }
    if(s.state.prescription.bagReceived){this.lines([text.advice,text.homeObjective],()=>s.menu.close());return;}
    if(!allMedicinesFound(s.state)){this.lines([text.reminder],()=>openPrescriptionCard(s.menu,s.state));return;}
    this.lines(text.finalChecks,()=>this.prepareBag());
  }
  shelf(id,message=text.examine){
    const s=this.scene;if(!canStartPrescription(s.state)||!s.state.prescription?.started||s.state.prescription.bagReceived)return;
    const shelf=data.shelves.find(shelf=>shelf.id===id);if(!shelf)return;
    const content=document.createElement('div');content.className='prescription-shelf';
    shelf.items.forEach(medicine=>{
      const button=document.createElement('button');button.type='button';button.className='shelf-medicine';button.dataset.medicine=medicine;
      // Penicillin and Paracetamol intentionally share this appearance: read labels.
      button.textContent=s.state.prescription.found.includes(medicine)?text.collectedLabel(data.medicines[medicine]):data.medicines[medicine];
      button.addEventListener('click',()=>this.examine(id,medicine));content.append(button);
    });
    s.menu.show(shelf.label,message,[
      {label:text.card,run:()=>openPrescriptionCard(s.menu,s.state,()=>this.shelf(id,message))},
      {label:text.close,run:()=>s.menu.close()}
    ],{content});
  }
  examine(shelf,id){
    const s=this.scene;
    s.menu.show(data.medicines[id],text.examine,[
      {label:text.add,disabled:s.state.prescription.found.includes(id),run:()=>{
        const result=collectPrescriptionMedicine(s.state,id);s.hydrationHud.render();
        if(result==='wrong'){
          s.menu.show(data.medicines[id],text.wrong,[
            {label:text.card,run:()=>openPrescriptionCard(s.menu,s.state,()=>this.examine(shelf,id))},
            {label:text.putBack,run:()=>this.shelf(shelf)}
          ]);
        }else this.shelf(shelf,result==='duplicate'?text.duplicate:text.collected(data.medicines[id]));
      }},
      {label:text.putBack,run:()=>this.shelf(shelf)},
      {label:text.card,run:()=>openPrescriptionCard(s.menu,s.state,()=>this.examine(shelf,id))}
    ]);
  }
  prepareBag(){
    const s=this.scene;if(this.preparing||!allMedicinesFound(s.state))return;this.preparing=true;
    const content=document.createElement('div');content.className='preparing-prescription';
    const bag=document.createElement('div');bag.className='prescription-bag';bag.textContent=text.bag;
    const seal=document.createElement('strong');seal.textContent=text.sealed;bag.append(seal);content.append(bag);
    s.menu.show('Pharmacist',text.preparing,[],{required:true,content});
    const parcel=s.add.graphics().setDepth(5).setPosition(340,242);
    parcel.fillStyle(0xf1efda).fillRect(-10,-9,10,9).fillRect(30,-9,10,9)
      .fillStyle(0xdec8a1).fillRect(0,0,30,20).fillStyle(0x477b68).fillRect(0,0,30,4);
    s.tweens.add({targets:parcel,y:236,duration:250,yoyo:true,repeat:2});
    // Scene-owned delay is removed automatically on shutdown. Nothing is lost if interrupted.
    s.time.delayedCall(1500,()=>{
      parcel.destroy();
      receivePrescriptionBag(s.state);this.preparing=false;s.hydrationHud.render();
      this.lines([text.received,text.advice],()=>s.menu.close());
    });
  }
}
