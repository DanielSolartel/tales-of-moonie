import { personalizePose } from './poses';
import type { Look } from './story';
import type { FaceAnchor } from './face';

type Tile=HTMLCanvasElement;
// A connected color key preserves enclosed dress, paper and shoe highlights.
function keyExterior(tile:Tile,green:boolean){
  const c=tile.getContext('2d',{willReadFrequently:true})!,d=c.getImageData(0,0,tile.width,tile.height),p=d.data;
  const seen=new Uint8Array(tile.width*tile.height),q:number[]=[];
  const visit=(x:number,y:number)=>{
    if(x<0||y<0||x>=tile.width||y>=tile.height)return;
    const n=y*tile.width+x;if(seen[n])return;seen[n]=1;const i=n*4,r=p[i],g=p[i+1],b=p[i+2];
    if(p[i+3]<40||(green?g>90&&g>r*1.35&&g>b*1.35:r<25&&g>20&&g<60&&b>40&&b<105)){p[i+3]=0;q.push(n);}
  };
  for(let x=0;x<tile.width;x++){visit(x,0);visit(x,tile.height-1);}
  for(let y=0;y<tile.height;y++){visit(0,y);visit(tile.width-1,y);}
  for(let n=0;n<q.length;n++){const x=q[n]%tile.width,y=Math.floor(q[n]/tile.width);visit(x-1,y);visit(x+1,y);visit(x,y-1);visit(x,y+1);}
  if(green)for(let i=0;i<p.length;i+=4)if(p[i+1]>90&&p[i+1]>p[i]*1.35&&p[i+1]>p[i+2]*1.35)p[i+3]=0;
  c.putImageData(d,0,0);return p;
}
export function extractChest(image:HTMLImageElement){
  return [215,835,1467].map((x,i)=>{
    const tile=document.createElement('canvas');tile.width=386;tile.height=410;
    tile.getContext('2d')!.drawImage(image,x,170,386,410,0,0,386,410);keyExterior(tile,false);
    const out=document.createElement('canvas');out.width=58;out.height=62;const c=out.getContext('2d')!;c.imageSmoothingEnabled=false;c.drawImage(tile,0,0,58,62);return out;
  });
}
export function prepareFinalMap(image:HTMLImageElement){
  const tile=document.createElement('canvas');tile.width=640;tile.height=360;
  const c=tile.getContext('2d',{willReadFrequently:true})!;c.imageSmoothingEnabled=false;c.drawImage(image,0,0,640,360);
  const d=c.getImageData(0,0,640,360);
  for(let x=0;x<640;x++)for(let y=315;y<360;y++){
    const edge=338+Math.sin(x*.071)*5+Math.sin(x*.16)*3;
    d.data[(y*640+x)*4+3]*=Math.max(0,Math.min(1,(edge+18-y)/22));
  }
  c.putImageData(d,0,0);return tile;
}
export class FinalePoses {
  private poses:{tile:Tile;anchor:FaceAnchor}[][]=[];
  private variants=new Map<string,Tile>();
  constructor(image:HTMLImageElement){
    for(let row=0;row<2;row++){
      this.poses[row]=[];
      for(let col=0;col<3;col++){
        const cw=Math.floor(image.width/3),ch=Math.floor(image.height/2),src=document.createElement('canvas');src.width=cw;src.height=ch;
        src.getContext('2d')!.drawImage(image,col*cw,row*ch,cw,ch,0,0,cw,ch);const p=keyExterior(src,true);
        let x0=cw,y0=ch,x1=0,y1=0;
        for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(p[(y*cw+x)*4+3]>40){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
        const height=y1-y0+1,width=x1-x0+1,scale=63/height,dw=Math.round(width*scale),left=Math.floor((48-dw)/2);
        const tile=document.createElement('canvas');tile.width=48;tile.height=64;const c=tile.getContext('2d')!;c.imageSmoothingEnabled=false;c.drawImage(src,x0,y0,width,height,left,1,dw,63);
        const eyeY=(row===0?240:826)-row*ch;
        const eyeX=[[167,260],[578,670],[990,1083]][col].map(x=>Math.round(left+(x-col*cw-x0)*scale));
        this.poses[row][col]={tile,anchor:{eyes:eyeX,y:Math.round(1+(eyeY-y0)*scale)}};
      }
    }
  }
  frame(look:Look,smile:boolean){
    const key=`${look.outfit}/${look.skin}/${look.face}/${smile}`;
    if(!this.variants.has(key)){
      const pose=this.poses[smile?1:0][['real','artist','explorer'].indexOf(look.outfit)];
      this.variants.set(key,personalizePose(pose.tile,pose.anchor,look,25));
    }
    return this.variants.get(key)!;
  }
}
