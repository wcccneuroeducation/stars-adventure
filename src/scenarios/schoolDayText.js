export const schoolDayText={
  title:'School Day Survival',selection:'Adventure 3: School Day Survival',objective:'Explore school and follow your timetable.',
  timetable:'SCHOOL TIMETABLE',close:'Close',continue:'Continue',soundOn:'Bell sound: on',soundOff:'Bell sound: off',
  current:'Current activity',next:'Next activity',destination:'Destination',time:'School time',
  structure:'The timetable is a guide, not a test. You can take breaks, drink, ask for help and move at your own pace. There are no lateness penalties.',
  periodNotice:(label,room)=>`Time for ${label}! Head to ${room}.`,
  finishNotice:'School has finished. You can head to reception at your own pace.',
  arrived:room=>`You have arrived at ${room}.`,arrivalPrompt:'[ E ] CHECK IN FOR THIS ACTIVITY',checkIn:'Check in',
  placeholder:label=>`${label}: you have arrived. This activity is a placeholder for now. You are free to keep exploring or take a break.`,
  acknowledged:'Arrival acknowledged',endNext:'No further activities today',
  completed:'Checked in',
};
