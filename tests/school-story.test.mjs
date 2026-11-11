import test from 'node:test';
import assert from 'node:assert/strict';
import { createSchoolDay } from '../src/school/dayModel.js';
import { availableStories,finishStory,storyState } from '../src/school/storyModel.js';
import { schoolStory,schoolCharacters } from '../src/scenarios/schoolStory.js';
import { schoolTimetable } from '../src/settings/schoolDay.js';
import { homes,escort } from '../src/school/SchoolStory.js';
import { schoolSolids,schoolLocation } from '../src/school/layout.js';
const clear=(x,y)=>!schoolSolids.some(r=>x-9<r.x+r.width&&x+9>r.x&&y+4<r.y+r.height&&y+16>r.y);
test('every period has an editable choice event, recognised character and clear room anchor',()=>{
 assert.deepEqual(schoolStory.map(e=>e.id),schoolTimetable.map(p=>p.id));
 for(const e of schoolStory){assert.ok(schoolCharacters[e.actor]);assert.ok(e.choices.length>=2);assert.ok(clear(...e.at),e.id);assert.equal(schoolLocation(e.at[0],e.at[1]+10),e.room);}
 for(const [id,p] of Object.entries(homes))assert.ok(clear(...p),id);
 for(let i=1;i<escort.length;i++){const a=escort[i-1],b=escort[i],steps=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));for(let n=0;n<=steps;n++)assert.ok(clear(a[0]+(b[0]-a[0])*n/steps,a[1]+(b[1]-a[1])*n/steps),'escort route clear');}
});
test('clock advancement never locks earlier conversations and future events remain unavailable',()=>{
 const d=createSchoolDay();assert.deepEqual(availableStories(d).map(e=>e.id),['arrival']);assert.equal(finishStory(d,'science',0),false);
 d.periodIndex=9;assert.equal(availableStories(d).length,10);
 for(const event of schoolStory){assert.equal(finishStory(d,event.id,0),true);assert.equal(finishStory(d,event.id,0),false);}
 assert.equal(availableStories(d).length,0);assert.equal(new Set(d.completedPeriods).size,10);
});
test('every conversational choice records a preference without grades or hydration changes',()=>{
 for(const e of schoolStory)for(let i=0;i<e.choices.length;i++){const d=createSchoolDay();d.periodIndex=9;storyState(d).active=e.id;assert.equal(finishStory(d,e.id,i),true);assert.equal(d.story.choices[e.id],i);assert.equal(d.story.active,null);assert.equal(d.minutes,520);}
 assert.equal(createSchoolDay().story,undefined);
});
