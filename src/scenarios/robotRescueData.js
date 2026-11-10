// Nurse-reviewable educational examples, not an individual's medication list.
export const sortingBins=[
  {id:'infection',label:'Prevent infections'},
  {id:'cells',label:'Support red blood cells'},
  {id:'complications',label:'Reduce sickle cell complications'},
  {id:'pain',label:'Manage pain'},
  {id:'ask',label:'Ask the pharmacist'}
];
export const medicines=[
  {id:'penicillin',name:'Penicillin',bin:'infection',explanation:'Penicillin helps protect against certain bacterial infections.',hint:'Think about protection from bacteria.'},
  {id:'folic',name:'Folic acid',bin:'cells',explanation:'Folic acid helps your body make red blood cells.',hint:'Think about making red blood cells.'},
  {id:'hydroxy',name:'Hydroxycarbamide',bin:'complications',explanation:'Hydroxycarbamide can reduce painful episodes and other complications of sickle cell disease.',hint:'Think about reducing sickle cell complications.'},
  {id:'relief',name:'Prescribed pain relief',bin:'pain',explanation:'Pain relief helps manage pain when used according to your care plan.',hint:'Think about managing pain according to a care plan.'},
  {id:'unknown',name:'Unknown or unlabelled medicine',bin:'ask',explanation:"If you don't recognise a medicine or aren't sure what it is, always check with a pharmacist or healthcare professional.",hint:'Who can help when a medicine is unfamiliar?'}
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
