// Approved locomotion clips retain their original articulated 48×64 base.
// Fall/recovery use dedicated illustrated resources in poses.ts.
export type Animation = 'idle' | 'walk' | 'interact' | 'fall' | 'rise';
export const CLIPS = { idle:{frames:2,fps:1.3}, walk:{frames:4,fps:8}, interact:{frames:2,fps:5}, fall:{frames:3,fps:3.3}, rise:{frames:4,fps:4} } as const;
export const FALL_DURATION=1;
export const RISE_DURATION=1.1;
export function animationFrame(state:Animation, elapsed:number) {
  const clip=CLIPS[state];
  return state==='interact'||state==='fall'||state==='rise'?Math.min(clip.frames-1,Math.floor(elapsed*clip.fps)):Math.floor(elapsed*clip.fps)%clip.frames;
}

/** Integer-only articulated poses. Feet remain in the 48×64 canvas and the
 * collision anchor never moves with a cosmetic frame. Neutral = original art. */
export function bakeFrame(base:HTMLCanvasElement,state:Animation,frame:number,side:boolean) {
  const tile=document.createElement('canvas');tile.width=48;tile.height=64;
  const c=tile.getContext('2d')!;c.imageSmoothingEnabled=false;
  if(state==='fall'||state==='rise')throw new Error('Dedicated pose resource required');
  if(frame===0&&state==='idle'){c.drawImage(base,0,0);return tile;}
  const stride=state==='walk'?[0,1,0,-1][frame]:0;
  const lift=state==='interact'?(frame+1):state==='idle'?1:Math.abs(stride);
  // Head, torso, then independently swinging arms and feet. Cape stays torso-bound.
  c.drawImage(base,0,0,48,39,0,0,48,39);
  c.drawImage(base,17,39,14,15,17,39-lift,14,15+lift);
  c.drawImage(base,0,39,17,15,0,39-(state==='interact'?lift*2:stride),17,15);
  c.drawImage(base,31,39,17,15,31,39-(state==='interact'?lift*2:-stride),17,15);
  const leftLift=state==='walk'?(frame===1?3:frame===2?1:0):0;
  const rightLift=state==='walk'?(frame===3?3:frame===0?1:0):0;
  c.drawImage(base,0,54,24,10,side?-stride:0,54,24,10-leftLift);
  c.drawImage(base,24,54,24,10,24+(side?stride:0),54,24,10-rightLift);
  return tile;
}
