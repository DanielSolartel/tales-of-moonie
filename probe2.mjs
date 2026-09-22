import {compile} from './tests/renderer-harness.mjs';
const g=await import(await compile('adventure'));
const w={bloomed:true,progress:2,time:20,secondBloomTime:0,thirdBloomTime:0,challenges:g.freshChallenges(0)};
for(const [label,ya,yb] of [['ENTRADA',-280,-360],['SALIDA',-1040,-1080]]){
 console.log('---',label,'--- x:',[306,312,316,320,324,327,330,334,338,342,346].join(' '));
 for(let y=ya;y>=yb;y-=1){
  const row=[306,312,316,320,324,327,330,334,338,342,346].map(x=>g.walkAllowed(w,x,y)?'#':'.').join('   ');
  console.log(String(y).padStart(6),row);
 }
}
