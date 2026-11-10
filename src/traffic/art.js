import { vehicleTypes } from './vehicles.js';
export function createVehicleTextures(scene){
  for(const [type,spec] of Object.entries(vehicleTypes)){
    const {artLength:length,artWidth:width,colour}=spec;
    for(const open of type==='bus'?[false,true]:[false]){
      const key=`traffic-${type}${open?'-open':''}`;if(scene.textures.exists(key))continue;
      const texture=scene.textures.createCanvas(key,spec.length,spec.width);
      const source=document.createElement('canvas');source.width=length;source.height=width;
      const c=source.getContext('2d');c.imageSmoothingEnabled=false;
      const r=(x,y,w,h,fill)=>{c.fillStyle=fill;c.fillRect(x,y,w,h);};
      r(3,0,10,3,'#263d45');r(length-15,0,10,3,'#263d45');r(3,width-3,10,3,'#263d45');r(length-15,width-3,10,3,'#263d45');
      r(0,3,length,width-6,'#293e44');r(2,4,length-4,width-8,colour);r(4,5,length-8,2,'#bac9b0');
      if(type==='bus'){
        for(let x=10;x<88;x+=16){r(x,5,12,6,'#a6c8c0');r(x,22,12,5,'#a6c8c0');}
        r(94,5,7,22,'#8eb9b8');r(72,1,14,4,open?'#223e43':'#c1d9bf');
        r(9,12,79,8,'#243c43');c.fillStyle='#f3df93';c.font='bold 9px monospace';c.textAlign='center';c.fillText('H1 HOSPITAL',49,19);
        if(open){r(72,0,3,5,'#d7cf9e');r(84,0,3,5,'#d7cf9e');}
      }else{
        r(length-18,5,9,width-10,'#8cb8bc');r(9,5,type==='van'?16:8,width-10,type==='van'?'#c0c9bd':'#95b9b8');
        r(length-28,6,8,width-12,colour);r(length-12,width/2-1,4,2,'#d9d1a8');
      }
      r(length-3,5,2,4,'#f4e4a9');r(length-3,width-9,2,4,'#f4e4a9');r(1,5,2,4,'#9b453e');r(1,width-9,2,4,'#9b453e');
      const output=texture.getContext();output.imageSmoothingEnabled=false;output.drawImage(source,0,0,spec.length,spec.width);texture.refresh();
    }
  }
}
