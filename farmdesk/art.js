function paint(canvas) {
  if(canvas.dataset.art==='map')drawOperationsMap(canvas);
}

// The seven plotted sites form a schematic, independent of in-game coordinates.
let cachedPlan;
function drawOperationsMap(canvas) {
  const w=1080,h=350,c=canvas.getContext('2d');
  const occupied=new Set(canvas.dataset.occupied.split(',').filter(Boolean).map(Number));
  canvas.width=w*1.5;canvas.height=h*1.5;
  if(cachedPlan?.key===canvas.dataset.occupied){c.drawImage(cachedPlan.image,0,0);return}
  c.scale(1.5,1.5);
  const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#152b25');bg.addColorStop(.54,'#11231f');bg.addColorStop(1,'#172821');c.fillStyle=bg;c.fillRect(0,0,w,h);
  function line(points,color,width=1,fill=null){
    c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
    if(fill){c.closePath();c.fillStyle=fill;c.fill()}
    if(color){c.strokeStyle=color;c.lineWidth=width;c.stroke()}
  }
  // Topographic contour field via marching squares on a deterministic height grid.
  function elevation(x,y){return Math.sin(x/119+y/145)*18+Math.cos(y/77-x/190)*12+Math.sin(x/71+y/94)*5+Math.sin(y/34+x/142)*2.1+22*Math.exp(-((x-250)**2+(y-46)**2)/13000)}
  const step=8,cols=Math.ceil(w/step)+1,rows=Math.ceil(h/step)+1;
  const height=Array.from({length:rows},(_,y)=>Array.from({length:cols},(_,x)=>elevation(x*step,y*step)));
  for(let lev=-39;lev<49;lev+=1.55){
    c.beginPath();
    for(let y=0;y<rows-1;y++)for(let x=0;x<cols-1;x++){
      const v=[height[y][x],height[y][x+1],height[y+1][x+1],height[y+1][x]];
      const corners=[[x*step,y*step],[(x+1)*step,y*step],[(x+1)*step,(y+1)*step],[x*step,(y+1)*step]],p=[];
      for(let e=0;e<4;e++){const j=(e+1)%4;if((v[e]>=lev)===(v[j]>=lev))continue;
        const t=(lev-v[e])/(v[j]-v[e]);p.push([corners[e][0]+(corners[j][0]-corners[e][0])*t,corners[e][1]+(corners[j][1]-corners[e][1])*t])}
      if(p.length>=2){c.moveTo(...p[0]);c.lineTo(...p[1])}if(p.length===4){c.moveTo(...p[2]);c.lineTo(...p[3])}
    }
    c.strokeStyle='#4b756249';c.lineWidth=.86;c.stroke()
  }
  for(let x=0;x<w;x+=32)line([[x,0],[x,h]],'#73907819',.7);
  for(let y=0;y<h;y+=32)line([[0,y],[w,y]],'#73907819',.7);
  for(let x=16;x<w;x+=96)for(let y=16;y<h;y+=96){line([[x-2.5,y],[x+2.5,y]],'#7fa48b61',.8);line([[x,y-2.5],[x,y+2.5]],'#7fa48b61',.8)}
  const road=[[0,238],[112,220],[246,143],[470,167],[595,127],[805,146],[942,100],[1080,112]];
  line(road,'#0c1916',9);line(road,'#526a584f',3);
  locations.forEach(([u,v],index)=>{
    const x=u*w,y=v*h-5,on=occupied.has(index+1);
    const scale=index%2===0?1:.87;
    const pt=(a,b,z=0)=>[x+(a-b)*scale,y+(a+b)*.45*scale-z];
    const face=(points,fill,edge)=>line(points.map(p=>pt(...p)),edge,.9,fill);
    c.save();if(on){const glow=c.createRadialGradient(x,y,1,x,y,80);glow.addColorStop(0,'#baf6782e');glow.addColorStop(1,'#baf67800');c.fillStyle=glow;c.fillRect(x-80,y-80,160,160)}
    const top=on?'#637a47':'#385447',side=on?'#4a673e':'#253d33',edge=on?'#aac883':'#698171';
    const xyz=[[-36,-27],[38,-27],[38,30],[-36,30]];
    face([[-36,30],[38,30],[38,30,-4],[-36,30,-4]],side,edge);
    face([[38,-27],[38,30],[38,30,-4],[38,-27,-4]],side,edge);
    face(xyz,top,edge);
    for(let r=0;r<7;r++){const b=-21+r*7;
      face([[-31,b],[14,b],[14,b+3],[-31,b+3]],on?'#9ebc73':'#5d7763');
      for(let j=0;j<8;j++)line([pt(-29+j*5.7,b+1,1),pt(-29+j*5.7,b+1,3)],on?'#d2e8a3':'#789480',.9)
    }
    // Greenhouse ridges and faceted roofs give each schematic lot its own silhouette.
    const x1=17,x2=33,y1=-20,y2=9,z=9+index%3*3;
    face([[x1,y2],[x2,y2],[x2,y2,z],[x1,y2,z]],on?'#607b52':'#415b4c',edge);
    face([[x2,y1],[x2,y2],[x2,y2,z],[x2,y1,z]],on?'#3f603f':'#304b3d',edge);
    face([[x1,y1,z],[x1,y2,z],[(x1+x2)/2,y2,z+6],[(x1+x2)/2,y1,z+6]],on?'#c5d698':'#718779',edge);
    face([[(x1+x2)/2,y1,z+6],[(x1+x2)/2,y2,z+6],[x2,y2,z],[x2,y1,z]],on?'#879e72':'#586f60',edge);
    for(let b=y1+4;b<y2;b+=6)line([pt(x1,b,z),pt((x1+x2)/2,b,z+6),pt(x2,b,z)],on?'#789466':'#435d4c',.8);
    c.restore()
  });
  const fade=c.createLinearGradient(0,0,0,h);fade.addColorStop(0,'#06100d20');fade.addColorStop(.6,'#06100d00');fade.addColorStop(1,'#06100d35');c.fillStyle=fade;c.fillRect(0,0,w,h);
  const image=document.createElement('canvas');
  image.width=canvas.width;image.height=canvas.height;
  image.getContext('2d').drawImage(canvas,0,0);
  cachedPlan={key:canvas.dataset.occupied,image};
}
