export const robotLightState=progress=>progress?.available&&!progress.completed?'warning':'normal';
// Each light has a 500ms cycle; opposite phases alternate every 250ms.
export function robotLightColours(progress,elapsed){
  if(robotLightState(progress)==='normal')return [0x71d096,0x71d096];
  return Math.floor(elapsed/250)%2?[0x652b30,0xf15c59]:[0xf15c59,0x652b30];
}
export function addRobotLights(element,progress){
  element.dataset.lightState=robotLightState(progress);
  const lights=document.createElement('span');lights.className='robot-warning-lights';lights.setAttribute('aria-hidden','true');
  lights.append(document.createElement('i'),document.createElement('i'));element.append(lights);
}
