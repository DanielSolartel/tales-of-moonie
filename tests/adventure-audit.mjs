import {createCanvas,loadRenderer,compile} from './renderer-harness.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const out=process.argv[2];if(!out)throw Error('Output directory required');await mkdir(out,{recursive:true});
const r=await loadRenderer(),g=await import(await compile('adventure'));
const looks=['real','artist','explorer'].flatMap(outfit=>['light','medium','dark'].flatMap(skin=>['cheeks','freckles','glasses'].map(face=>({outfit,skin,face}))));
const base=new Map(),sheet=createCanvas(4*100,27*132),c=sheet.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#10213b';c.fillRect(0,0,sheet.width,sheet.height);
for(let cycle=0;cycle<3;cycle++){if(cycle===2)r.adventure.variants.clear();for(const [i,look] of looks.entries())for(let pose=0;pose<4;pose++){const t=r.adventure.pose(look,pose),bytes=Buffer.from(t.getContext('2d').getImageData(0,0,48,64).data),key=JSON.stringify(look)+pose;if(cycle===0){base.set(key,bytes);c.drawImage(t,pose*100,i*132,96,128);}else assert.deepEqual(bytes,base.get(key));}}
await writeFile(out+'/poses.png',sheet.toBuffer('image/png'));
const w={scene:'forest',x:284,y:239,direction:'front',walking:false,time:20,bloomed:false,bloomTime:0,dreamTime:0,sleeping:false,look:looks[0],animationTime:0,interactionTime:-1,progress:0,secondBloomTime:0,reading:null,thirdBloomTime:0,motion:null,motionTime:0,starTime:0,simonMet:false,simonTime:-1,starGreeting:false,flowerPulse:false,challenges:g.freshChallenges(0)};
for(const [name,patch] of [['grove',{x:320,y:550}],['roots',{x:170,y:530}],['maze',{bloomed:true,progress:2,x:327,y:g.MAZE_TOP+554}],['river',{bloomed:true,progress:3,...g.RIVER_SHORE}],['plants',{bloomed:true,progress:7,x:320,y:g.worldY(-1250)}]]){Object.assign(w,patch);const screen=createCanvas(640,360);r.draw(screen.getContext('2d'),w);await writeFile(out+'/'+name+'.png',screen.toBuffer('image/png'));}
console.log('108 new pose variants: stable through three cycles and cold caches; five environment captures saved.');
