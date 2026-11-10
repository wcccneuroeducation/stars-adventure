import test from 'node:test';
import assert from 'node:assert/strict';
import { hydrationSettings as settings } from '../src/settings/hydration.js';
import { advanceHydration, drinkWater, canDrink, clampHydration, hydrationColour, HydrationMovement } from '../src/mechanics/hydration.js';
import { getSunnyDayState, startNewAdventure, collectItem } from '../src/scenarios/sunnyDayState.js';
import { backpackActions, inventoryItemLabel } from '../src/ui/backpack.js';
import { BOTTLE_CAPACITY, bottleSips, refillWaterBottle } from '../src/mechanics/waterBottle.js';
import { streetText } from '../src/scenarios/streetText.js';
import { sunnyDayText as text } from '../src/scenarios/sunnyDayText.js';

const active = { outdoors:true, moving:true, dialogOpen:false, paused:false, focused:true };
const fresh = () => ({ hydration:100, inventory:[] });
const near = (actual, expected) => assert.ok(Math.abs(actual-expected)<0.000001,`${actual} should equal ${expected}`);

test('three seconds of resolved walking applies the configurable rate at different step rates',()=>{
  for(const frames of [30,60,120]) {
    const state=fresh(),tracker=new HydrationMovement(state);tracker.sample(0,0,16,active);
    for(let i=1;i<=frames;i++)tracker.sample(settings.walkingSpeed*3*i/frames,0,3000/frames,active);
    near(state.hydration,100-3*settings.pointsPerSecond);
  }
});

test('standing still and walking into a collision consume nothing',()=>{
  const state=fresh(),tracker=new HydrationMovement(state);tracker.sample(0,0,16,active);
  for(let i=0;i<180;i++)tracker.sample(0,0,1000/60,active);
  assert.equal(state.hydration,100);
  advanceHydration(state,3000,{...active,moving:false});assert.equal(state.hydration,100);
});

test('bedroom, dialogue, menus, paused physics, and unfocused game do not consume hydration',()=>{
  for(const context of [{outdoors:false},{dialogOpen:true},{paused:true},{focused:false},{moving:false}]) {
    const state=fresh();advanceHydration(state,30000,{...active,...context});assert.equal(state.hydration,100);
    const tracker=new HydrationMovement(state);tracker.sample(0,0,16,active);tracker.sample(150,0,1000,{...active,...context});
    assert.equal(state.hydration,100);
  }
});

test('pause resets and scene teleports never cause catch-up depletion',()=>{
  const state=fresh(),tracker=new HydrationMovement(state);tracker.sample(0,0,16,active);
  tracker.reset();tracker.sample(150,0,60000,active);assert.equal(state.hydration,100);
  tracker.sample(2000,0,16,active);assert.equal(state.hydration,100);
  tracker.sample(2002.5,0,1000/60,active);near(state.hydration,100-(1/60)*settings.pointsPerSecond);
});

test('drinking adds 25 points, caps at 100, and consumes one sip while retaining the bottle',()=>{
  const state={hydration:40,inventory:['water','hat'],waterSips:4};
  assert.equal(drinkWater(state),true);assert.equal(state.hydration,65);
  drinkWater(state);assert.equal(state.hydration,90);drinkWater(state);assert.equal(state.hydration,100);
  assert.deepEqual(state.inventory,['water','hat']);
  assert.equal(state.waterSips,1);
});

test('a player without water has no drink action and cannot drink through the helper',()=>{
  const state={hydration:40,inventory:['hat']};assert.equal(canDrink(state),false);
  assert.equal(drinkWater(state),false);assert.equal(state.hydration,40);
  assert.deepEqual(backpackActions(state,()=>{},()=>{}).map(action=>action.label),[text.close]);
});

test('the backpack drink action updates the meter callback without consuming the bottle',()=>{
  const state={hydration:50,inventory:['water'],waterSips:4};let renders=0;
  const actions=backpackActions(state,()=>renders++,()=>{});
  actions.find(action=>action.label===streetText.drink).run();
  assert.equal(state.hydration,75);assert.equal(renders,1);assert.deepEqual(state.inventory,['water']);
  assert.equal(state.waterSips,3);
});

test('hydration is bounded and indicator thresholds match the displayed percentages',()=>{
  const state={hydration:1,inventory:['water']};advanceHydration(state,99999999,active);assert.equal(state.hydration,0);
  assert.equal(clampHydration(-1),0);assert.equal(clampHydration(101),100);
  for(const [value,colour] of [[100,'blue'],[61,'blue'],[60.01,'blue'],[60,'amber'],[31,'amber'],[30.01,'amber'],[30,'red'],[0,'red']])assert.equal(hydrationColour(value),colour);
});

