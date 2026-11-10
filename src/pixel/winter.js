// One cached colour pass per map; sunny source textures are never modified.
export function seasonalTexture(scene,key){
  if(scene.state?.adventure!=='pharmacyPanic')return key;
  const winterKey=key+'-winter';
  if(scene.textures.exists(winterKey))return winterKey;
  const source=scene.textures.get(key).getSourceImage();
  const texture=scene.textures.createCanvas(winterKey,source.width,source.height),ctx=texture.getContext();
  ctx.drawImage(source,0,0);
  const pixels=ctx.getImageData(0,0,source.width,source.height),d=pixels.data;
  for(let i=0;i<d.length;i+=4){
    const x=(i/4)%source.width,y=Math.floor(i/4/source.width);
    // Preserve recognisable shop colours below the frosted roofs.
    if((key==='willow-lane-environment'&&x>=32&&x<180&&y>=496&&y<608)||
       (key==='birmingham-environment'&&x>=1344&&x<1632&&y>=216&&y<352))continue;
    const r=d[i],g=d[i+1],b=d[i+2];
    if(g>r*1.12&&g>b*1.12){
      // Frosted grass and winter evergreen foliage, preserving pixel texture.
      const light=(r+g+b)/3;d[i]=Math.min(220,light+67);d[i+1]=Math.min(230,light+78);d[i+2]=Math.min(235,light+83);
    }else if(b>r&&b>=g&&r<145){d[i]=Math.min(220,r+63);d[i+1]=Math.min(230,g+66);d[i+2]=Math.min(240,b+68);}
  }
  ctx.putImageData(pixels,0,0);texture.refresh();return winterKey;
}
