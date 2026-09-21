import {loadRenderer,createCanvas} from './renderer-harness.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const renderer=await loadRenderer(),out=process.argv[2];await mkdir(out,{recursive:true});
const base={scene:'forest',x:325,y:-1108,direction:'right',walking:false,time:20,bloomed:true,bloomTime:0,dreamTime:0,sleeping:false,look:{outfit:'real',skin:'light',face:'cheeks'},animationTime:0,interactionTime:-1,progress:7,secondBloomTime:0,reading:null,thirdBloomTime:0,motion:null,motionTime:0,starTime:0,simonMet:false,simonTime:-1,starGreeting:false,flowerPulse:false};
const cases=[['seam-clearing',{y:0}],['seam-hidden',{y:-720}],['fallen',{motion:'fallen'}],['simon-before',{x:394,y:-1250}],['simon-flash',{x:394,y:-1250,simonMet:true,simonTime:19.645}],...['real','artist','explorer'].map(outfit=>[`sleep-${outfit}`,{scene:'classroom',sleeping:true,look:{outfit,skin:'medium',face:'glasses'}}])];
for(const [name,fields] of cases){const canvas=createCanvas(640,360),c=canvas.getContext('2d');renderer.draw(c,{...base,...fields});const display=createCanvas(1280,720),d=display.getContext('2d');d.imageSmoothingEnabled=false;d.drawImage(canvas,0,0,1280,720);await writeFile(`${out}/${name}.png`,display.toBuffer('image/png'));}
// The opening outside the authorized edge strip stays unchanged.
const opening=createCanvas(640,360),o=opening.getContext('2d');renderer.draw(o,{...base,x:284,y:239,progress:0,bloomed:false});
// All foreground flash moments produce a measurable local pulse, never a full
// screen wash. Far-away pixels remain identical at the same game time.
const shot=(age)=>{const c=createCanvas(640,360),x=c.getContext('2d');renderer.draw(x,{...base,x:394,y:-1250,simonMet:true,simonTime:20-age});return x.getImageData(0,0,640,360).data;};
const noFlash=shot(2.5);
for(const at of [.355,1.005,1.655]){
 const p=shot(at);let local=0;
 for(let y=90;y<180;y++)for(let x=372;x<489;x++){const i=(y*640+x)*4;local+=Math.max(0,p[i]+p[i+1]+p[i+2]-noFlash[i]-noFlash[i+1]-noFlash[i+2]);}
 assert.ok(local>100000,'flash must visibly light the local scene');
 for(let y=0;y<360;y++)for(let x=0;x<200;x++){const i=(y*640+x)*4;assert.deepEqual(p.slice(i,i+4),noFlash.slice(i,i+4),'no full-screen flash');}
}
console.log('Seams, fallen pose and photo contact frames saved; all three local photo pulses verified.');
