import { schoolStory } from '../scenarios/schoolStory.js';
import { schoolTimetable } from '../settings/schoolDay.js';
export function storyState(day){return day.story??={completed:[],choices:{},active:null,jayRoute:0};}
export function availableStories(day){const s=storyState(day);return schoolStory.filter(e=>schoolTimetable.findIndex(p=>p.id===e.id)<=day.periodIndex&&!s.completed.includes(e.id));}
export function finishStory(day,id,choice){
 const s=storyState(day),event=availableStories(day).find(e=>e.id===id);
 if(!event||!event.choices[choice])return false;
 s.completed.push(id);s.choices[id]=choice;s.active=null;
 if(!day.completedPeriods.includes(id))day.completedPeriods.push(id);
 return true;
}
