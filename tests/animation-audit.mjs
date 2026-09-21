// Optional local raster audit; uses the execution environment's Canvas adapter.
// Run: node tests/animation-audit.mjs /absolute/output-directory
import {createCanvas,loadRenderer} from './renderer-harness.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
const output=process.argv[2];if(!output)throw new Error('Supply an audit output directory');
const renderer=await loadRenderer();
const clips=['idle','idle','walk','walk','walk','walk','interact','interact','fall','fall','fall','rise','rise','rise','rise'],frames=[0,1,0,1,2,3,0,1,0,1,2,0,1,2,3];
const outfits=['real','artist','explorer'],skins=['light','medium','dark'],faces=['cheeks','freckles','glasses'];
const probe=createCanvas(96,128),p=probe.getContext('2d');let count=0;
for(const outfit of outfits)for(const skin of skins)for(const face of faces)for(const direction of ['front','back','left','right']){
  const hashes={idle:new Set(),walk:new Set(),interact:new Set(),fall:new Set(),rise:new Set()};
  clips.forEach((state,col)=>{
    p.clearRect(0,0,96,128);renderer.drawCharacter(p,{outfit,skin,face},direction,48,100,1,frames[col],state);
    const data=p.getImageData(0,0,96,128).data;let opaque=0,hash=2166136261;
    for(let i=0;i<data.length;i++){hash=Math.imul(hash^data[i],16777619);if(i%4===3&&data[i]){
      opaque++;const pixel=Math.floor(i/4),x=pixel%96,y=Math.floor(pixel/96);
      assert.ok(x>=24&&x<72&&y>=36&&y<100,'48×64 bounds');
    }}
    assert.ok(opaque>300,`${outfit}/${skin}/${face}/${direction}/${state}: empty`);hashes[state].add(hash);count++;
  });
  for(const [state,size] of [['idle',2],['walk',4],['interact',2],['fall',3],['rise',4]])assert.equal(hashes[state].size,size,`${outfit}/${skin}/${face}/${direction}/${state}: repeated frames`);
}
await mkdir(output,{recursive:true});
for(const [direction,skin,face] of [['front','light','cheeks'],['back','medium','freckles'],['left','dark','glasses'],['right','light','freckles']]){
  const sheet=createCanvas(960,228),c=sheet.getContext('2d');c.fillStyle='#0d1e35';c.fillRect(0,0,960,228);
  outfits.forEach((outfit,row)=>clips.forEach((state,col)=>renderer.drawCharacter(c,{outfit,skin,face},direction,30+col*60,70+row*76,1,frames[col],state)));
  const display=createCanvas(2880,684),d=display.getContext('2d');d.imageSmoothingEnabled=false;d.drawImage(sheet,0,0,2880,684);
  await writeFile(resolve(output,`${direction}.png`),display.toBuffer('image/png'));
}
console.log(`${count} distinct, nonempty clip frames within 48×64; 27 looks × 4 directions. Four audit sheets saved.`);
// Repeat every look after two complete cycles in reverse order. Compare actual
// RGBA, not cache keys, including cold regeneration and dirty preview contexts.
const baseline=new Map(),preview=createCanvas(192,256),pc=preview.getContext('2d');
const looks=outfits.flatMap(outfit=>skins.flatMap(skin=>faces.map(face=>({outfit,skin,face}))));
for(let cycle=0;cycle<3;cycle++){
  if(cycle===2){renderer.variants.clear();renderer.frames.clear();}
  for(const look of cycle%2?[...looks].reverse():looks)for(const direction of ['front','back','left','right']){
    pc.translate(0,7);pc.globalAlpha=.4; // caller contamination must be reset
    renderer.preview(preview,look,direction);
    const key=JSON.stringify(look)+direction,pixels=Buffer.from(pc.getImageData(0,0,192,256).data);
    if(cycle===0)baseline.set(key,pixels);else assert.deepEqual(pixels,baseline.get(key),`preview drift: ${key}`);
    for(const [col,state] of clips.entries()){
      p.clearRect(0,0,96,128);renderer.drawCharacter(p,look,direction,48,100,1,frames[col],state);
      const k=key+state+frames[col],bytes=Buffer.from(p.getImageData(0,0,96,128).data);
      if(cycle===0)baseline.set(k,bytes);else assert.deepEqual(bytes,baseline.get(k),`animation drift: ${k}`);
    }
  }
}
console.log('Three cycles: identical RGBA for all previews and every animation frame, including cold caches and contaminated preview transforms.');
