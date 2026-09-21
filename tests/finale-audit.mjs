import {loadRenderer,createCanvas} from './renderer-harness.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const r=await loadRenderer(),out=process.argv[2];await mkdir(out,{recursive:true});
const sheet=createCanvas(27*52,140),c=sheet.getContext('2d');c.fillStyle='#132743';c.fillRect(0,0,sheet.width,sheet.height);
const looks=['real','artist','explorer'].flatMap(outfit=>['light','medium','dark'].flatMap(skin=>['cheeks','freckles','glasses'].map(face=>({outfit,skin,face}))));
const baseline=new Map();
for(let cycle=0;cycle<3;cycle++)for(const [i,look] of looks.entries())for(const smile of [false,true]){
 const tile=r.finalePoses.frame(look,smile),data=Buffer.from(tile.getContext('2d').getImageData(0,0,48,64).data),key=JSON.stringify(look)+smile;
 assert.equal(tile.width,48);assert.equal(tile.height,64);assert.ok(data.filter((v,i)=>i%4===3&&v>0).length>700);
 if(cycle===0){baseline.set(key,data);c.drawImage(tile,i*52,smile?73:3);}else assert.deepEqual(data,baseline.get(key));
 if(smile)assert.notDeepEqual(data,baseline.get(JSON.stringify(look)+false),'smile is a dedicated different pose');
}
const display=createCanvas(sheet.width*2,280),d=display.getContext('2d');d.imageSmoothingEnabled=false;d.drawImage(sheet,0,0,display.width,280);await writeFile(`${out}/poses.png`,display.toBuffer('image/png'));
const base={scene:'forest',x:320,y:-1576,direction:'back',walking:false,time:20,bloomed:true,bloomTime:0,dreamTime:0,sleeping:false,look:looks[0],animationTime:0,interactionTime:-1,progress:8,secondBloomTime:0,reading:null,thirdBloomTime:0,motion:null,motionTime:0,starTime:0,simonMet:false,simonTime:-1,starGreeting:false,flowerPulse:false};
for(const [name,patch] of [['clearing',{}],['seam',{y:-1425}],['gate-closed',{y:-575,progress:3}],['gate-half',{y:-575,progress:4,secondBloomTime:18.4}],['gate-open',{y:-575,progress:4}],['bloom-start',{y:-1315,thirdBloomTime:19.5}],['bloom-crescent',{y:-1315,thirdBloomTime:17.5}],['bloom-fade',{y:-1315,thirdBloomTime:15}],['chest-open',{chestTime:18}],['embrace',{scene:'closing',finalTime:1}],['smile',{scene:'closing',finalTime:6.5}],['end',{scene:'end'}]]){
 const canvas=createCanvas(640,360);r.draw(canvas.getContext('2d'),{...base,...patch});const large=createCanvas(1280,720),ctx=large.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(canvas,0,0,1280,720);await writeFile(`${out}/${name}.png`,large.toBuffer('image/png'));
}
console.log('54 dedicated final pose combinations, three deterministic cycles; gate, bloom and finale scenes rendered.');
