import{StreetScene}from './StreetScene.js';
import { BedroomScene } from './BedroomScene.js';
import { ParkScene } from './ParkScene.js';
import { PharmacyScene } from './PharmacyScene.js';
import { SchoolScene } from './SchoolScene.js';
import { startNewAdventure } from './scenarios/sunnyDayState.js';
import { coldMorningText } from './scenarios/coldMorningText.js';
const choices=document.createElement('nav');choices.className='adventure-selection';choices.setAttribute('aria-label','Choose adventure');
for(const [id,label] of [['1',coldMorningText.adventure1],['2',coldMorningText.adventure2]]){
 const link=document.createElement('a');link.href=`?adventure=${id}`;link.textContent=label;choices.append(link);
}
document.querySelector('.shell').before(choices);
if(!window.Phaser){document.querySelector('#status').textContent='Could not load the game engine. Check your connection and refresh.';}else{
 const streetPreview = new URLSearchParams(window.location.search).get('scene') === 'street';
 const schoolPreview = new URLSearchParams(window.location.search).get('scene') === 'school';
 new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:540,backgroundColor:'#819873',pixelArt:true,roundPixels:true,callbacks:{preBoot:game=>startNewAdventure(game.registry,new URLSearchParams(window.location.search).get('adventure')==='2'?'pharmacyPanic':'sunnyDay')},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{gravity:{x:0,y:0},debug:false}},scene:schoolPreview?[SchoolScene,BedroomScene,StreetScene,ParkScene,PharmacyScene]:streetPreview?[StreetScene,BedroomScene,ParkScene,PharmacyScene,SchoolScene]:[BedroomScene,StreetScene,ParkScene,PharmacyScene,SchoolScene]});
}
