// Fictional observation activity. No doses, frequencies or personal treatment advice.
export const prescriptionData={
  patient:'Alex (fictional)',
  required:['penicillin','folic','hydroxy'],
  medicines:{penicillin:'Penicillin',folic:'Folic acid',hydroxy:'Hydroxycarbamide',paracetamol:'Paracetamol',cetirizine:'Cetirizine',omeprazole:'Omeprazole'},
  shelves:[
    {id:'shelf-left',label:'Shelf A',items:['penicillin','paracetamol','cetirizine']},
    {id:'shelf-right',label:'Shelf B',items:['folic','hydroxy','omeprazole']}
  ]
};
export const prescriptionText={
  title:"Alex's prescription",patient:name=>`Patient: ${name}`,medicines:'Medicines:',
  disclaimer:'Alex is a fictional character. This is an educational activity. The pharmacist is responsible for checking and dispensing all medicines.',
  intro:["Thanks for helping with MED-BOT! Now I need a hand finding a few medicines.","Here's Alex's prescription. Can you help me check the shelf labels?"],
  findObjective:"Find the medicines on Alex's prescription.",returnObjective:'Return to the pharmacist.',homeObjective:'Take the prescription home.',
  basket:count=>`Medicines found: ${count}/3`,card:'Prescription card',close:'Close',continue:'Continue',
  prompt:'Press E to examine shelf.',hint:'Press E or tap INTERACT to examine shelf.',
  examine:'Read the labels and compare them with Alex’s prescription.',add:'Add to basket',putBack:'Put back',
  wrong:"That one isn't on Alex's list. Let's check the prescription again.",
  duplicate:'This medicine is already in the basket.',collected:name=>`${name} is in the basket.`,
  collectedLabel:name=>`${name} — in basket`,
  reminder:"Check the shelf labels against Alex's prescription, then bring the basket back to me.",
  finalChecks:["Excellent! You've checked the names carefully.","I'll complete the final checks and prepare Alex's prescription."],
  preparing:'The pharmacist checks the labels and prepares a sealed prescription bag.',
  bag:'Fictional prescription bag',sealed:'SEALED',received:"You receive Alex's fictional prescription bag.",
  advice:"Always check your own medicines and ask if something doesn't look right.",
  home:"Now let's think about remembering medicines.",robotReminder:'BEEP BOOP! Sorting circuits restored! Speak to the pharmacist about the prescription.'
};
