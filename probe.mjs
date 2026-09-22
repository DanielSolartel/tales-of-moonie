import {compile} from './tests/renderer-harness.mjs';
const g=await import(await compile('adventure'));
const w={bloomed:true,progress:2,time:20,secondBloomTime:0,thirdBloomTime:0,challenges:g.freshChallenges(0)};
console.log('MAZE_TOP',g.MAZE_TOP,'MAZE_BOTTOM',g.MAZE_BOTTOM,'ROUTE0',JSON.stringify(g.MAZE_ROUTE[0]),'ROUTE7',JSON.stringify(g.MAZE_ROUTE[7]));
function scan(label,y0,y1){
 console.log('---',label,'--- (fila: y, luego tramos x caminables)');
 for(let y=y0;y>=y1;y-=6){
  const runs=[];let s=null;
  for(let x=240;x<=440;x+=2){const ok=g.walkAllowed(w,x,y);if(ok&&s===null)s=x;if(!ok&&s!==null){runs.push(`${s}-${x-2}`);s=null;}}
  if(s!==null)runs.push(`${s}-440`);
  console.log(String(y).padStart(6),runs.join('  ')||'(nada)');
 }
}
scan('ENTRADA',g.MAZE_BOTTOM+70,g.MAZE_BOTTOM-70);
scan('SALIDA',g.MAZE_TOP+60,g.MAZE_TOP-110);
