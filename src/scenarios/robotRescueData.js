// Nurse-reviewable educational examples, not an individual's medication list.
export const sortingBins=[
  {id:'infection',label:'Prevent infections'},
  {id:'cells',label:'Support red blood cells'},
  {id:'complications',label:'Reduce sickle cell complications'},
  {id:'pain',label:'Manage pain'},
  {id:'ask',label:'Other / Ask Pharmacist'}
];
export const medicines=[
  {id:'penicillin',name:'Penicillin',bin:'infection',explanation:'Penicillin helps protect against certain bacterial infections.',hint:'Think about protection from bacteria.'},
  {id:'folic',name:'Folic acid',bin:'cells',explanation:'Folic acid helps your body make red blood cells.',hint:'Think about making red blood cells.'},
  {id:'hydroxy',name:'Hydroxycarbamide',bin:'complications',explanation:'Hydroxycarbamide can reduce painful episodes and other complications.',hint:'Think about reducing sickle cell complications.'},
  {id:'paracetamol',name:'Paracetamol',bin:'pain',explanation:'Paracetamol is a medicine used to help relieve pain.',hint:'Think about relieving pain.'},
  {id:'ibuprofen',name:'Ibuprofen',bin:'pain',explanation:"Ibuprofen helps relieve pain and inflammation. It isn't suitable for everyone, including some people with kidney problems.",hint:'Think about pain and inflammation.'},
  {id:'morphine',name:'Morphine',bin:'pain',explanation:'Morphine is a strong pain medicine used for more severe pain under an individual treatment plan.',hint:'Think about managing more severe pain under a treatment plan.'},
  {id:'cetirizine',name:'Cetirizine',bin:'ask',explanation:'Cetirizine is an antihistamine commonly used for allergies.',hint:'Allergies are a different usual purpose from the four named categories. You can ask the pharmacist.'},
  {id:'omeprazole',name:'Omeprazole',bin:'ask',explanation:'Omeprazole reduces stomach acid.',hint:'Reducing stomach acid is a different usual purpose from the four named categories.'},
  {id:'salbutamol',name:'Salbutamol inhaler',bin:'ask',explanation:'Salbutamol helps open the airways in conditions such as asthma.',hint:'Opening the airways is a different usual purpose from the four named categories.'}
];
export const robotText={
  title:'MED-BOT 3000 · Robot Rescue',robot:'MED-BOT 3000',error:'SORTING ERROR!',complete:'SORTING COMPLETE!',
  mixed:'Oh no! MED-BOT has mixed up the medicines!',help:'Can you help me sort them into the correct places?',
  instructions:'Select the medicine box, then choose a bin. You can also drag the box into a bin. Take your time.',
  examples:'These are educational examples, not a list of medicines everyone takes. Follow your own care plan.',
  select:'Select medicine box',selected:'Box selected. Choose a bin.',selectFirst:'Select the medicine box first.',
  wrong:'Not quite! Have another look.',hint:'Hint',continue:'Continue',close:'Return to pharmacy',
  progress:'Repair progress',soundOn:'Sound: on',soundOff:'Sound: off',prompt:'[ E ] HELP MED-BOT',
  repairObjective:'Help repair MED-BOT 3000.',prescriptionObjective:'Collect your prescription.',
  robotReplies:['BEEP BOOP! Sorting circuits restored!','Thank you for helping me!'],
  pharmacistReplies:["Brilliant! You've helped us get everything organised again.","Knowing what medicines do is really useful. If you're ever unsure, just ask."],
  next:'Next: Prescription Collection — Coming Soon!'
};
