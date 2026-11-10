import { prescriptionData as data } from '../scenarios/prescriptionData.js';
export const canStartPrescription=state=>state.adventure==='pharmacyPanic'&&state.robotRescue?.completed===true;
export function startPrescription(state){
  if(!canStartPrescription(state))return false;
  state.prescription??={started:true,found:[],bagReceived:false,homeMessageSeen:false};
  if(!state.prescription.bagReceived)state.objective=allMedicinesFound(state)?'returnPharmacist':'findPrescription';
  return true;
}
export const allMedicinesFound=state=>data.required.every(id=>state.prescription?.found.includes(id));
export function collectPrescriptionMedicine(state,id){
  if(!canStartPrescription(state)||!state.prescription?.started||state.prescription.bagReceived)return 'locked';
  if(!data.required.includes(id))return 'wrong';
  if(state.prescription.found.includes(id))return 'duplicate';
  state.prescription.found.push(id);
  if(allMedicinesFound(state))state.objective='returnPharmacist';
  return 'collected';
}
export function receivePrescriptionBag(state){
  if(!canStartPrescription(state)||!allMedicinesFound(state)||state.prescription.bagReceived)return false;
  state.prescription.bagReceived=true;state.objective='takePrescriptionHome';
  state.inventory??=[];if(!state.inventory.includes('prescriptionBag'))state.inventory.push('prescriptionBag');return true;
}
