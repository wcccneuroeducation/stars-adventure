import { futureShopPlot } from '../neighbourhood/willowLayout.js';
export const pharmacyPlot=futureShopPlot;
export const pharmacyEntry={x:2272,y:pharmacyPlot.y+158,facing:'right'};
export const pharmacyZone={x:2160,y:pharmacyPlot.y+152,width:144,height:48};
export const PHARMACY={width:960,height:768,spawn:{x:480,y:672}};
export const pharmacySolids=[
  {x:0,y:0,width:960,height:32},{x:0,y:0,width:32,height:768},
  {x:928,y:0,width:32,height:768},{x:0,y:736,width:960,height:32},
  {x:32,y:256,width:896,height:48}, // Counter separates public and dispensing areas.
  {x:96,y:384,width:64,height:160},{x:800,y:384,width:64,height:160},
  {x:608,y:592,width:144,height:36},{x:32,y:592,width:24,height:96}
];
export const robotZone={id:'robot',x:608,y:304,width:256,height:64};
export const pharmacyObjects=[
  {id:'pharmacist',x:288,y:304,width:128,height:64},
  robotZone, // Public side of the counter; artwork uses this same rectangle.
  {id:'shelf-left',x:160,y:384,width:64,height:160},
  {id:'shelf-right',x:736,y:384,width:64,height:160},
  {id:'exit',x:432,y:688,width:96,height:48}
];
export const nearbyPharmacyObject=(x,y)=>pharmacyObjects.find(r=>x>=r.x&&x<r.x+r.width&&y>=r.y&&y<r.y+r.height);
