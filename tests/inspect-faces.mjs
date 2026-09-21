import {loadRenderer,createCanvas} from './renderer-harness.mjs';
import {writeFile} from 'node:fs/promises';
const r=await loadRenderer(),c=createCanvas(768,768),x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#14253c';x.fillRect(0,0,768,768);
for(const [row,outfit] of ['real','artist','explorer'].entries())for(const [col,direction] of ['front','back','left','right'].entries()){
  r.drawCharacter(x,{outfit,skin:'light',face:'cheeks'},direction,col*192+96,row*256+256,4);
  x.fillStyle='#d0e0ff';x.font='9px monospace';
  for(let y=15;y<=38;y+=2){x.fillText(String(y),col*192,row*256+y*4);x.fillRect(col*192+25,row*256+y*4,3,1);}
}
await writeFile(process.argv[2],c.toBuffer('image/png'));
