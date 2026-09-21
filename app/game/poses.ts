import type { Look } from './story';
import { paintFace, type FaceAnchor } from './face';

// Dedicated illustrated silhouettes, not transforms of a standing character.
// Exact source rectangles exclude neighbouring poses in the irregular atlas.
const BOUNDS = [
 [[30,41,290,340],[308,112,545,340],[523,153,837,340],[821,92,1063,340],[1087,50,1303,340],[1325,19,1533,337]],
 [[30,351,271,663],[303,412,544,665],[520,481,836,665],[828,404,1066,665],[1089,367,1297,661],[1323,341,1528,660]],
 [[25,670,280,988],[292,730,545,990],[520,800,835,987],[826,715,1063,990],[1084,684,1293,985],[1322,662,1527,987]],
] as const;
// Eye centers in the atlas, one pair per specifically authored pose.
const EYES = [
 [[172,170,222,177],[427,244,475,253],[716,275,765,291],[960,221,1009,224],[1207,180,1250,187],[1448,142,1490,147]],
 [[170,480,216,486],[428,553,476,561],[717,606,766,619],[961,538,1011,541],[1206,490,1251,492],[1447,469,1489,473]],
 [[171,800,216,804],[428,874,476,880],[717,928,766,942],[961,849,1010,851],[1206,813,1251,815],[1447,792,1489,797]],
] as const;
export function extractPoses(atlas:HTMLImageElement,outfit:number) {
  return BOUNDS[outfit].map(([x0,y0,x1,y1],pose)=>{
    const src=document.createElement('canvas');src.width=x1-x0;src.height=y1-y0;
    const c=src.getContext('2d',{willReadFrequently:true})!;c.drawImage(atlas,-x0,-y0);
    const data=c.getImageData(0,0,src.width,src.height),p=data.data;
    const visited=new Uint8Array(src.width*src.height),queue:number[]=[];
    const visit=(x:number,y:number)=>{
      if(x<0||y<0||x>=src.width||y>=src.height)return;
      const n=y*src.width+x;if(visited[n])return;visited[n]=1;const i=n*4,r=p[i],g=p[i+1],b=p[i+2];
      if(p[i+3]<40||(Math.min(r,g,b)>95&&Math.max(r,g,b)-Math.min(r,g,b)<28)){p[i+3]=0;queue.push(n);}
    };
    for(let x=0;x<src.width;x++){visit(x,0);visit(x,src.height-1);}
    for(let y=0;y<src.height;y++){visit(0,y);visit(src.width-1,y);}
    for(let i=0;i<queue.length;i++){const x=queue[i]%src.width,y=Math.floor(queue[i]/src.width);visit(x-1,y);visit(x+1,y);visit(x,y-1);visit(x,y+1);}
    // Bounding boxes overlap horizontally in the source sheet. Keep only this
    // pose's connected silhouette, never fragments of the adjacent character.
    const labels=new Int32Array(src.width*src.height);let label=0,best=0,bestSize=0;
    for(let n=0;n<labels.length;n++)if(!labels[n]&&p[n*4+3]>40){
      label++;const component=[n];labels[n]=label;
      for(let q=0;q<component.length;q++){
        const at=component[q],x=at%src.width,y=Math.floor(at/src.width);
        for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){
          const xx=x+dx,yy=y+dy,k=yy*src.width+xx;
          if(xx>=0&&xx<src.width&&yy>=0&&yy<src.height&&!labels[k]&&p[k*4+3]>40){labels[k]=label;component.push(k);}
        }
      }
      if(component.length>bestSize){bestSize=component.length;best=label;}
    }
    for(let n=0;n<labels.length;n++)if(labels[n]!==best)p[n*4+3]=0;
    c.putImageData(data,0,0);
    const tile=document.createElement('canvas');tile.width=48;tile.height=64;
    const ctx=tile.getContext('2d')!;ctx.imageSmoothingEnabled=false;
    const scale=.183,width=Math.round(src.width*scale),height=Math.round(src.height*scale),bottom=64-height;
    const left=Math.floor((48-width)/2);
    // The fallen resource includes separately drawn bent legs and supported
    // head/arms. Tuck the legs behind the torso, preserving their pixel scale,
    // so a prone pose fits the same collision cell without shrinking her head.
    const split=95,frontLeft=48-Math.round((src.width-split)*scale);
    if(pose===2){
      ctx.drawImage(src,0,0,split,src.height,0,bottom,Math.round(split*scale),height);
      ctx.drawImage(src,split,0,src.width-split,src.height,frontLeft,bottom,Math.round((src.width-split)*scale),height);
    }else ctx.drawImage(src,left,bottom,width,height);
    // Two modular, one-pixel pencil tips only. The generated source sometimes
    // invents a third tip; the approved blue/pink pair replaces that tiny detail.
    if(outfit===1&&pose>=3){
      const [px,py]=[[25,50],[23,43],[22,38]][pose-3];
      ctx.fillStyle='#b5a2d6';ctx.fillRect(px-1,py,5,4);
      ctx.fillStyle='#5e94d7';ctx.fillRect(px,py,1,3);
      ctx.fillStyle='#ed99be';ctx.fillRect(px+2,py+1,1,2);
    }
    const [ax,ay,bx,by]=EYES[outfit][pose];
    const mapX=(x:number)=>Math.round(pose===2?frontLeft+(x-x0-split)*scale:left+(x-x0)*scale);
    const anchor:FaceAnchor={eyes:[mapX(ax),mapX(bx)],y:Math.round(bottom+(ay-y0)*scale),offsets:[0,Math.round((by-ay)*scale)]};
    return {tile,anchor};
  });
}
export function personalizePose(src:HTMLCanvasElement,anchor:FaceAnchor,look:Look,warmContrast=10){
  const tile=document.createElement('canvas');tile.width=48;tile.height=64;
  const c=tile.getContext('2d',{willReadFrequently:true})!;c.drawImage(src,0,0);
  const data=c.getImageData(0,0,48,64),p=data.data;
  for(let i=0;i<p.length;i+=4){
    const r=p[i],g=p[i+1],b=p[i+2],x=i/4%48,y=Math.floor(i/4/48);
    if(r>165&&r-g>warmContrast&&g-b>10&&b>45&&p[i+3]>0){
      if(look.skin==='medium'){p[i]=r*.80;p[i+1]=g*.70;p[i+2]=b*.62;}
      if(look.skin==='dark'){p[i]=r*.53;p[i+1]=g*.42;p[i+2]=b*.35;}
    }
    if(look.face!=='cheeks'&&y>=anchor.y&&y<anchor.y+9&&x>anchor.eyes[0]-7&&r>150&&r>g*1.4&&b>g*.85){
      const skin=look.skin==='light'?[242,197,160]:look.skin==='medium'?[195,139,99]:[128,83,54];[p[i],p[i+1],p[i+2]]=skin;
    }
  }
  c.putImageData(data,0,0);paintFace(c,look,anchor);return tile;
}
