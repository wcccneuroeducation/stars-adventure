// 390 simulated minutes / 24 = 16 minutes 15 seconds of active play.
export const schoolDaySettings={simulatedSecondsPerSecond:24,maxFrameMs:250};
export const schoolTimetable=[
  {id:'arrival',time:'08:40',label:'Arrive at school',room:'reception',bell:false},
  {id:'registration',time:'08:50',label:'Registration',room:'classroom-1',bell:true},
  {id:'science',time:'09:10',label:'Lesson 1: Science',room:'science',bell:true},
  {id:'english',time:'10:10',label:'Lesson 2: English',room:'classroom-1',bell:true},
  {id:'break',time:'11:10',label:'Morning break',room:'courtyard',bell:true},
  {id:'maths',time:'11:30',label:'Lesson 3: Maths',room:'classroom-2',bell:true},
  {id:'lunch',time:'12:30',label:'Lunch',room:'canteen',bell:true},
  {id:'pe',time:'13:15',label:'Lesson 4: PE',room:'sports',bell:true},
  {id:'development',time:'14:15',label:'Lesson 5: Personal Development',room:'library',bell:true},
  {id:'finish',time:'15:10',label:'End of school',room:'reception',bell:true}
];
