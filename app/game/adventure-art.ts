import { LIGHTS, PLANTS, STONES, MAZE_TOP, MAZE_HEIGHT, MAZE_ROUTE, RIVER_TOP, RIVER_BOTTOM, worldY, objectiveFor, patternSequence, riverSequence, gameCamera, inMaze } from './adventure';
import type { World } from './render';
import type { Look } from './story';
import { personalizePose } from './poses';
import type { FaceAnchor } from './face';
type Tile=HTMLCanvasElement;
// Reviewed on the final 48×64 silhouettes: crouch, water, balance, jump.
// These are anatomical eye centres, independent of skin, feature and cache order.
export const INTERACTION_ANCHORS:readonly (readonly FaceAnchor[])[]=[
 [{eyes:[14,25],y:37,offsets:[0,-2]},{eyes:[13,23],y:36,offsets:[0,-3],lensWidth:4,lensHeight:4},{eyes:[14,24],y:29,offsets:[0,-2]},{eyes:[16,25],y:26,offsets:[0,-2]}],
 [{eyes:[14,26],y:34,offsets:[0,-2]},{eyes:[14,24],y:37,offsets:[0,-2],lensWidth:4,lensHeight:4},{eyes:[14,26],y:28,offsets:[0,-2]},{eyes:[16,26],y:24,offsets:[0,-1]}],
 [{eyes:[14,26],y:32,offsets:[0,-1]},{eyes:[14,25],y:35,offsets:[0,-3],lensWidth:4,lensHeight:4},{eyes:[15,25],y:27,offsets:[0,-2]},{eyes:[15,26],y:27,offsets:[0,-2]}],
];
export const canvas=(width:number,height:number)=>{const c=document.createElement('canvas');c.width=width;c.height=height;return c;};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export function glow(c:CanvasRenderingContext2D,x:number,y:number,r:number,alpha=.3){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(180,224,255,${alpha})`);g.addColorStop(1,'rgba(180,224,255,0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}
// Edge alpha follows irregular leaves, preserving crisp pixel coordinates.
function mapTile(image:HTMLImageElement,width:number,height:number,edges=true,natural=false){const tile=canvas(width,height+(edges?40:0)),c=tile.getContext('2d')!;c.imageSmoothingEnabled=false;
 if(!edges)c.drawImage(image,0,0,width,height);
 else if(natural)c.drawImage(image,0,20,width,height);
 else{const band=48,sy=image.height*band/height;c.drawImage(image,0,0,image.width,sy,0,0,width,band+20);c.drawImage(image,0,sy,image.width,image.height-2*sy,0,band+20,width,height-2*band);c.drawImage(image,0,image.height-sy,image.width,sy,0,height-band+20,width,band+20);}
 if(edges){c.globalCompositeOperation='destination-out';for(let x=0;x<width;x++){const edge=Math.round(9+Math.sin(x*.067)*5+Math.sin(x*.173)*3);for(let y=0;y<edge+12;y++){c.fillStyle=`rgba(0,0,0,${clamp((edge+12-y)/12)})`;c.fillRect(x,y+(natural?20:0),1,1);c.fillRect(x,tile.height-y-1-(natural?20:0),1,1);}}c.globalCompositeOperation='source-over';}return tile;}
function sheet(image:HTMLImageElement,cols:number,rows:number,width:number,height:number,bounds?:number[]){const result:Tile[][]=[];for(let row=0;row<rows;row++){result[row]=[];for(let col=0;col<cols;col++){const tile=canvas(width,height),c=tile.getContext('2d')!;c.imageSmoothingEnabled=false;const y=bounds?bounds[row]*image.height/1254:row*image.height/rows,h=bounds?(bounds[row+1]-bounds[row])*image.height/1254:image.height/rows;c.drawImage(image,Math.round(col*image.width/cols),Math.round(y),Math.floor(image.width/cols),Math.floor(h),0,0,width,height);result[row][col]=tile;}}return result;}
export class AdventureArt{
 mazeJoin!:Tile;riverJoin!:Tile;
 grove!:Tile;bridge!:Tile;maze!:Tile;river!:Tile;constellation!:Tile;spirits:Tile[][]=[];plants:Tile[][]=[];poses:{tile:Tile;anchor:FaceAnchor}[][]=[];private variants=new Map<string,Tile>();
 async load(load:(p:string)=>Promise<HTMLImageElement>){
  const [grove,bridge,maze,river,clearing,spirits,plants,poses]=await Promise.all(['spirit-grove','grove-bridge','compact-moon-maze','river-trial','constellation-grove','crescent-spirits','lunar-plants','interaction-poses'].map(p=>load(`/assets/${p}.png`)));
  this.grove=mapTile(grove,640,360);this.bridge=mapTile(bridge,640,110);this.maze=mapTile(maze,640,MAZE_HEIGHT,true,true);
  this.river=mapTile(river,640,360,true,true);this.constellation=mapTile(clearing,640,240);this.spirits=sheet(spirits,3,3,28,28);this.plants=sheet(plants,3,3,80,88,[0,418,796,1254]);this.extract(poses);
  const join=(image:HTMLImageElement,top:number,bottom:number)=>{
   const tile=canvas(640,360),ctx=tile.getContext('2d')!;ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0,640,360);
   const d=ctx.getImageData(0,0,640,360);for(let y=0;y<360;y++)for(let x=0;x<640;x++){const wave=Math.round(Math.sin(x*.063)*3+Math.sin(x*.137)*2);d.data[(y*640+x)*4+3]*=clamp(Math.min((y-top-wave)/9,(bottom-y+wave)/9));}ctx.putImageData(d,0,0);return tile;
  };
  this.mazeJoin=join(await load('/assets/maze-exit-repaired.png'),75,235);
  this.riverJoin=join(await load('/assets/river-exit-repaired.png'),170,260);
 }
 private extract(image:HTMLImageElement){
  // Each cell is isolated before keying and personalization. No shared transforms.
  for(let row=0;row<3;row++){this.poses[row]=[];for(let col=0;col<4;col++){
   const rows=[0,435,835,1254].map(y=>Math.round(y*image.height/1254)),sw=Math.floor(image.width/4),sh=rows[row+1]-rows[row],raw=canvas(sw,sh),c=raw.getContext('2d',{willReadFrequently:true})!;c.drawImage(image,-col*sw,-rows[row]);const d=c.getImageData(0,0,sw,sh),p=d.data;
   let x0=sw,y0=sh,x1=0,y1=0;
   for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){const i=(y*sw+x)*4;if(p[i+1]>80&&p[i+1]>p[i]*1.4&&p[i+1]>p[i+2]*1.4)p[i+3]=0;if(p[i+3]>80){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}c.putImageData(d,0,0);
   const tile=canvas(48,64),tc=tile.getContext('2d',{willReadFrequently:true})!;tc.imageSmoothingEnabled=false;const scale=Math.min(46/(x1-x0+1),60/(y1-y0+1)),w=Math.round((x1-x0+1)*scale),h=Math.round((y1-y0+1)*scale),left=Math.floor((48-w)/2),top=64-h;tc.drawImage(raw,x0,y0,x1-x0+1,y1-y0+1,left,top,w,h);
   this.poses[row][col]={tile,anchor:INTERACTION_ANCHORS[row][col]};
  }}
 }
 pose(look:Look,index:number){const key=`${look.outfit}/${look.skin}/${look.face}/${index}`;if(!this.variants.has(key)){const src=this.poses[['real','artist','explorer'].indexOf(look.outfit)][index];this.variants.set(key,personalizePose(src.tile,src.anchor,look));}return this.variants.get(key)!;}
 foreground(c:CanvasRenderingContext2D,w:World,cam:number){
  if(w.progress<7)return;const q=w.challenges!,s=q.cinema,seq=patternSequence(q);
  const lit=s?.kind==='patternDemo'?seq[Math.min(seq.length-1,Math.floor(s.time/s.duration*seq.length))]:q.feedback>0?seq[Math.max(0,q.patternStep-1)]:-1;
  for(const [i,p] of PLANTS.entries()){if(w.y>=p.y||Math.abs(w.x-p.x)>65||p.y-cam<0||p.y-cam>450)continue;const state=q.pattern==='done'||seq.slice(0,q.patternStep).includes(i as never)?2:lit===i?1:0;c.drawImage(this.plants[state][i],p.x-40,p.y-cam-84);}
 }
 camera(w:World){
  const q=w.challenges!,s=q.cinema,focus=q.riverFocus||0;
  if(!s)return {y:Math.round(gameCamera(w.y)+(w.y-180-gameCamera(w.y))*focus),x:Math.round(w.x),close:focus};
  let target={x:w.x,y:w.y-24};
  if(s.kind==='spirit')target=LIGHTS[s.index];
  if(s.kind==='ritual')target={x:365,y:195};
  if(s.kind==='bloom2')target={x:360,y:worldY(-560)};
  if(s.kind==='bloom3')target={x:342,y:worldY(-1320)};
  if(s.kind==='bookReveal')target={x:461,y:worldY(-382)};
  if(s.kind==='riverDemo')target={x:320,y:RIVER_TOP+180};
  if(s.kind==='patternDemo'||s.kind==='constellation')target={x:295,y:worldY(-1240)};
  if(s.kind==='riverError')return {y:Math.round(w.y-180),x:Math.round(w.x),close:1};
  const envelope=clamp(s.time/.6)*clamp((s.duration-s.time)/.6),y=Math.round(gameCamera(s.origin.y)+(target.y-180-gameCamera(s.origin.y))*envelope);
  return {y,x:target.x,close:['riverDemo','patternDemo','constellation','bookReveal'].includes(s.kind)?0:envelope};
 }
 draw(c:CanvasRenderingContext2D,w:World,cam:number){const q=w.challenges!,s=q.cinema;c.save();c.translate(0,-cam);
  if(!w.bloomed)LIGHTS.forEach((p,i)=>{const active=s?.kind==='spirit'&&s.index===i,ritual=s?.kind==='ritual',t=s?.time||0,phase=Math.floor(w.time*3+i)%3;
   let x=p.x,y=p.y-22+Math.sin(w.time*1.8+i)*3,a=.7;
   if(q.lights[i]){const angle=w.time*.65+i*2.094;x=w.x+Math.cos(angle)*39;y=w.y-37+Math.sin(angle)*24;a=1;if(ritual){const entry=clamp((t-.6-i*.8)/1.1);x=365+Math.cos(t*3+i*2.094)*48*(1-entry);y=194+Math.sin(t*3+i*2.094)*24*(1-entry);a=1-entry;}}
   if(active){y-=clamp((t-.5)/2)*24;a=clamp(t/.65);}
   c.globalAlpha=a;glow(c,x,y,20,q.searchTime>25?.35:.16);c.drawImage(this.spirits[phase][i],Math.round(x)-14,Math.round(y)-14);
   // The environment is in front of the hidden half of the spirit.
   if(!q.lights[i]&&!active){const sy=p.y-360+20;c.drawImage(this.grove,p.x-16,sy-15,32,14,p.x-16,p.y-15,32,14);}
   if(active&&i<2){
    const opening=clamp(t/1.7),shift=Math.round(Math.sin(opening*Math.PI/2)*13),sy=p.y-340;
    c.save();c.globalAlpha=1-opening*.9;
    for(const side of [-1,1]){const sx=p.x+(side<0?-28:0);c.drawImage(this.grove,sx,sy-24,28,27,sx+side*shift,p.y-24,28,27);}
    c.restore();
    for(let n=0;n<5;n++){const f=clamp((t-.25-n*.09)/2);c.globalAlpha=Math.sin(f*Math.PI)*.65;c.fillStyle=i===1?'#d4e7ff':'#6899bc';c.fillRect(Math.round(p.x+Math.cos(n*1.7)*f*36),Math.round(p.y-18-f*24+f*f*12),3,2);}
   }
   if(active&&i===2){for(let ring=0;ring<3;ring++){const f=(t*.6+ring/3)%1;c.strokeStyle=`rgba(195,233,255,${(1-f)*.65})`;c.beginPath();c.ellipse(p.x,p.y-3,8+f*32,3+f*9,0,0,Math.PI*2);c.stroke();}}
   c.globalAlpha=1;
   if(!q.lights[i]||active)for(let n=0;n<7;n++){const a=(w.time*.35+n/7)%1;c.globalAlpha=(1-a)*(q.searchTime>25?.8:.3);c.fillStyle='#c1e8ff';c.fillRect(Math.round(p.x+Math.sin(n*2.4)*18),Math.round(p.y-10-a*33),1+n%2,1);}c.globalAlpha=1;
  });
  if(inMaze(w.y)){const help=q.mazeTime>=105?3:q.mazeTime>=75?2:q.mazeTime>=45?1:0;for(const [i,p] of MAZE_ROUTE.entries()){if(i===0||i>7)continue;const y=p.y+MAZE_TOP;c.save();c.globalAlpha=help?.1+Math.sin(w.time+i)*.025:.035;const beam=c.createLinearGradient(p.x-55,y-135,p.x,y);beam.addColorStop(0,'#deecff');beam.addColorStop(1,'rgba(196,225,255,0)');c.fillStyle=beam;c.beginPath();c.moveTo(p.x-70,y-135);c.lineTo(p.x-25,y-135);c.lineTo(p.x+30,y+20);c.lineTo(p.x-30,y+20);c.fill();c.restore();if(help>=2)for(let j=0;j<5;j++){const t=(w.time*.2+j/5)%1,next=MAZE_ROUTE[i+1]||p;c.fillStyle='rgba(175,208,234,.55)';c.fillRect(Math.round(p.x+(next.x-p.x)*t),Math.round(y+(next.y-p.y)*t),3,1);}}}
  const demo=s?.kind==='riverDemo';if(w.progress>=3&&w.y<RIVER_BOTTOM_SAFE&&w.y>RIVER_TOP-80){
   const cue=demo?Math.min(9,Math.floor(s.time/s.duration*10)):-1,idx=cue>=0?riverSequence(q)[cue%5]:-1;
   for(let i=0;i<24;i++){const x=160+i*71%320,y=RIVER_TOP+110+i*39%142;c.globalAlpha=.12+Math.sin(w.time*2+i)*.08;c.fillStyle='#b7d9ff';c.fillRect(x,Math.round(y),4+i%5,1);}c.globalAlpha=1;
   if(idx>=0){const p=STONES[idx],prev=STONES[riverSequence(q)[Math.max(0,cue%5-1)]],t=clamp((s!.time/s!.duration*10)%1/.65),x=prev.x+(p.x-prev.x)*t,y=prev.y+(p.y-prev.y)*t;glow(c,p.x,p.y-8,30,.38);c.strokeStyle='rgba(193,227,255,.7)';c.lineWidth=1;c.beginPath();c.ellipse(p.x,p.y+9,22+Math.sin(w.time*4)*3,7,0,0,Math.PI*2);c.stroke();for(let j=0;j<6;j++){const xx=x+Math.cos(w.time*3+j)*11,yy=y-15+Math.sin(w.time*3+j)*7;glow(c,xx,yy,5,.4);c.fillStyle='#fff0c8';c.fillRect(Math.round(xx),Math.round(yy),2,2);}}
   if(s?.kind==='riverError'){
    const p=STONES[s.index],t=s.time,depth=Math.round(Math.min(1,t/1.1)*31);
    // The original rock descends into a matching patch of water, clipped at the surface.
    c.save();c.beginPath();c.ellipse(p.x,p.y-1,32,23,0,0,Math.PI*2);c.clip();
    c.drawImage(this.river,170,195,64,46,p.x-32,p.y-24,64,46);
    c.save();c.beginPath();c.rect(p.x-32,p.y-30,64,44);c.clip();
    c.drawImage(this.river,p.x-32,p.y-RIVER_TOP-24+20,64,46,p.x-32,p.y-24+depth,64,46);c.restore();c.restore();
    for(let i=0;i<4;i++){c.strokeStyle=`rgba(182,225,255,${Math.max(0,.6-t*.15)})`;c.beginPath();c.ellipse(p.x,p.y+6,20+t*12+i*5,5+t*3+i*2,0,0,Math.PI*2);c.stroke();}
    for(let i=0;i<8;i++){const age=clamp(t/1.3),a=i*Math.PI/4;c.fillStyle=`rgba(196,234,255,${1-age})`;c.fillRect(Math.round(p.x+Math.cos(a)*age*32),Math.round(p.y+Math.sin(a)*age*9-Math.sin(age*Math.PI)*14),2,3);}
   }
  }
  if(w.progress>=7){const seq=patternSequence(q),lit=s?.kind==='patternDemo'?seq[Math.min(seq.length-1,Math.floor(s.time/s.duration*seq.length))]:q.feedback>0?seq[Math.max(0,q.patternStep-1)]:-1;
   const fading=q.pattern==='showing'&&q.feedback>0&&(q.fadeSteps||0)>0;
   const steps=q.pattern==='done'?seq.length:fading?q.fadeSteps!:q.patternStep;
   c.save();if(fading)c.globalAlpha=q.feedback;
   for(let i=1;i<steps;i++){const a=PLANTS[seq[i-1]],b=PLANTS[seq[i]];c.strokeStyle='rgba(168,217,255,.65)';c.lineWidth=2;c.beginPath();c.moveTo(a.x,a.y-29);c.quadraticCurveTo((a.x+b.x)/2,(a.y+b.y)/2-50,b.x,b.y-29);c.stroke();for(let j=0;j<6;j++){const t=(w.time*.6+j/6)%1;glow(c,a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t-29,5,.2);}}c.restore();
   PLANTS.forEach((p,i)=>{const state=q.pattern==='done'||seq.slice(0,q.patternStep).includes(i as never)?2:lit===i?1:0;glow(c,p.x,p.y-40,state?51:32,state?.26:.09);c.drawImage(this.plants[state][i],p.x-40,p.y-84);});
   if(s?.kind==='constellation'){const t=clamp(s.time/s.duration),x=295+(342-295)*t,y=worldY(-1240)+(worldY(-1320)-worldY(-1240))*t;glow(c,x,y-25,45,.3*Math.sin(t*Math.PI));}
  }
  const edgeHelp=!w.bloomed?q.searchTime>=50:inMaze(w.y)?q.mazeTime>=105:q.idle>=45;if(edgeHelp&&!s&&!w.motion&&!w.reading&&w.scene==='forest'){const p=objectiveFor(w).target;glow(c,Math.max(24,Math.min(616,p.x)),Math.max(cam+95,Math.min(cam+330,p.y))-12,24,.25+Math.sin(w.time*2)*.08);}
 c.restore();}
}
const RIVER_BOTTOM_SAFE=RIVER_BOTTOM+40;
