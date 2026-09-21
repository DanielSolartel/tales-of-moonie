import { canWalk, FLOWER, LANDMARKS, nearbyInteraction, Progress, DialogueKind, Direction } from './story';
export type Point={x:number;y:number};
export const MAZE_HEIGHT=720,MAZE_BOTTOM=-340,MAZE_TOP=MAZE_BOTTOM-MAZE_HEIGHT,RIVER_TOP=-540-MAZE_HEIGHT-240,RIVER_BOTTOM=-420-MAZE_HEIGHT;
export const WORLD_EXTENSION=MAZE_HEIGHT+240;
export const worldY=(y:number)=>y<=-540?y-WORLD_EXTENSION:y<-420?RIVER_BOTTOM+(y+420)*3:y<=MAZE_BOTTOM?y-MAZE_HEIGHT:y;
export const storyY=(y:number)=>y<=RIVER_TOP?y+WORLD_EXTENSION:y<RIVER_BOTTOM?-420+(y-RIVER_BOTTOM)/3:y<=MAZE_TOP?y+MAZE_HEIGHT:y<MAZE_BOTTOM?MAZE_BOTTOM:y;
export const inMaze=(y:number)=>y<MAZE_BOTTOM&&y>MAZE_TOP;
export const gameCamera=(y:number)=>y>=160?Math.round(Math.max(0,Math.min(360,y-280))):Math.round(Math.max(-1760-WORLD_EXTENSION,y-160-Math.max(0,Math.min(80,(-y-1440-WORLD_EXTENSION)*.5))));
export const MAZE_ROUTE=[{x:327,y:720},{x:327,y:554},{x:181,y:554},{x:181,y:354},{x:415,y:354},{x:415,y:166},{x:328,y:166},{x:328,y:0}];
export const MAZE_BRANCHES=[[{x:327,y:554},{x:470,y:554}],[{x:415,y:166},{x:535,y:166}],[{x:181,y:554},{x:165,y:529},{x:80,y:529},{x:80,y:372},{x:100,y:354},{x:181,y:354}]];
export const LIGHTS=[{x:140,y:530},{x:302,y:650},{x:478,y:555}],HIDE_LABELS=['las raíces','las flores altas','el reflejo'];
export const STONES=[{x:252,y:231},{x:321,y:207},{x:394,y:232},{x:253,y:178},{x:394,y:178},{x:254,y:127},{x:321,y:153},{x:393,y:127},{x:321,y:98}].map(p=>({...p,y:p.y+RIVER_TOP}));
export const RIVER_ROUTES=[[0,3,6,5,8],[2,4,6,7,8],[1,3,6,7,8]] as const;
export const RIVER_SHORE={x:320,y:RIVER_TOP+312},RIVER_EXIT={x:320,y:RIVER_TOP+62};
// Segunda recomposición (revisión manual): las plantas seguían demasiado cerca de Simón
// (LANDMARKS.simon, x:430 y:-1250) y de la tercera flor (THIRD_FLOWER, x:342 y:-1320).
// Nuevo margen libre: ~45 unidades con Simón y ~43 con la flor (el ancho de Moonie, ~48,
// funciona como referencia; no fue posible superar ambos límites a la vez sin desplazar
// el centroide más de lo razonable). Separación entre plantas: 96-169 unidades.
export const PLANTS=[{x:305,y:worldY(-1170)},{x:220,y:worldY(-1215)},{x:210,y:worldY(-1310)}];
export const PATTERNS=[[1,0,2],[2,0,1,0,2]] as const,PATTERN=PATTERNS[0];
export type CinemaKind='spirit'|'ritual'|'bloom2'|'bloom3'|'bookReveal'|'riverDemo'|'riverError'|'patternDemo'|'constellation';
export type Cinema={kind:CinemaKind;time:number;duration:number;index:number;origin:Point;direction:Direction;cue:number};
export type Challenges={lights:boolean[];searchTime:number;mazeDone:boolean;mazeTime:number;idle:number;lastKey:string;bestDistance:number;river:'waiting'|'showing'|'crossing'|'jumping'|'returning'|'done';riverTime:number;riverRoute:number;riverAttempts:number;stone:number;currentStone:number;returnFrom:Point;jumpTo:Point;jumpIndex:number;pattern:'waiting'|'showing'|'input'|'done';patternTime:number;patternStep:number;round:number;patternAttempts:number;feedback:number;notice:number;cinema:Cinema|null;pendingBloom:0|1|2|3;sound:number;soundSerial:number;riverFocus?:number;fadeSteps?:number};
export const freshChallenges=(route=Math.floor(Math.random()*3)):Challenges=>({lights:[false,false,false],searchTime:0,mazeDone:false,mazeTime:0,idle:0,lastKey:'',bestDistance:Infinity,river:'waiting',riverTime:0,riverRoute:Math.max(0,Math.min(2,route)),riverAttempts:0,stone:0,currentStone:-1,returnFrom:{...RIVER_SHORE},jumpTo:{...RIVER_SHORE},jumpIndex:-1,pattern:'waiting',patternTime:0,patternStep:0,round:0,patternAttempts:0,feedback:0,notice:0,cinema:null,pendingBloom:0,sound:0,soundSerial:0});
export type ChallengeWorld=Point&{direction?:Direction;bloomed:boolean;progress:Progress;simonMet:boolean;time:number;secondBloomTime:number;thirdBloomTime:number;challenges?:Challenges};
export type Action=Point&{type:'light'|'river'|'plant'|'story';index:number;label:string;kind?:DialogueKind};
const distance=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y);
export const riverSequence=(q:Challenges)=>RIVER_ROUTES[q.riverRoute],patternSequence=(q:Challenges)=>PATTERNS[q.round];
export const busy=(q:Challenges)=>!!q.cinema||q.river==='jumping';
export function startCinema(w:ChallengeWorld,kind:CinemaKind,index=0,duration=4){const q=w.challenges!;if(!q.cinema)q.cinema={kind,time:0,duration,index,origin:{x:w.x,y:w.y},direction:w.direction||'front',cue:-1};}
function sound(q:Challenges,index:number){q.sound=index;q.soundSerial++;}
export function nearAction(w:ChallengeWorld):Action|null{
 const q=w.challenges!;if(busy(q))return null;
 if(!w.bloomed){const i=LIGHTS.findIndex((p,i)=>!q.lights[i]&&distance(w,p)<43);if(i>=0)return {type:'light',index:i,...LIGHTS[i],label:'Examinar'};}
 if(w.progress===3&&q.river!=='done'&&distance(w,RIVER_SHORE)<44&&q.currentStone<0)return {type:'river',index:0,...RIVER_SHORE,label:q.river==='waiting'?'Examinar':'Repetir'};
 if(w.progress===7&&q.pattern!=='done'){const i=PLANTS.findIndex(p=>distance(w,p)<49);if(i>=0)return {type:'plant',index:i,...PLANTS[i],label:q.pattern==='waiting'?'Examinar':'Activar'};}
 const kind=nearbyInteraction(w.x,storyY(w.y),w.bloomed,w.progress,w.simonMet) as DialogueKind|null;
 if(!kind||inMaze(w.y))return null;
 if(kind==='flower'&&!q.lights.every(Boolean)||kind==='book2'&&!q.mazeDone||kind==='flower2'&&q.river!=='done'||kind==='flower3'&&q.pattern!=='done')return null;
 const p=kind==='flower'?FLOWER:LANDMARKS[kind as keyof typeof LANDMARKS];return {type:'story',kind,index:0,x:p.x,y:worldY(p.y),label:kind.startsWith('flower')?'Despertar':kind==='chest'?'Abrir':kind==='simon'?'Examinar':'Leer'};
}
export function activateChallenge(w:ChallengeWorld,a:Action){
 const q=w.challenges!;if(busy(q))return;
 if(a.type==='light'&&!q.lights[a.index])startCinema(w,'spirit',a.index,4);
 if(a.type==='river'){q.river='showing';q.riverTime=0;q.stone=0;q.currentStone=-1;startCinema(w,'riverDemo',0,q.riverAttempts?3:5);}
 if(a.type==='plant'){
  if(q.pattern==='waiting'){q.pattern='showing';startCinema(w,'patternDemo',0,4.2);return;}
  if(q.pattern!=='input')return;
  if(a.index===patternSequence(q)[q.patternStep]){q.patternStep++;q.feedback=.65;sound(q,a.index);if(q.patternStep===patternSequence(q).length){if(q.round===0){q.round=1;q.patternStep=0;q.pattern='showing';startCinema(w,'patternDemo',0,5);}else{q.pattern='done';startCinema(w,'constellation',0,4.5);}}}
  else{q.feedback=1;q.fadeSteps=q.patternStep;q.patternAttempts++;q.pattern='showing';q.patternStep=0;startCinema(w,'patternDemo',0,q.round?3.5:3);}
 }
}
function tube(x:number,y:number,points:readonly Point[],radius:number){return points.some((a,i)=>{const b=points[i+1]||a,dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a.x-t*dx,y-a.y-t*dy)<radius;});}
export function onMazeTrail(x:number,y:number){return [MAZE_ROUTE,...MAZE_BRANCHES].some(points=>tube(x,y,points,24));}
export function walkAllowed(w:ChallengeWorld,x:number,y:number){
 const q=w.challenges!;if(busy(q))return false;
 if(y>=352){if(y<440)return x>288&&x<351;return Math.hypot((x-320)/244,(y-558)/155)<1&&!LIGHTS.some((p,i)=>i!==2&&Math.hypot((x-p.x)/28,(y-p.y+8)/18)<1)&&!(x>493&&y>460&&y<590);}
 if(y<MAZE_BOTTOM+5&&y>MAZE_TOP-5)return w.bloomed&&w.progress>=2&&[x-7,x+7].every(xx=>onMazeTrail(xx,y-MAZE_TOP));
 if(y<=RIVER_BOTTOM&&y>=RIVER_TOP){
  if(w.progress<3)return false;
  // Once solved, the stones and the shore-side channel close behind Moonie; only the
  // narrow exit lip toward the forest stays walkable, so a return attempt stops there.
  if(q.river==='done')return y<RIVER_TOP+78&&x>290&&x<350;
  if(y>RIVER_TOP+287)return x>285&&x<356;
  return false;
 }
 const sy=storyY(y);
 if(w.progress===3&&q.river!=='done'&&sy<-540)return false;
 if(w.progress>=7&&sy<-1160&&sy>-1348)return Math.hypot((x-320)/143,(sy+1254)/107)<1&&!PLANTS.some(p=>Math.hypot((x-p.x)/23,(y-p.y)/12)<1);
 return canWalk(x,sy,w.bloomed,w.progress,w.time-w.secondBloomTime,w.time-w.thirdBloomTime);
}
// Explicit directional jumps make all nine rocks selectable, including wrong ones.
export function tryRiverStep(w:ChallengeWorld,dx:number,dy:number):boolean{
 const q=w.challenges!;if(busy(q))return false;
 // A solved crossing never offers a jump back onto the stones or the shore: the stone-hop
 // mechanic only exists to cross once. Onward movement past the exit uses plain walking.
 if(q.river==='done')return false;
 if(q.river!=='crossing')return false;
 if(q.currentStone<0&&distance(w,RIVER_SHORE)>39)return false;
 const source=q.currentStone<0?RIVER_SHORE:STONES[q.currentStone];
 if(q.currentStone<0&&dy>0)return false;
 if(q.stone===5&&dy<0){q.river='jumping';q.returnFrom={...source};q.jumpTo={...RIVER_EXIT};q.jumpIndex=9;q.riverTime=0;return true;}
 const len=Math.hypot(dx,dy);if(!len)return false;
 const candidates=STONES.map((p,i)=>({p,i,d:distance(source,p),dot:((p.x-source.x)*dx+(p.y-source.y)*dy)/len/(distance(source,p)||1)})).filter(v=>v.i!==q.currentStone&&v.d<118&&v.dot>.22&&(dy!==0||v.p.y<=source.y+10)).sort((a,b)=>(1-a.dot)*90+a.d-((1-b.dot)*90+b.d));
 if(!candidates.length)return q.currentStone>=0;
 const chosen=candidates[0];q.river='jumping';q.returnFrom={...source};q.jumpTo={...chosen.p};q.jumpIndex=chosen.i;q.riverTime=0;w.direction=dx?(dx>0?'right':'left'):(dy>0?'front':'back');return true;
}
export function tickChallenges(w:ChallengeWorld,dt:number){
 if(dt<=0)return;const q=w.challenges!;q.notice=Math.max(0,q.notice-dt);q.feedback=Math.max(0,q.feedback-dt);
 const focus=['crossing','jumping','returning'].includes(q.river)||q.river==='done'&&q.currentStone>=0?1:0;q.riverFocus=Math.max(0,Math.min(1,(q.riverFocus||0)+(focus?1:-1)*dt*2));
 if(q.cinema){
  const c=q.cinema;c.time=Math.min(c.duration,c.time+dt);
  if(c.kind==='riverDemo'){q.riverTime=c.time;const cue=Math.min(9,Math.floor(c.time/c.duration*10));if(cue!==c.cue){c.cue=cue;sound(q,cue%5);}}
  if(c.kind==='patternDemo'){q.patternTime=c.time;const cue=Math.min(patternSequence(q).length-1,Math.floor(c.time/c.duration*patternSequence(q).length));if(cue!==c.cue){c.cue=cue;sound(q,patternSequence(q)[cue]);}}
  if(c.kind==='ritual'){const cue=Math.min(2,Math.floor((c.time-1.5)/.8));if(cue>=0&&cue!==c.cue){c.cue=cue;sound(q,cue+1);}}
  if(c.kind==='riverError'){const t=Math.max(0,Math.min(1,(c.time-.7)/(c.duration-1))),e=t*t*(3-2*t);w.x=c.origin.x+(RIVER_SHORE.x-c.origin.x)*e;w.y=c.origin.y+(RIVER_SHORE.y-c.origin.y)*e;}
  if(c.time>=c.duration){q.cinema=null;w.direction=c.direction;
   if(c.kind==='spirit'){q.lights[c.index]=true;q.searchTime=0;q.idle=0;sound(q,c.index);}
   if(c.kind==='ritual')q.pendingBloom=1;
   if(c.kind==='bloom2')q.pendingBloom=2;
   if(c.kind==='bloom3')q.pendingBloom=3;
   if(c.kind==='riverDemo'){q.river='crossing';q.riverTime=0;}
   if(c.kind==='riverError'){Object.assign(w,RIVER_SHORE);q.currentStone=-1;q.stone=0;q.river='showing';startCinema(w,'riverDemo',0,3);}
   if(c.kind==='patternDemo'){q.pattern='input';q.patternTime=0;}
  }return;
 }
 if(q.river==='jumping'){
  q.riverTime+=dt;const t=Math.min(1,q.riverTime/.55),e=t*t*(3-2*t);w.x=q.returnFrom.x+(q.jumpTo.x-q.returnFrom.x)*e;w.y=q.returnFrom.y+(q.jumpTo.y-q.returnFrom.y)*e;
  if(t===1){if(q.jumpIndex>=20){q.river='done';q.currentStone=q.jumpIndex<29?q.jumpIndex-20:-1;}else if(q.jumpIndex===9){q.river='done';q.currentStone=-1;}else if(q.jumpIndex===riverSequence(q)[q.stone]){q.currentStone=q.jumpIndex;q.stone++;q.river='crossing';sound(q,q.stone);}else{q.currentStone=q.jumpIndex;q.riverAttempts++;q.river='returning';startCinema(w,'riverError',q.jumpIndex,q.riverAttempts===1?3.5:2);}}return;
 }
 if(!w.bloomed&&!q.lights.every(Boolean))q.searchTime+=dt;
 if(inMaze(w.y))q.mazeTime+=dt;else if(w.y<=MAZE_TOP&&w.progress===2&&!q.mazeDone){q.mazeDone=true;startCinema(w,'bookReveal',0,3.5);}
 const objective=objectiveFor(w),d=distance(w,objective.target);
 if(q.lastKey!==objective.text||d<q.bestDistance-8){q.idle=0;q.bestDistance=d;q.lastKey=objective.text;}else q.idle+=dt;
}
export function objectiveFor(w:ChallengeWorld):{text:string;detail?:string;target:Point}{
 const q=w.challenges!,at=(text:string,p:Point,detail?:string)=>({text,target:p,detail}),landmark=(key:keyof typeof LANDMARKS)=>({...LANDMARKS[key],y:worldY(LANDMARKS[key].y)});
 if(!w.bloomed){const count=q.lights.filter(Boolean).length,i=q.lights.findIndex(v=>!v);return count<3?at(q.cinema?.kind==='spirit'?`Libera el espíritu de ${HIDE_LABELS[q.cinema.index]}`:`Busca los espíritus lunares · ${count}/3`,LIGHTS[Math.max(0,i)],'Observa las raíces, las flores y el agua'):at('Regresa a la flor',FLOWER,'Espíritus · 3/3 · E para despertar');}
 if(w.progress===0)return at(w.y>40?'Sigue el sendero que acaba de abrirse':'Examina el primer libro',landmark('book1'));
 if(w.progress===1)return at('Continúa hasta el letrero',landmark('sign'));
 if(w.progress===2){if(q.mazeDone)return at('Examina el segundo libro',landmark('book2'));const local=w.y-MAZE_TOP;let closest=0,best=Infinity;MAZE_ROUTE.forEach((p,i)=>{const d=Math.hypot(p.x-w.x,p.y-local);if(d<best){best=d;closest=i;}});const p=MAZE_ROUTE[Math.min(MAZE_ROUTE.length-1,closest+1)];return at(inMaze(w.y)?'Encuentra la salida del laberinto':'Continúa más allá del letrero',{x:p.x,y:p.y+MAZE_TOP},'Observa la luz entre las copas');}
 if(w.progress===3){if(q.river==='done')return at('Acércate a la segunda flor',landmark('flower2'));return at(q.river==='crossing'||q.river==='jumping'?'Cruza el arroyo':q.river==='returning'?'Regresa a la orilla':'Observa a las luciérnagas',q.river==='crossing'?STONES[riverSequence(q)[Math.min(4,q.stone)]]:RIVER_SHORE,q.river==='crossing'?`Piedras · ${q.stone}/5 · Usa las direcciones para saltar`:'Recuerda las cinco piedras · E en la orilla');}
 if(w.progress===4)return at(distance(w,landmark('book3'))<130?'Examina el tercer libro':'Sigue el sendero revelado',landmark('book3'));
 if(w.progress<7)return at('Sigue a la estrella',{x:342,y:worldY(-1120)});
 if(w.progress===7){if(q.pattern==='done')return at('Despierta la tercera flor',landmark('flower3'));return at(q.pattern==='showing'?'Observa la constelación':`Repite el patrón · Ronda ${q.round+1}/2`,PLANTS[q.pattern==='input'?patternSequence(q)[q.patternStep]:1],q.pattern==='waiting'?'E junto a una planta para comenzar':q.pattern==='showing'?'Espera a que termine la estrella':`Camina y pulsa E · ${q.patternStep}/${patternSequence(q).length}`);}
 return at(storyY(w.y)>-1460?'Entra al claro final':distance(w,landmark('chest'))<59?'Abre el cofre':'Acércate al cofre',landmark('chest'));
}