test('scene access preserves hydration and inventory; only a new adventure resets them',()=>{
  const entries=new Map(),registry={has:key=>entries.has(key),get:key=>entries.get(key),set:(key,value)=>entries.set(key,value)};
  const bedroom=getSunnyDayState(registry);assert.equal(bedroom.hydration,100);
  collectItem(bedroom,'water');bedroom.hydration=42;drinkWater(bedroom);
  const savedHydration=bedroom.hydration;
  for(const scene of ['street','bedroom','street','future park']) {
    const state=getSunnyDayState(registry);assert.equal(state,bedroom,scene);assert.equal(state.hydration,savedHydration);assert.deepEqual(state.inventory,['water']);assert.equal(state.waterSips,3);
  }
  const next=startNewAdventure(registry);assert.notEqual(next,bedroom);assert.equal(next.hydration,100);assert.deepEqual(next.inventory,[]);
  assert.equal(next.waterSips,0);
});

test('collecting starts at four sips; duplicate pickups cannot refill a used bottle',()=>{
  const state={hydration:100,inventory:[],waterSips:0};
  collectItem(state,'hat');assert.equal(state.waterSips,0);
  assert.equal(collectItem(state,'water'),true);assert.equal(state.waterSips,4);
  state.waterSips=2;assert.equal(collectItem(state,'water'),false);assert.equal(state.waterSips,2);
});

test('four uses drain 4/4 to 0/4 and the empty bottle remains with a disabled drink action',()=>{
  const state={hydration:0,inventory:['water'],waterSips:4};
  for(let remaining=3;remaining>=0;remaining--){
    assert.equal(drinkWater(state),true);assert.equal(state.waterSips,remaining);
    assert.equal(inventoryItemLabel(state,'water'),`Water Bottle — ${remaining}/4 sips`);
  }
  assert.equal(state.hydration,100);state.hydration=50;
  assert.equal(canDrink(state),false);assert.equal(drinkWater(state),false);
  assert.equal(state.waterSips,0);assert.equal(state.hydration,50);assert.deepEqual(state.inventory,['water']);
  const action=backpackActions(state,()=>assert.fail('Empty bottle must not drink'),()=>{}).find(action=>action.label===streetText.drink);
  assert.equal(action.disabled,true);action.run();assert.equal(state.hydration,50);
});

test('full hydration does not consume a sip, including a stale drink action',()=>{
  const state={hydration:100,inventory:['water'],waterSips:4};
  assert.equal(drinkWater(state),false);assert.equal(state.waterSips,4);
  const action=backpackActions(state,()=>assert.fail('Full hydration must not drink'),()=>{})[0];
  assert.equal(action.disabled,true);action.run();assert.equal(state.waterSips,4);
  state.hydration=99;assert.equal(drinkWater(state),true);assert.equal(state.hydration,100);assert.equal(state.waterSips,3);
});

test('refilling restores capacity without exceeding it or changing hydration or inventory',()=>{
  for(const remaining of [0,1,3,4,20]){
    const state={hydration:40,inventory:['water','hat'],waterSips:remaining};
    assert.equal(refillWaterBottle(state),true);assert.equal(state.waterSips,BOTTLE_CAPACITY);
    refillWaterBottle(state);assert.equal(state.waterSips,4);assert.equal(state.hydration,40);assert.deepEqual(state.inventory,['water','hat']);
  }
  const noBottle={hydration:40,inventory:[],waterSips:0};
  assert.equal(refillWaterBottle(noBottle),false);assert.equal(noBottle.waterSips,0);assert.deepEqual(noBottle.inventory,[]);
  assert.equal(bottleSips({inventory:['water'],waterSips:-2}),0);
  assert.equal(bottleSips({inventory:['water'],waterSips:20}),4);
});

test('state migration initialises old bottles once and never refills empty bottles on scene access',()=>{
  for(const inventory of [[],['water']]){
    const saved={hydration:42,inventory};
    const registry={has:()=>true,get:()=>saved};
    const state=getSunnyDayState(registry);assert.equal(state.waterSips,inventory.length?4:0);
    state.waterSips=0;assert.equal(getSunnyDayState(registry).waterSips,0);assert.equal(state.hydration,42);
  }
});
