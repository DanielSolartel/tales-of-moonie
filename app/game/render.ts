import { Direction, FLOWER, Look, Scene, Progress, LANDMARKS, SECOND_FLOWER, THIRD_FLOWER, PATH, cameraY } from './story';
import { Animation, animationFrame, bakeFrame } from './animation';
import { faceAnchor, paintFace } from './face';
import { PHOTO_TIMES, PHOTO_POSE_DURATION, photoFlash, gateRetreat, thirdBloomEnvelope } from './effects';
import { extractPoses, personalizePose } from './poses';
import { extractChest, prepareFinalMap, FinalePoses } from './finale';
import { AdventureArt } from './adventure-art';
import { RIVER_TOP, RIVER_BOTTOM, MAZE_HEIGHT, WORLD_EXTENSION, patternSequence, worldY } from './adventure';
import { Challenges, MAZE_TOP, MAZE_BOTTOM, storyY, PLANTS, LIGHTS } from './challenges';

export type World = { scene:Scene; x:number; y:number; direction:Direction; walking:boolean; time:number; bloomed:boolean; bloomTime:number; dreamTime:number; sleeping:boolean; look:Look; animationTime:number; interactionTime:number; progress:Progress; secondBloomTime:number; reading: 'book1'|'book2'|'book3'|null; thirdBloomTime:number; motion:'fall'|'fallen'|'rise'|null; motionTime:number; starTime:number; simonMet:boolean; simonTime:number; starGreeting:boolean; flowerPulse:boolean; chestTime?:number; finalTime?:number; challenges?:Challenges };
type Tile = HTMLCanvasElement;
const directions:Direction[]=['front','back','left','right'];
const outfits=['real','artist','explorer'];
export class MoonieRenderer {
  loaded=false;
  clearing!:HTMLImageElement;
  classroom!:HTMLImageElement;
  sendero!:HTMLImageElement;
  hiddenPath!:HTMLImageElement;
  private edges:Tile[]=[];
  private finalMap!:Tile;
  private finalMoon!:HTMLImageElement;
  private chest:Tile[]=[];
  finalePoses!:FinalePoses;
  private poses:ReturnType<typeof extractPoses>[]=[];
  private simon:Tile[]=[];
  private books:Tile[][]=[];
  private foliage!:Tile;
  private tiles:Tile[][]=[];
  private seatedTiles:Tile[][]=[];
  private sleepingEyes:{x:number;y:number}[]=[];
  private variants=new Map<string,Tile>();
  private frames=new Map<string,Tile>();
  private seatedVariants=new Map<string,Tile>();
  private guide={x:235,y:-1048,time:0};
  adventure=new AdventureArt();
  private stage?:Tile;
  private foreground:{y:number;draw:()=>void}[]=[];
  bookPages:string[]=[];
  async load() {
    const load=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>{if(typeof img.decode==='function')img.decode().then(()=>resolve(img),reject);else resolve(img);};img.onerror=()=>reject(new Error('No se pudo cargar '+src));img.src=src;});
    const [forest,room,atlas,seatedAtlas,sendero,books,hiddenPath,simon,clearingEdge,hiddenEdge]=await Promise.all([load('/assets/clearing.png'),load('/assets/classroom.png'),load('/assets/atlas.png'),load('/assets/classroom-poses.png'),load('/assets/sendero.png'),load('/assets/books.png'),load('/assets/hidden-path.png'),load('/assets/simon-crisp.png'),load('/assets/clearing-edge.png'),load('/assets/hidden-edge.png')]);
    await Promise.all([this.adventure.load(load),load('/assets/letter-paper.png')]);
    this.clearing=forest;this.classroom=room;this.sendero=sendero;this.hiddenPath=hiddenPath;
    this.edges=[this.edgeTile(clearingEdge,21,678),this.edgeTile(hiddenEdge,23,678)];
    const [realPoses,themedPoses]=await Promise.all([load('/assets/fall-poses-real.png'),load('/assets/fall-poses-themed.png')]);
    this.poses=[extractPoses(realPoses,0),extractPoses(themedPoses,1),extractPoses(themedPoses,2)];
    const [finalMap,finalMoon,chest,finalPoses]=await Promise.all([load('/assets/final-clearing.png'),load('/assets/final-moon.png'),load('/assets/chest.png'),load('/assets/finale-poses.png')]);
    this.finalMap=prepareFinalMap(finalMap);this.finalMoon=finalMoon;this.chest=extractChest(chest);this.finalePoses=new FinalePoses(finalPoses);
    // The approved transparent two-pose sheet, cropped without recoloring.
    for(let pose=0;pose<2;pose++) {
      const cell=document.createElement('canvas');cell.width=Math.floor(simon.width/2);cell.height=simon.height;
      const ctx=cell.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(simon,-pose*cell.width,0);
      const data=ctx.getImageData(0,0,cell.width,cell.height),p=data.data;
      for(let i=0;i<p.length;i+=4)if(p[i+1]>90&&p[i+1]>p[i]*1.35&&p[i+1]>p[i+2]*1.35)p[i+3]=0;
      ctx.putImageData(data,0,0);
      let x0=cell.width,y0=cell.height,x1=0,y1=0;
      for(let y=0;y<cell.height;y++)for(let x=0;x<cell.width;x++)if(p[(y*cell.width+x)*4+3]>40){x0=Math.min(x,x0);x1=Math.max(x,x1);y0=Math.min(y,y0);y1=Math.max(y,y1);}
      const tile=document.createElement('canvas');tile.width=40;tile.height=40;
      const c=tile.getContext('2d')!;c.imageSmoothingEnabled=false;
      const scale=Math.min(40/(x1-x0+1),40/(y1-y0+1)),width=Math.round((x1-x0+1)*scale),height=Math.round((y1-y0+1)*scale);
      c.drawImage(cell,x0,y0,x1-x0+1,y1-y0+1,Math.floor((40-width)/2),40-height,width,height);this.simon.push(tile);
    }
    this.foliage=document.createElement('canvas');this.foliage.width=64;this.foliage.height=28;
    const leaves=this.foliage.getContext('2d',{willReadFrequently:true})!;leaves.imageSmoothingEnabled=false;
    leaves.drawImage(sendero,820/1182*sendero.width,45/1330*sendero.height,260/1182*sendero.width,150/1330*sendero.height,0,0,64,28);
    const leafPixels=leaves.getImageData(0,0,64,28);
    for(let y=0;y<28;y++)for(let x=0;x<64;x++) {
      const edge=[18,12,8,4,2,0,0,0,2,4,8,12,18,24][Math.floor(y/2)];
      if(x<edge||x>=64-edge)leafPixels.data[(y*64+x)*4+3]=0;
    }
    leaves.putImageData(leafPixels,0,0);
    // Reuse the three approved books from their original sheet.
    for(let row=0;row<2;row++) {
      this.books[row]=[];
      for(let col=0;col<3;col++) {
        const tile=document.createElement('canvas');tile.width=512;tile.height=row?340:370;
        const ctx=tile.getContext('2d',{willReadFrequently:true})!;
        ctx.drawImage(books,col*512,row?545:140,512,tile.height,0,0,512,tile.height);
        const data=ctx.getImageData(0,0,512,tile.height),p=data.data;
        const seen=new Uint8Array(512*tile.height),queue:number[]=[];
        const enqueue=(x:number,y:number)=>{
          if(x<0||y<0||x>=512||y>=tile.height)return;
          const pixel=y*512+x;if(seen[pixel])return;seen[pixel]=1;const i=pixel*4;
          if(p[i]<25&&p[i+1]>=20&&p[i+1]<55&&p[i+2]>40&&p[i+2]<95){p[i+3]=0;queue.push(pixel);}
        };
        for(let x=0;x<512;x++){enqueue(x,0);enqueue(x,tile.height-1);}
        for(let y=0;y<tile.height;y++){enqueue(0,y);enqueue(511,y);}
        for(let i=0;i<queue.length;i++){const x=queue[i]%512,y=Math.floor(queue[i]/512);enqueue(x-1,y);enqueue(x+1,y);enqueue(x,y-1);enqueue(x,y+1);}
        ctx.putImageData(data,0,0);this.books[row][col]=tile;
        if(row===1)this.bookPages[col]=tile.toDataURL('image/png');
      }
    }
    const cw=Math.floor(atlas.width/4);
    const rows=[0,345,697,1073,1254].map(v=>Math.round(v*atlas.height/1254));
    for(let row=0;row<4;row++) {
      this.tiles[row]=[];
      for(let col=0;col<4;col++) {
        const ch=rows[row+1]-rows[row];
        const cell=document.createElement('canvas');cell.width=cw;cell.height=ch;
        const cc=cell.getContext('2d',{willReadFrequently:true})!;
        cc.drawImage(atlas,col*cw,rows[row],cw,ch,0,0,cw,ch);
        const imageData=cc.getImageData(0,0,cw,ch),pixels=imageData.data;
        // Runtime color-key rendering for the supplied RGB atlas. Connected exterior
        // gray/white pixels become transparent; enclosed whites in shoes/dress stay.
        const seen=new Uint8Array(cw*ch),queue:number[]=[];
        const enqueue=(x:number,y:number)=>{
          if(x<0||y<0||x>=cw||y>=ch)return;
          const p=y*cw+x;if(seen[p])return;seen[p]=1;
          const i=p*4,r=pixels[i],g=pixels[i+1],b=pixels[i+2];
          if(pixels[i+3]<40||(Math.min(r,g,b)>95&&Math.max(r,g,b)-Math.min(r,g,b)<28)){pixels[i+3]=0;queue.push(p);}
        };
        for(let x=0;x<cw;x++){enqueue(x,0);enqueue(x,ch-1);}
        for(let y=0;y<ch;y++){enqueue(0,y);enqueue(cw-1,y);}
        for(let q=0;q<queue.length;q++){const p=queue[q],x=p%cw,y=Math.floor(p/cw);enqueue(x-1,y);enqueue(x+1,y);enqueue(x,y-1);enqueue(x,y+1);}
        cc.putImageData(imageData,0,0);
        let x0=cw,y0=ch,x1=0,y1=0;
        for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(pixels[(y*cw+x)*4+3]>40){x0=Math.min(x,x0);x1=Math.max(x,x1);y0=Math.min(y,y0);y1=Math.max(y,y1);}
        const tile=document.createElement('canvas');tile.width=Math.max(1,x1-x0+1);tile.height=Math.max(1,y1-y0+1);
        tile.getContext('2d')!.drawImage(cell,x0,y0,tile.width,tile.height,0,0,tile.width,tile.height);
        this.tiles[row][col]=tile;
      }
    }
    const poseWidth=Math.floor(seatedAtlas.width/3),poseHeight=Math.floor(seatedAtlas.height/2);
    for(let row=0;row<2;row++) {
      this.seatedTiles[row]=[];
      for(let col=0;col<3;col++) {
        const cell=document.createElement('canvas');cell.width=poseWidth;cell.height=poseHeight;
        const cc=cell.getContext('2d',{willReadFrequently:true})!;
        cc.drawImage(seatedAtlas,col*poseWidth,row*poseHeight,poseWidth,poseHeight,0,0,poseWidth,poseHeight);
        const data=cc.getImageData(0,0,poseWidth,poseHeight),p=data.data;
        let x0=poseWidth,y0=poseHeight,x1=0,y1=0;
        for(let y=0;y<poseHeight;y++)for(let x=0;x<poseWidth;x++) {
          const i=(y*poseWidth+x)*4,r=p[i],g=p[i+1],b=p[i+2];
          if(g>90&&g>r*1.35&&g>b*1.35)p[i+3]=0;
          if(p[i+3]>40){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
        }
        cc.putImageData(data,0,0);
        const tile=document.createElement('canvas');tile.width=x1-x0+1;tile.height=y1-y0+1;
        tile.getContext('2d')!.drawImage(cell,x0,y0,tile.width,tile.height,0,0,tile.width,tile.height);
        this.seatedTiles[row][col]=tile;
        if(row===1)this.sleepingEyes[col]={x:[396,338,275][col]-x0,y:[252,258,258][col]-y0};
      }
    }
    await Promise.all(this.bookPages.map(load));this.loaded=true;
  }
  private edgeTile(image:HTMLImageElement,top:number,height:number) {
    const tile=document.createElement('canvas');tile.width=640;tile.height=200;
    const ctx=tile.getContext('2d',{willReadFrequently:true})!;ctx.imageSmoothingEnabled=false;
    ctx.drawImage(image,0,top,image.width,height,0,0,640,200);
    const data=ctx.getImageData(0,0,640,200);
    // Irregular leaf-sized boundaries, not reflected rows or stretched canopies.
    // Fully opaque at the old join; original maps survive outside this edge.
    for(let x=0;x<640;x++){
      const upper=13+Math.round(5*Math.sin(x*.047)+4*Math.sin(x*.13));
      const lower=182+Math.round(5*Math.sin(x*.039+2)+3*Math.sin(x*.11));
      for(let y=0;y<200;y++){
        const alpha=Math.max(0,Math.min(1,(y-upper)/12,(lower-y)/12));
        data.data[(y*640+x)*4+3]=Math.round(255*alpha);
      }
    }
    ctx.putImageData(data,0,0);return tile;
  }
  private variant(look:Look,direction:Direction) {
    const key=`${look.outfit}/${look.skin}/${look.face}/${direction}`;
    if(this.variants.has(key))return this.variants.get(key)!;
    const src=this.tiles[outfits.indexOf(look.outfit)][directions.indexOf(direction)];
    const c=document.createElement('canvas');c.width=48;c.height=64;
    const ctx=c.getContext('2d',{willReadFrequently:true})!;ctx.imageSmoothingEnabled=false;
    const w=Math.min(47,src.width/src.height*63);
    ctx.drawImage(src,Math.round((48-w)/2),1,Math.round(w),63);
    const data=ctx.getImageData(0,0,48,64);
    for(let i=0;i<data.data.length;i+=4) {
      const r=data.data[i],g=data.data[i+1],b=data.data[i+2];
      const y=Math.floor(i/4/48);
      // Warm skin palette substitution; do not recolor whites, denim or midnight hair.
      if(r>165&&r-g>10&&g-b>10&&b>45&&data.data[i+3]>0) {
        if(look.skin==='medium'){data.data[i]=r*.80;data.data[i+1]=g*.70;data.data[i+2]=b*.62;}
        if(look.skin==='dark'){data.data[i]=r*.53;data.data[i+1]=g*.42;data.data[i+2]=b*.35;}
      }
      if(look.face!=='cheeks'&&y>20&&y<38&&r>150&&r>g*1.4&&b>g*.85) {
        const base=look.skin==='light'?[242,197,160]:look.skin==='medium'?[195,139,99]:[128,83,54];
        [data.data[i],data.data[i+1],data.data[i+2]]=base;
      }
    }
    ctx.putImageData(data,0,0);
    paintFace(ctx,look,faceAnchor(look,direction));
    this.variants.set(key,c);return c;
  }
  drawCharacter(ctx:CanvasRenderingContext2D,look:Look,direction:Direction,x:number,y:number,scale=1,frame=0,state:Animation='idle') {
    const key=`${look.outfit}/${look.skin}/${look.face}/${direction}/${state}/${frame}`;
    if(!this.frames.has(key)){
      if(state==='fall'||(state==='rise'&&frame<3)){
        const pose=this.poses[outfits.indexOf(look.outfit)][state==='fall'?frame:frame+3];
        this.frames.set(key,personalizePose(pose.tile,pose.anchor,look));
      }else this.frames.set(key,bakeFrame(this.variant(look,direction),state==='rise'?'idle':state,state==='rise'?0:frame,direction==='left'||direction==='right'));
    }
    const tile=this.frames.get(key)!;
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(scale,scale);ctx.imageSmoothingEnabled=false;
    ctx.drawImage(tile,-24,-64);
    ctx.restore();
  }
  preview(canvas:HTMLCanvasElement,look:Look,direction:Direction='front') {
    if(!this.loaded)return;
    const c=canvas.getContext('2d')!;
    c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';
    c.clearRect(0,0,canvas.width,canvas.height);c.imageSmoothingEnabled=false;
    this.drawCharacter(c,look,direction,canvas.width/2,canvas.height-5,Math.min(canvas.width/52,canvas.height/69));
  }
  private glow(c:CanvasRenderingContext2D,x:number,y:number,r:number,color:string) {
    const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
  }
  private drawSecondGate(c:CanvasRenderingContext2D,retreat:number){
    if(retreat>=1)return;
    c.save();c.globalAlpha=1-retreat;
    for(let side=0;side<2;side++)for(let i=0;i<4;i++){
      const sign=side===0?1:-1,root=side===0?287:363;
      const tip=root+sign*(40-i*5)*(1-retreat),y=-635+i*7;
      c.strokeStyle='#142c36';c.lineWidth=4;c.beginPath();c.moveTo(root,y-6);c.quadraticCurveTo(root+sign*17,y+12,tip,y+3);c.stroke();
      c.strokeStyle=i%2?'#355b62':'#254b50';c.lineWidth=2;c.stroke();
      for(let j=1;j<=3;j++){
        const x=root+(tip-root)*j/4,yy=y+3+Math.sin(j+i)*3;
        c.fillStyle=j%2?'#497a7e':'#396064';c.fillRect(Math.round(x),Math.round(yy),5,2);c.fillRect(Math.round(x+sign*2),Math.round(yy-2),3,4);
      }
    }
    c.restore();
  }
  private redrawClassroom(c:CanvasRenderingContext2D,x:number,y:number,width:number,height:number) {
    const sx=x/640*this.classroom.width,sy=y/360*this.classroom.height;
    const sw=width/640*this.classroom.width,sh=height/360*this.classroom.height;
    c.drawImage(this.classroom,sx,sy,sw,sh,x,y,width,height);
  }
  private seatedVariant(look:Look,sleeping:boolean) {
    const key=`${look.outfit}-${look.skin}-${look.face}-${sleeping}`;
    if(this.seatedVariants.has(key))return this.seatedVariants.get(key)!;
    const src=this.seatedTiles[sleeping?1:0][outfits.indexOf(look.outfit)];
    const tile=document.createElement('canvas');tile.width=src.width;tile.height=src.height;
    const ctx=tile.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(src,0,0);
    if(look.skin!=='light') {
      const data=ctx.getImageData(0,0,tile.width,tile.height),p=data.data;
      for(let i=0;i<p.length;i+=4) {
        const r=p[i],g=p[i+1],b=p[i+2];
        if(r>165&&r-g>10&&g-b>10&&b>45&&p[i+3]>0) {
          if(look.skin==='medium'){p[i]=r*.80;p[i+1]=g*.70;p[i+2]=b*.62;}
          if(look.skin==='dark'){p[i]=r*.53;p[i+1]=g*.42;p[i+2]=b*.35;}
        }
      }
      ctx.putImageData(data,0,0);
    }
    // Awake Moonie faces the class: her facial traits are correctly occluded.
    // Sleeping exposes one cheek/eye; place its modular trait in source-local
    // coordinates, independently of the preceding preview or outfit.
    if(sleeping&&look.face!=='cheeks'){
      const eye=this.sleepingEyes[outfits.indexOf(look.outfit)];
      const data=ctx.getImageData(0,0,tile.width,tile.height),p=data.data;
      for(let y=Math.max(0,eye.y);y<Math.min(tile.height,eye.y+45);y++)for(let x=Math.max(0,eye.x-40);x<Math.min(tile.width,eye.x+30);x++){
        const i=(y*tile.width+x)*4,r=p[i],g=p[i+1],b=p[i+2];
        if(r>120&&r>g*1.35&&b>g*.85){const skin=look.skin==='light'?[242,197,160]:look.skin==='medium'?[195,139,99]:[128,83,54];[p[i],p[i+1],p[i+2]]=skin;}
      }
      ctx.putImageData(data,0,0);ctx.save();ctx.translate(eye.x,eye.y);ctx.scale(6,6);paintFace(ctx,look,{eyes:[0],y:0});ctx.restore();
    }
    this.seatedVariants.set(key,tile);return tile;
  }
  private drawSeatedInClass(c:CanvasRenderingContext2D,look:Look,sleeping:boolean) {
    const tile=this.seatedVariant(look,sleeping),height=sleeping?137:142;
    const width=tile.width/tile.height*height,x=sleeping?314:309,bottom=318;
    c.save();c.imageSmoothingEnabled=false;
    c.drawImage(tile,x-width/2,bottom-height,width,height);c.restore();
    // Restoring these foreground fragments places Moonie inside the chair and
    // behind the desk while keeping her head and arms above the desktop.
    this.redrawClassroom(c,219,264,193,15);
    this.redrawClassroom(c,245,271,86,89);
  }
  draw(c:CanvasRenderingContext2D,w:World,reduced=false) {
    if(!this.loaded)return;
    if(!w.challenges||!['forest','letter','closing'].includes(w.scene)){this.drawBase(c,w,reduced);return;}
    const q=w.challenges,view=this.adventure.camera(w),cam=view.y,legacy={...w,y:storyY(w.y)};
    const stage=this.stage||(this.stage=document.createElement('canvas'));stage.width=640;stage.height=360;
    const d=stage.getContext('2d')!;d.imageSmoothingEnabled=false;
    const segment=(top:number,bottom:number,offset:number,omitSign=false)=>{d.save();d.beginPath();d.rect(0,top-cam,640,bottom-top);d.clip();this.drawBase(d,legacy,reduced,cam+offset,true,omitSign);d.restore();};
    segment(MAZE_BOTTOM-20,760,0);
    segment(RIVER_BOTTOM-20,MAZE_TOP+20,MAZE_HEIGHT,true);
    segment(-5000,RIVER_TOP+20,WORLD_EXTENSION,true);
    d.drawImage(this.adventure.grove,0,340-cam);
    d.drawImage(this.adventure.bridge,0,300-cam);
    d.drawImage(this.adventure.maze,0,MAZE_TOP-cam-20);
    // Alpha-fading two independently painted, detailed foliage textures at the maze's
    // entrance produces a hazy "double exposure" band rather than a clean blend, however
    // wide the fade (verified: widening it only spreads the haze). A soft shadow reads
    // instead as the path dipping into denser shade — it doesn't touch the approved exit.
    {const topY=MAZE_BOTTOM-80-cam,botY=MAZE_BOTTOM-2-cam;
     const grad=d.createLinearGradient(0,topY,0,botY);
     grad.addColorStop(0,'rgba(2,7,18,0)');grad.addColorStop(.4,'rgba(2,7,18,.58)');grad.addColorStop(.65,'rgba(2,7,18,.58)');grad.addColorStop(1,'rgba(2,7,18,0)');
     d.fillStyle=grad;d.fillRect(0,topY,640,botY-topY);}
    d.drawImage(this.adventure.river,0,RIVER_TOP-cam-20);
    d.drawImage(this.adventure.mazeJoin,0,MAZE_TOP-185-cam);
    d.drawImage(this.adventure.riverJoin,0,RIVER_TOP-190-cam);
    this.adventure.draw(d,w,cam);
    // All world objects are composited after terrain, never beneath a map edge.
    for(const object of this.foreground){const y=worldY(object.y);if(w.y<y||y<cam-80||y>cam+450)continue;d.save();d.translate(0,y-object.y-cam);object.draw();d.restore();}
    // One world actor draw avoids partial characters at every compositing edge.
    const animation:Animation=w.motion==='rise'?'rise':w.motion?'fall':w.interactionTime>=0?'interact':w.walking?'walk':'idle';
    const frame=w.motion==='fallen'?2:animationFrame(animation,w.motion?w.motionTime:animation==='interact'?w.interactionTime:w.animationTime);
    const s=q.cinema;let pose=-1,arc=0;
    if(s?.kind==='spirit')pose=s.index===2?1:0;
    if(q.river==='jumping'){pose=3;arc=Math.sin(Math.min(1,q.riverTime/.55)*Math.PI)*24;}
    if(s?.kind==='riverError'){pose=s.time<.7?2:3;arc=Math.sin(Math.max(0,Math.min(1,(s.time-.7)/(s.duration-1)))*Math.PI)*48;}
    if(w.scene==='closing')d.drawImage(this.finalePoses.frame(w.look,(w.finalTime||0)>=6.2),Math.round(w.x)-24,Math.round(w.y-cam)-64);
    else if(pose>=0){
      d.fillStyle='rgba(1,9,24,.22)';d.beginPath();d.ellipse(Math.round(w.x),Math.round(w.y-cam),15,4,0,0,Math.PI*2);d.fill();
      d.save();d.translate(Math.round(w.x),Math.round(w.y-cam-arc));
      if(s?.kind==='spirit'&&LIGHTS[s.index].x>w.x)d.scale(-1,1);
      d.drawImage(this.adventure.pose(w.look,pose),-24,-64);d.restore();
    }
    else this.drawCharacter(d,w.look,w.direction,w.x,w.y-cam,1,frame,animation);
    // Restore the approved depth order after drawing the single world actor.
    for(const object of this.foreground){const y=worldY(object.y);if(w.y>=y||y<cam-80||y>cam+450)continue;d.save();d.translate(0,y-object.y-cam);object.draw();d.restore();}
    this.adventure.foreground(d,w,cam);
    c.clearRect(0,0,640,360);c.imageSmoothingEnabled=false;c.drawImage(stage,0,0);
    // Reframe through a brief blue dissolve; never overlay two differently sized actors.
    if(view.close>=.5){const sx=Math.round(Math.max(0,Math.min(320,view.x-160)));c.drawImage(stage,sx,90,320,180,0,0,640,360);}
    if(view.close>0&&view.close<1){c.fillStyle=`rgba(6,16,40,${Math.sin(view.close*Math.PI)*.95})`;c.fillRect(0,0,640,360);}
    if(s){const bars=Math.round(Math.min(1,s.time/.4,(s.duration-s.time)/.4)*19);c.fillStyle='#061027';c.fillRect(0,0,640,bars);c.fillRect(0,360-bars,640,bars);}
    if(w.scene==='closing'){const t=w.finalTime||0;c.fillStyle=`rgba(6,16,40,${Math.max(0,Math.min(1,(t-8)/2))})`;c.fillRect(0,0,640,360);}
  }
  private drawBase(c:CanvasRenderingContext2D,w:World,reduced=false,viewCamera?:number,hideCharacter=false,omitSign=false) {
    if(!this.loaded)return;
    c.clearRect(0,0,640,360);c.imageSmoothingEnabled=false;
    if(w.scene==='end'){
      c.drawImage(this.finalMoon,0,0,640,360);
      const x=503+Math.sin(w.time*.65)*3,y=107+Math.cos(w.time*.5)*4;
      this.glow(c,x,y,32,'rgba(255,222,159,.38)');c.drawImage(this.tiles[3][3],x-8,y-8,16,16);
      for(let i=0;i<7;i++){c.fillStyle=`rgba(255,232,175,${.6-i*.07})`;c.fillRect(Math.round(x+12+i*3),Math.round(y+5+Math.sin(i*.5)*5),2,2);}
      return;
    }
    const isClass=w.scene==='classroom'||w.scene==='dream';
    c.drawImage(isClass?this.classroom:this.clearing,0,0,640,360);
    if(isClass) {
      this.drawSeatedInClass(c,w.look,w.sleeping);
      if(w.sleeping) {
        this.glow(c,355,240,32,'rgba(199,225,255,.45)');
      }
      if(w.scene==='dream') {
        const p=Math.min(1,w.dreamTime/2.6);
        this.glow(c,355,241,30+p*420,`rgba(204,226,255,${p*.9})`);
        c.fillStyle=`rgba(7,13,37,${Math.max(0,(p-.68)/.32)})`;c.fillRect(0,0,640,360);
      }
      return;
    }
    if(w.scene==='title'||w.scene==='customize') {
      this.guide={x:235,y:-1048,time:w.time};
      c.fillStyle='rgba(3,9,29,.32)';c.fillRect(0,0,640,360);
      const t=reduced?0:w.time;
      const star=this.tiles[3][3];
      const sx=163+Math.sin(t*.45)*9,sy=52+Math.cos(t*.6)*7;
      this.glow(c,sx,sy,28,'rgba(255,221,144,.30)');
      c.drawImage(star,sx-8,sy-8,16,16);
    }
    if(w.scene==='forest'||w.scene==='letter'||w.scene==='closing') {
      c.save();c.translate(0,-(viewCamera??(w.bloomed?cameraY(w.y):0)));
      c.drawImage(this.clearing,0,0,640,360);
      c.drawImage(this.sendero,0,-720,640,720);
      c.drawImage(this.hiddenPath,0,-1440,640,720);
      c.drawImage(this.finalMap,0,-1760);
      c.drawImage(this.edges[1],0,-820);
      // World-anchored art is identical when approached from either direction.
      c.drawImage(this.edges[0],0,-100);
      if(w.challenges){
        c.drawImage(this.adventure.constellation,0,-1380);
        // Restore the approved root and its immediate ground at the original
        // world coordinates. The new clearing must not obscure the trip cue.
        c.save();c.beginPath();c.moveTo(282,-1169);c.lineTo(375,-1166);c.lineTo(412,-1127);c.lineTo(392,-1085);c.lineTo(296,-1083);c.lineTo(267,-1122);c.closePath();c.clip();
        c.drawImage(this.hiddenPath,0,-1440,640,720);c.restore();
      }
      const cinematic=w.challenges?.cinema;
      const revealAge=(kind:string,threshold:number)=>cinematic?.kind===kind?Math.max(0,cinematic.time-threshold):0;
      const f=FLOWER,age=w.time-w.bloomTime,ritualAge=revealAge('ritual',2.7);
      const tile=this.tiles[3][w.bloomed?(age<.75?1:2):ritualAge>0?(ritualAge<.6?1:2):0];
      const glow=w.bloomed?.45:.19+Math.min(.3,ritualAge*.3);
      this.glow(c,f.x,f.y-12,36,`rgba(164,212,255,${glow})`);
      const drawFlower=()=>c.drawImage(tile,f.x-16,f.y-32,32,32);
      const secondAge=w.time-w.secondBloomTime,secondOpen=w.progress>=4;
      const flower2=()=>{
        const f2=SECOND_FLOWER;
        const reveal=revealAge('bloom2',.8);
        this.glow(c,f2.x,f2.y-14,38,`rgba(174,220,255,${secondOpen?.5:.19+Math.min(.3,reveal*.3)})`);
        c.drawImage(this.tiles[3][secondOpen?(secondAge<.75?1:2):reveal>0?(reveal<.6?1:2):0],f2.x-16,f2.y-32,32,32);
      };
      const thirdAge=w.time-w.thirdBloomTime,thirdOpen=w.progress===8;
      const flower3=()=>{
        const reveal=revealAge('bloom3',.8),f=THIRD_FLOWER,energy=thirdOpen?thirdBloomEnvelope(thirdAge):Math.min(.7,reveal*.4);
        this.glow(c,f.x,f.y-14,38+energy*(18+Math.sin(thirdAge*4)*5),`rgba(174,220,255,${thirdOpen?.22+energy*.36:.19})`);
        c.drawImage(this.tiles[3][thirdOpen?(thirdAge<.75?1:2):reveal>0?(reveal<.6?1:2):0],f.x-16,f.y-32,32,32);
      };
      const dog=()=>{
        const {x,y}=LANDMARKS.simon,age=w.time-w.simonTime,posed=w.simonMet&&age<PHOTO_POSE_DURATION;
        c.fillStyle='rgba(1,9,24,.28)';c.beginPath();c.ellipse(x,y-1,17,4,0,0,Math.PI*2);c.fill();
        c.save();c.translate(x,y);
        // After posing, turn toward the main path and its flower.
        if(!w.simonMet)c.scale(-1,1);
        c.drawImage(this.simon[posed?1:0],-20,-40);c.restore();
      };
      this.drawSecondGate(c,secondOpen?gateRetreat(secondAge):0);
      const objects=[{y:LANDMARKS.chest.y,draw:()=>{
        const {x,y}=LANDMARKS.chest,age=w.chestTime===undefined?-1:w.time-w.chestTime;
        const pose=age<0?0:age<.75?1:2;
        this.glow(c,x,y-18,45,`rgba(190,225,255,${pose?.32:.12})`);c.drawImage(this.chest[pose],x-29,y-62);
      }},{y:f.y,draw:drawFlower},{y:SECOND_FLOWER.y,draw:flower2},{y:THIRD_FLOWER.y,draw:flower3},{y:LANDMARKS.simon.y,draw:dog},...(['book1','book2','book3'] as const).map((kind,i)=>({y:LANDMARKS[kind].y,draw:()=>{
        const o=LANDMARKS[kind],open=w.reading===kind;
        this.glow(c,o.x,o.y-23,26,'rgba(192,219,255,.14)');
        c.drawImage(this.books[open?1:0][i],o.x-24,o.y-43,48,35);
      }}))];
      if(!hideCharacter)objects.filter(o=>w.y>=o.y).forEach(o=>o.draw());
      c.fillStyle='rgba(1,9,24,.32)';c.beginPath();c.ellipse(Math.round(w.x),Math.round(w.y)-1,15,4,0,0,Math.PI*2);c.fill();
      const animation:Animation=w.motion==='rise'?'rise':w.motion?'fall':w.interactionTime>=0?'interact':w.walking?'walk':'idle';
      const frame=w.motion==='fallen'?2:animationFrame(animation,w.motion?w.motionTime:animation==='interact'?w.interactionTime:w.animationTime);
      if(!hideCharacter){if(w.scene==='closing')c.drawImage(this.finalePoses.frame(w.look,(w.finalTime||0)>=6.2),Math.round(w.x)-24,Math.round(w.y)-64);
      else this.drawCharacter(c,w.look,w.direction,w.x,w.y,1,frame,animation);}
      if(!hideCharacter)objects.filter(o=>w.y<o.y).forEach(o=>o.draw());
      if(hideCharacter)this.foreground=objects;
      if(w.progress>=5) {
        const age=w.time-w.starTime;
        let sx=LANDMARKS.book3.x+40,sy=LANDMARKS.book3.y-48;
        if(w.scene==='closing'){
          const t=w.finalTime||0;
          if(t<3){sx=w.x+Math.cos(t*2.4)*33;sy=w.y-48+Math.sin(t*2.4)*17;}
          else{const p=Math.min(1,(t-3)/3),ease=p*p*(3-2*p);sx=w.x+20+(359-w.x-20)*ease+Math.sin(p*12)*9*(1-p);sy=w.y-48+(-1730-w.y+48)*ease;}
        }
        else if(w.progress===8&&w.y<-1480){sx=320+Math.cos(w.time*1.5)*39;sy=-1648+Math.sin(w.time*1.5)*15;}
        else if(w.progress===8&&w.y<-1340){sx=320;sy=Math.max(-1580,w.y-85);}
        else if(w.challenges?.pattern==='showing'&&w.progress===7){const q=w.challenges,seq=patternSequence(q),s=q.cinema,p=PLANTS[seq[Math.min(seq.length-1,Math.floor(q.patternTime/(s?.duration||4)*seq.length))]];sx=p.x;sy=storyY(p.y)-82;}
        else if(w.starGreeting){sx+=Math.sin(age*2)*14;sy-=Math.max(0,Math.sin(age*2))*26;}
        else if(w.motion==='rise') {sx=w.x+Math.cos(w.time*5)*27;sy=w.y-55+Math.sin(w.time*5)*14;}
        else {
          sy=Math.max(w.progress>=7?-1355:-1190,Math.min(-1020,w.y-90));
          const index=PATH.findIndex((p,i)=>i<PATH.length-1&&p.y>=sy&&PATH[i+1].y<=sy),a=PATH[Math.max(0,index)],b=PATH[Math.max(0,index)+1];
          const t=Math.max(0,Math.min(1,(sy-a.y)/(b.y-a.y)));sx=a.x+(b.x-a.x)*t;
          if(w.progress>=7&&w.y<-1260){sx=THIRD_FLOWER.x+26;sy=THIRD_FLOWER.y-36;}
        }
        const dt=Math.max(0,Math.min(.04,w.time-this.guide.time));this.guide.time=w.time;
        const easing=1-Math.exp(-dt*(w.motion==='rise'?14:5));
        this.guide.x+=(sx-this.guide.x)*easing;this.guide.y+=(sy-this.guide.y)*easing;
        sx=Math.round(this.guide.x);sy=Math.round(this.guide.y+Math.sin(w.time*2)*3);
        const pulse=(age<2.4||w.flowerPulse)?Math.pow(Math.max(0,Math.sin((age%2.4)*Math.PI*2/1.2)),4):.18;
        this.glow(c,sx,sy,24+pulse*9,`rgba(255,219,136,${.22+pulse*.25})`);
        c.drawImage(this.tiles[3][3],sx-8,sy-8,16,16);
        for(let i=1;i<=5;i++){c.globalAlpha=.5-i*.075;c.fillStyle='#ffe4ae';c.fillRect(sx+Math.round(Math.sin(w.time*2-i)*4),sy+8+i*3,2,2);}c.globalAlpha=1;
      }
      // Existing leafy art forms a gate; both halves visibly withdraw on bloom.
      const retreat=thirdOpen?gateRetreat(thirdAge,true):0;
      if(retreat<1) {
        c.globalAlpha=1-retreat;
        // Reuse the first clearing's vine motif, with the same leaves and colors.
        for(let i=0;i<6;i++) {
          const x=295+i*10+(i<3?-1:1)*retreat*35;
          c.strokeStyle=i%2?'#254b50':'#183c41';c.lineWidth=3;
          c.beginPath();c.moveTo(x,-1390);c.quadraticCurveTo(x-7,-1378,x+4,-1368);c.stroke();
          c.fillStyle='#396064';c.fillRect(x-4,-1382+i%3*2,5,3);c.fillRect(x+2,-1375,5,3);
        }
        c.drawImage(this.foliage,258-retreat*20,-1390,37,22);c.drawImage(this.foliage,351+retreat*20,-1390,37,22);c.globalAlpha=1;
      }
      if(thirdOpen&&thirdAge<6) {
        const energy=thirdBloomEnvelope(thirdAge);
        for(let i=0;i<36;i++) {
          const t=i/35,angle=1.05+t*(Math.PI*2-2.1),radius=26+(i%3)*2;
          const reveal=Math.max(0,Math.min(1,(thirdAge-t*.65)/1.8));
          const flutter=Math.sin(thirdAge*3+i)*2*(reduced?.3:1);
          const x=THIRD_FLOWER.x+Math.cos(angle)*radius*reveal+flutter;
          const y=THIRD_FLOWER.y-15-30*reveal+Math.sin(angle)*radius*reveal-Math.max(0,thirdAge-3)*7;
          c.globalAlpha=energy;this.glow(c,x,y,6,'rgba(195,230,255,.3)');c.fillStyle='#e0f4ff';c.fillRect(Math.round(x),Math.round(y),3,1);
        }
        for(let i=0;i<20;i++) {
          const t=(thirdAge*.45+i/20)%1,angle=i*2.4+thirdAge*.25;
          const x=THIRD_FLOWER.x+Math.cos(angle)*(8+t*25),y=THIRD_FLOWER.y-17-t*73;
          c.globalAlpha=energy*(1-t);this.glow(c,x,y,6,'rgba(197,233,255,.34)');c.fillStyle='#e5f7ff';c.fillRect(Math.round(x),Math.round(y),1+i%2,2);
        }
        c.globalAlpha=1;
      }
      // Exact sign wording is typeset over the approved blank wooden sign.
      if(!omitSign){c.drawImage(this.sendero,730/1182*this.sendero.width,710/1330*this.sendero.height,78/1182*this.sendero.width,47/1330*this.sendero.height,380,-340,73,34);
      c.font='bold 7px monospace';c.textAlign='center';c.lineWidth=2;c.strokeStyle='#172235';c.fillStyle='#fff3d7';
      for(const [text,y] of [['Abre bien',-325],['los hojos',-313]] as const){c.strokeText(text,416,y);c.fillText(text,416,y);}c.textAlign='start';}
      // Local water shimmer follows the actual stream and strengthens at bloom.
      for(let i=0;i<34;i++) {
        const x=140+i*83%355,y=-505+i*37%70;
        c.globalAlpha=(.12+(Math.sin(w.time*1.4+i)+1)*.08)*(secondOpen?2:1);
        c.fillStyle=secondOpen?'#d5efff':'#83b5ec';c.fillRect(x,Math.round(y),4+i%5,1);
      }
      c.globalAlpha=1;
      if(secondOpen) {
        this.glow(c,355,-497,53,'rgba(182,225,255,.22)');
        for(let i=0;i<30;i++) {
          const t=(i/30+w.time*.09)%1,x=360+(325-360)*Math.min(1,t*3)+Math.sin(t*19+i)*9,y=-575-t*103;
          this.glow(c,x,y,6,'rgba(184,222,255,.28)');c.fillStyle='#d9f1ff';c.fillRect(Math.round(x),Math.round(y),3,1);
        }
      }
      if(!w.bloomed) {
        for(let i=0;i<6;i++) {
          const x=300+i*10;
          c.strokeStyle=i%2?'#254b50':'#183c41';c.lineWidth=3;
          c.beginPath();c.moveTo(x,84);c.quadraticCurveTo(x-7,96,x+4,106);c.stroke();
          c.fillStyle='#396064';c.fillRect(x-4,92+i%3*2,5,3);c.fillRect(x+2,99,5,3);
        }
      } else {
        for(let i=0;i<15;i++) {
          const t=(w.time*.3+i/15)%1,x=365+(325-365)*t+Math.sin(t*13+i)*7,y=192-t*105;
          this.glow(c,x,y,5,'rgba(185,220,255,.26)');c.fillStyle='rgba(217,239,255,.75)';c.fillRect(Math.round(x),Math.round(y),2,1);
        }
        if(age<3)for(let i=0;i<24;i++) {
          const a=i*2.4,x=f.x+Math.cos(a)*age*17,y=f.y-12+Math.sin(a)*age*12-age*9;
          c.globalAlpha=Math.max(0,1-age/3);c.fillStyle='#dcf4ff';c.fillRect(Math.round(x),Math.round(y),2,2);c.globalAlpha=1;
        }
      }
      c.restore();
    }
    const time=reduced?0:w.time;
    for(let i=0;i<27;i++) {
      const x=(i*137%590)+25+Math.sin(time*.5+i)*5,y=(i*89%290)+35+Math.cos(time*.7+i)*4;
      const opacity=.3+Math.sin(time*1.1+i)*.2;
      this.glow(c,x,y,7,`rgba(247,218,139,${opacity*.8})`);c.fillStyle=`rgba(255,232,163,${opacity+.15})`;c.fillRect(Math.round(x),Math.round(y),1,1);
    }
    if(w.scene==='closing'){
      const t=w.finalTime||0;
      if(t>6.2&&t<9)for(let i=0;i<18;i++){
        const a=i*2.4,r=(t-6.2)*18,x=w.x+Math.cos(a)*r,y=w.y-(viewCamera??cameraY(w.y))-36+Math.sin(a)*r*.65;
        c.globalAlpha=Math.max(0,1-(t-6.2)/2.8);this.glow(c,x,y,6,'rgba(218,237,255,.4)');c.fillStyle='#ebf8ff';c.fillRect(Math.round(x),Math.round(y),2,2);
      }
      c.globalAlpha=1;c.fillStyle=`rgba(6,16,40,${Math.max(0,Math.min(1,(t-8)/2))})`;c.fillRect(0,0,640,360);
    }
    // Foreground, after every map/object/ambient layer. Local illumination only:
    // never flash the whole viewport or obscure the dialogue.
    if(w.scene==='forest'&&w.simonMet) {
      const age=w.time-w.simonTime,{x,y:worldY}=LANDMARKS.simon,y=worldY-(viewCamera??cameraY(w.y));
      c.save();
      PHOTO_TIMES.forEach((at,i)=>{
        const light=photoFlash(age,at)*(reduced?.45:1),sx=x+[-28,29,-17][i],sy=y-43-[0,9,4][i];
        if(light>0){
          this.glow(c,x,y-21,58,`rgba(207,234,255,${light*.48})`);
          this.glow(c,sx,sy,24,`rgba(231,246,255,${light*.85})`);
          c.globalAlpha=light;c.fillStyle='#f2fbff';
          c.fillRect(sx-8,sy-1,17,3);c.fillRect(sx-1,sy-8,3,17);c.fillRect(sx-3,sy-3,7,7);
        }
        const t=age-at;
        if(t>=0&&t<.65)for(let p=0;p<7;p++){
          const a=p*Math.PI*2/7+i,r=7+t*25;
          c.globalAlpha=(1-t/.65)*.85;c.fillStyle=p%2?'#b9dfff':'#f4fbff';
          c.fillRect(Math.round(sx+Math.cos(a)*r),Math.round(sy+Math.sin(a)*r+t*5),2,2);
        }
        c.globalAlpha=1;
      });
      c.restore();
    }
  }
}
