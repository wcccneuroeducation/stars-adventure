import { sunnyDayText } from './sunnyDayText.js';
export const coldMorningText={...sunnyDayText,
  title:'Pharmacy Panic!',eyebrow:'KICKSTART · PHARMACY PANIC!',subtitle:'A cold morning',
  callTitle:'Incoming call – Willow Lane Pharmacy',
  call:["Good morning! It's Willow Lane Pharmacy.","Your prescription is ready to collect. Pop in when you can!"],
  objective:'Collect your prescription from Willow Lane Pharmacy.',
  window:'Frost covers the grass and rooftops. It is a cold winter morning outside.',
  objects:{...sunnyDayText.objects,hat:'Hat'},
  outfits:[{id:'everyday',label:'T-shirt',warm:false},{id:'jumper',label:'Jumper',warm:true},
    {id:'coat',label:'Warm coat',warm:true},{id:'coat-hat',label:'Warm coat and hat',warm:true}],
  pharmacist:["Hello! You must be here to collect your prescription.",
    'Just give me a moment while I get it ready.',
    "That's strange... MED-BOT isn't behaving properly today!"],
  adventure1:'Adventure 1: A Sunny Day',adventure2:'Adventure 2: Pharmacy Panic!'
};
