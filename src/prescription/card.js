import { prescriptionData as data,prescriptionText as text } from '../scenarios/prescriptionData.js';
export function openPrescriptionCard(menu,state,onClose=()=>menu.close()){
  if(!state.prescription?.started)return;
  const content=document.createElement('div');content.className='prescription-card';
  const patient=document.createElement('p');patient.textContent=text.patient(data.patient);
  const heading=document.createElement('p');heading.textContent=text.medicines;
  const list=document.createElement('ul');
  data.required.forEach(id=>{const item=document.createElement('li');item.textContent=data.medicines[id];list.append(item);});
  const note=document.createElement('p');note.className='prescription-note';note.textContent=text.disclaimer;
  content.append(patient,heading,list,note);
  menu.show(text.title,'',[{label:text.close,run:onClose}],{content});
}
