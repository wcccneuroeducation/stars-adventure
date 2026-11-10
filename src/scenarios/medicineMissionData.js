// Fictional examples only. No real medicine names, doses or universal schedules.
export const missionData={
  timeline:[{id:'breakfast',label:'Breakfast',icon:'☀'},{id:'school',label:'School',icon:'▤'},
    {id:'after-school',label:'After school',icon:'⌂'},{id:'evening',label:'Evening',icon:'☾'}],
  reminders:[{id:'phone',label:'Phone alarm',icon:'▣'},{id:'chart',label:'Medicine chart',icon:'▦'},
    {id:'carer',label:'Parent or carer reminder',icon:'☺'},{id:'routine',label:'Link to a daily routine',icon:'↻'}]
};
export const missionText={
  title:'MY MEDICINE MISSION',intro:"Alex has collected their prescription. Let's help Alex make a plan to remember their medicines!",
  fictional:'Alex is a fictional character. This example is not a medicine schedule for you.',
  objective:'Make a medicine reminder plan.',desk:'Press E to make your medicine plan.',deskHint:'Press E or tap INTERACT to make your medicine plan.',
  begin:'Make a plan',close:'Return to bedroom',continue:'Continue',
  routineTitle:'Build a routine',instruction:"Alex's Medicine A: Take once daily at the time agreed in Alex's medicine plan.",
  routinePrompt:'For this fictional example, choose a reminder point Alex could agree in their plan. The time must fit the instructions for that medicine.',
  routineFeedback:'Great! Having a regular routine can make medicines easier to remember. Always follow the instructions for your own medicines.',
  remindersTitle:'Choose reminders',remindersPrompt:'Choose one or more reminders for Alex.',choose:'Use these reminders',
  backup:'Would a backup reminder help too?',backupPrompt:'You can add another reminder or keep your current choices.',keep:'Keep my reminders',
  remindersFeedback:'Good planning! Different reminders work for different people. You can use more than one.',
  forgetTitle:'What if you forget?',forget:"It's later than usual. Alex isn't sure whether they've taken their medicine today.",
  answers:[{id:'extra',label:'A. Take an extra dose just in case.'},{id:'check',label:'B. Check the medicine record or instructions and ask for help if unsure.'},{id:'guess',label:'C. Guess whether the medicine was taken.'}],
  correction:"It's important not to guess or take extra medicine when you're unsure. Check your instructions and ask a parent, carer, pharmacist or healthcare professional for advice.",
  retry:'Try again',safe:'Great thinking! Checking first is safer than guessing.',
  complete:'MISSION COMPLETE!',completeMessage:'Alex has a plan to help remember their medicines!',
  planTitle:"Alex's reminder plan",routineLabel:'Daily reminder point',strategiesLabel:'Reminder strategies',checkLabel:'If unsure: check the record/instructions and ask for help.',
  finish:'Finish adventure',soundOn:'Sound: on',soundOff:'Sound: off',
  adventureTitle:'Adventure Complete — Pharmacy Panic!',subtitle:'You helped MED-BOT, checked a prescription and made a medicine reminder plan!',
  warm:'Great preparation! You remembered to wrap up warm on a cold day.',
  light:'Cold weather can be a challenge. Remember to wear warm layers when heading outside.',
  water:'Good thinking bringing water. Staying hydrated matters even when it’s cold.',
  noWater:"Remember to take a drink with you. It's important to stay hydrated in cold weather too.",
  strategyAdvice:labels=>`Your reminder plan included ${labels}. Finding a routine that works for you can help you remember medicines.`,
  general:"Always follow your own medicine plan. If you're unsure about a medicine, ask your healthcare team.",
  next:'Next Adventure',comingSoon:'Coming Soon — Adventure 3!',selection:'Adventure selection',selectionPrompt:'Choose an adventure to start a new run.',back:'Back'
};
