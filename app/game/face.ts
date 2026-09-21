import type { Direction, Look } from './story';

// Coordinates belong to the rendered anatomy, not to UI state or the last frame.
// The cap changes the crop height: each approved outfit therefore has its own
// eye line. Back views have no facial overlay (never draw glasses over hair).
export type FaceAnchor = { eyes: readonly number[]; y: number; offsets?:readonly number[]; lensWidth?:number; lensHeight?:number };
const ANCHORS: Record<Look['outfit'],Record<Direction,FaceAnchor>> = {
  real: {front:{eyes:[17,30],y:27},back:{eyes:[],y:0},left:{eyes:[15],y:27},right:{eyes:[34],y:27}},
  artist: {front:{eyes:[17,30],y:25},back:{eyes:[],y:0},left:{eyes:[14],y:25},right:{eyes:[35],y:25}},
  explorer: {front:{eyes:[17,30],y:24},back:{eyes:[],y:0},left:{eyes:[14],y:24},right:{eyes:[34],y:24}},
};
export function faceAnchor(look:Look,direction:Direction) { return ANCHORS[look.outfit][direction]; }
export function paintFace(ctx:CanvasRenderingContext2D,look:Look,anchor:FaceAnchor) {
  if(!anchor.eyes.length||look.face==='cheeks')return; // approved blush is in the art
  ctx.save();
  if(look.face==='freckles') {
    ctx.fillStyle=look.skin==='dark'?'#b88261':'#9f614f';
    anchor.eyes.forEach((x,i)=>{const y=anchor.y+(anchor.offsets?.[i]??0);ctx.fillRect(x-2,y+3,1,1);ctx.fillRect(x+1,y+4,1,1);});
  } else {
    ctx.strokeStyle='#727f96';ctx.lineWidth=.85;
    const rx=anchor.lensWidth??4.5,ry=anchor.lensHeight??4.5;
    anchor.eyes.forEach((x,i)=>{ctx.beginPath();ctx.ellipse(x,anchor.y+(anchor.offsets?.[i]??0),rx,ry,0,0,Math.PI*2);ctx.stroke();});
    if(anchor.eyes.length===2){ctx.beginPath();ctx.moveTo(anchor.eyes[0]+rx,anchor.y+(anchor.offsets?.[0]??0));ctx.lineTo(anchor.eyes[1]-rx,anchor.y+(anchor.offsets?.[1]??0));ctx.stroke();}
  }
  ctx.restore();
}
