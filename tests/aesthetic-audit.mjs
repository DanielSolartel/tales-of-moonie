import {createCanvas,loadRenderer,compile} from './renderer-harness.mjs';
import {mkdir,writeFile} from 'node:fs/promises';
const out=process.argv[2]; await mkdir(out,{recursive:true});
const r=await loadRenderer(),g=await import(await compile('adventure'));
const sheet=createCanvas(4*240,3*340),c=sheet.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#17253d';c.fillRect(0,0,sheet.width,sheet.height);
for(const [row,outfit] of ['real','artist','explorer'].entries())for(let pose=0;pose<4;pose++){
 const t=r.adventure.pose({outfit,skin:'light',face:'cheeks'},pose);c.drawImage(t,pose*240,row*340,240,320);
 c.fillStyle='white';c.font='14px sans-serif';c.fillText(`${outfit} ${pose}`,pose*240+5,row*340+336);
 console.log(outfit,pose,r.adventure.poses[row][pose].anchor);
}
await writeFile(out+'/anatomy.png',sheet.toBuffer('image/png'));
const w={scene:'forest',x:350,y:239,direction:'front',walking:false,time:20,bloomed:true,bloomTime:0,dreamTime:0,sleeping:false,look:{outfit:'real',skin:'light',face:'glasses'},animationTime:0,interactionTime:-1,progress:7,secondBloomTime:0,reading:null,thirdBloomTime:0,motion:null,motionTime:0,starTime:0,simonMet:false,simonTime:-1,starGreeting:false,flowerPulse:false,challenges:g.freshChallenges(0)};
if(process.argv.includes('--terrain')){r.drawCharacter=()=>{};r.books=r.books.map(row=>row.map(()=>createCanvas(48,48)));}
for(const [name,y] of [['maze-exit',g.MAZE_TOP-25],['river-exit',g.RIVER_TOP-30],['root',g.worldY(-1100)],['plants',g.worldY(-1250)]]){w.y=y;const screen=createCanvas(640,360);r.draw(screen.getContext('2d'),w);await writeFile(out+'/'+name+'.png',screen.toBuffer('image/png'));}
