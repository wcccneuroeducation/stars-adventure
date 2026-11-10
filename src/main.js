import{StreetScene}from './StreetScene.js';
if(!window.Phaser){document.querySelector('#status').textContent='Could not load the game engine. Check your connection and refresh.';}else{
 new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:540,backgroundColor:'#819873',pixelArt:true,roundPixels:true,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{gravity:{x:0,y:0},debug:false}},scene:[StreetScene]});
}
