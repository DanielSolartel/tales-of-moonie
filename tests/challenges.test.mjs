import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compile} from './compile-game.mjs';
const g=await import(await compile('challenges'));
const world=(route=0)=>({x:284,y:239,direction:'front',bloomed:false,progress:0,simonMet:false,time:20,secondBloomTime:0,thirdBloomTime:0,challenges:g.freshChallenges(route)});
const tick=(w,seconds)=>{for(let t=0;t<seconds;t+=.02)g.tickChallenges(w,.02);};
test('Los espíritus se liberan al terminar su cinemática, sin duplicados',()=>{
 const w=world();w.x=342;w.y=220;assert.equal(g.nearAction(w),null);
 for(const [i,p] of g.LIGHTS.entries()){Object.assign(w,{x:p.x+30,y:p.y});const a=g.nearAction(w);assert.equal(a.type,'light');g.activateChallenge(w,a);assert.equal(w.challenges.lights[i],false);assert.equal(g.nearAction(w),null);tick(w,4.1);assert.equal(w.challenges.lights.filter(Boolean).length,i+1);g.activateChallenge(w,a);assert.equal(w.challenges.cinema,null);}
 Object.assign(w,{x:342,y:220});assert.equal(g.nearAction(w).kind,'flower');
});
test('Laberinto compacto: cuatro cruces, dos desvíos y un bucle reversibles',()=>{
 const w={...world(),bloomed:true,progress:2};
 for(const points of [g.MAZE_ROUTE,...g.MAZE_BRANCHES])for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],n=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y));for(let j=0;j<=n;j++){const t=j/n,x=a.x+(b.x-a.x)*t,y=g.MAZE_TOP+a.y+(b.y-a.y)*t;assert.ok(g.walkAllowed(w,x,y),`path ${x},${y}`);}}
 assert.equal(g.walkAllowed(w,10,-700),false);assert.equal(g.walkAllowed({...w,progress:1},342,-345),false);w.y=g.MAZE_TOP;g.tickChallenges(w,.02);assert.equal(w.challenges.mazeDone,true);assert.equal(w.challenges.cinema.kind,'bookReveal');
});
for(let route=0;route<3;route++)test(`Arroyo ruta ${route+1}: decisiones físicas y cinco saltos`,()=>{
 const w={...world(route),bloomed:true,progress:3,...g.RIVER_SHORE};g.activateChallenge(w,g.nearAction(w));tick(w,9.1);assert.equal(w.challenges.river,'crossing');
 for(const index of g.RIVER_ROUTES[route]){const p=g.STONES[index],dx=Math.abs(p.x-w.x)<15?0:Math.sign(p.x-w.x),dy=Math.abs(p.x-w.x)<15?Math.sign(p.y-w.y):0;assert.ok(g.tryRiverStep(w,dx,dy));assert.equal(w.challenges.jumpIndex,index,`expected ${index}, from ${w.x},${w.y}`);tick(w,.57);assert.equal(w.challenges.river,'crossing');}
 assert.equal(w.challenges.stone,5);g.tryRiverStep(w,0,-1);tick(w,.57);assert.equal(w.challenges.river,'done');assert.equal(w.progress,3);
});
test('Piedra equivocada devuelve suavemente a la orilla y conserva la ruta',()=>{
 const w={...world(0),bloomed:true,progress:3,...g.RIVER_SHORE};g.activateChallenge(w,g.nearAction(w));tick(w,9.1);g.tryRiverStep(w,1,0);tick(w,.57);assert.equal(w.challenges.river,'returning');const x=w.x,y=w.y;tick(w,1.5);assert.notDeepEqual({x:w.x,y:w.y},{x,y});assert.notEqual(w.y,g.RIVER_SHORE.y);tick(w,7.5);assert.equal(w.challenges.river,'crossing');assert.equal(w.challenges.stone,0);assert.equal(w.challenges.riverRoute,0);assert.equal(w.y,g.RIVER_SHORE.y);
});
test('Tras completar el arroyo, el regreso por las piedras queda bloqueado de inmediato',()=>{
 const w={...world(),bloomed:true,progress:4,...g.RIVER_EXIT};const q=w.challenges;q.river='done';q.stone=5;q.currentStone=-1;
 // En el instante en que el cruce se completa ya no se ofrece ningún salto de regreso.
 for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]])assert.equal(g.tryRiverStep(w,dx,dy),false);
 assert.equal(q.river,'done');assert.equal(q.stone,5);assert.equal(w.progress,4);
 // Caminar hacia atrás se detiene de forma natural justo en el borde de salida: sin caída,
 // sin teletransporte y sin reiniciar el reto ni perder el progreso.
 const start={x:w.x,y:w.y};let moved=0;
 for(let i=0;i<60;i++)if(g.walkAllowed(w,w.x,w.y+1)){w.y+=1;moved++;}
 assert.ok(moved<20,`avanzó ${moved}px hacia el arroyo`);assert.ok(w.y<g.RIVER_TOP+78,'no debe entrar de nuevo a la zona de piedras');
 assert.equal(q.river,'done');assert.equal(q.stone,5);assert.equal(w.progress,4);assert.notEqual(w.x,undefined);
 // Ni las piedras ni el canal de la orilla original vuelven a ser transitables.
 assert.equal(g.walkAllowed(w,g.STONES[8].x,g.STONES[8].y),false);
 assert.equal(g.walkAllowed(w,290,g.RIVER_TOP+250),false);
 // Seguir de largo hacia el bosque, en cambio, funciona con normalidad.
 assert.ok(g.walkAllowed(w,320,g.RIVER_TOP+40));
 // Una partida nueva no conserva el bloqueo: freshChallenges vuelve a 'waiting'.
 assert.equal(g.freshChallenges().river,'waiting');
});
test('Constelación de dos rondas: error conserva la primera y Simón es opcional',()=>{
 const w={...world(),bloomed:true,progress:7,...g.PLANTS[1]};g.activateChallenge(w,g.nearAction(w));tick(w,4.3);
 for(const idx of g.PATTERNS[0]){Object.assign(w,{x:g.PLANTS[idx].x+29,y:g.PLANTS[idx].y});g.activateChallenge(w,g.nearAction(w));}
 assert.equal(w.challenges.round,1);tick(w,5.1);Object.assign(w,{x:g.PLANTS[1].x+29,y:g.PLANTS[1].y});g.activateChallenge(w,g.nearAction(w));assert.equal(w.challenges.round,1);assert.equal(w.challenges.patternStep,0);tick(w,3.6);
 for(const idx of g.PATTERNS[1]){Object.assign(w,{x:g.PLANTS[idx].x+29,y:g.PLANTS[idx].y});g.activateChallenge(w,g.nearAction(w));}
 assert.equal(w.challenges.pattern,'done');assert.equal(w.simonMet,false);tick(w,4.6);w.x=322;w.y=g.worldY(-1320);assert.equal(g.nearAction(w).kind,'flower3');
});
test('Pausa congela todos los estados y el reinicio elimina residuos',()=>{
 const a=world(),b=world();tick(a,50);assert.ok(a.challenges.searchTime>=50);assert.equal(b.challenges.searchTime,0);g.startCinema(a,'spirit',0);const before=JSON.stringify(a);g.tickChallenges(a,0);assert.equal(JSON.stringify(a),before);assert.equal(b.challenges.cinema,null);a.challenges.lights[0]=true;assert.equal(b.challenges.lights[0],false);
});
test('Las ayudas alcanzan cada umbral y se congelan durante los planos',()=>{
 const w=world(),q=w.challenges;tick(w,25.1);assert.ok(q.searchTime>=25&&q.searchTime<50);tick(w,25);assert.ok(q.searchTime>=50);
 g.startCinema(w,'spirit',0,4);const before=q.searchTime;tick(w,2);assert.equal(q.searchTime,before);tick(w,2.1);assert.ok(q.searchTime<.12);
 Object.assign(w,{bloomed:true,progress:2,x:337,y:-534});q.cinema=null;
 for(const threshold of [45,75,105]){tick(w,threshold-q.mazeTime+.05);assert.ok(q.mazeTime>=threshold);const frozen=q.mazeTime;g.tickChallenges(w,0);assert.equal(q.mazeTime,frozen);}
});
test('Cada ruta conserva su secuencia después de errores desde piedras interiores',()=>{
 for(let route=0;route<3;route++){
  const w={...world(route),bloomed:true,progress:3,...g.RIVER_SHORE},q=w.challenges;g.activateChallenge(w,g.nearAction(w));tick(w,5.1);
  for(const index of g.RIVER_ROUTES[route].slice(0,3)){const p=g.STONES[index],dx=Math.abs(p.x-w.x)<15?0:Math.sign(p.x-w.x),dy=dx?0:Math.sign(p.y-w.y);g.tryRiverStep(w,dx,dy);tick(w,.57);}
  assert.equal(q.stone,3);g.tryRiverStep(w,0,1);tick(w,.57);assert.equal(q.river,'returning');tick(w,7);assert.equal(q.river,'crossing');assert.equal(q.stone,0);assert.equal(q.riverRoute,route);assert.equal(w.y,g.RIVER_SHORE.y);
 }
});
test('Los hitos narrativos conservan coordenadas reversibles al ampliar el mapa',()=>{for(const y of [239,0,-236,-295,-382,-560,-1000,-1250,-1320,-1620])assert.equal(g.storyY(g.worldY(y)),y);});

test('El mapa integrado conecta todos los retos, la historia y el final',()=>{
 const w=world();
 const reach=(target,radius=25)=>{
  const queue=[{x:w.x,y:w.y}],seen=new Set(),step=4;
  for(let cursor=0;cursor<queue.length;cursor++){
   const p=queue[cursor];if(Math.hypot(p.x-target.x,p.y-target.y)<radius){Object.assign(w,p);return;}
   for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){const x=p.x+dx,y=p.y+dy,key=x+','+y;if(seen.has(key))continue;seen.add(key);if(g.walkAllowed(w,x,y))queue.push({x,y});}
  }
  assert.fail(`No route from ${w.x},${w.y} to ${target.x},${target.y}`);
 };
 for(const p of g.LIGHTS)reach(p,40);
 reach({x:365,y:212},35);w.challenges.lights=[true,true,true];w.bloomed=true;
 reach({x:187,y:-236},48);w.progress=1;reach({x:416,y:-295},46);w.progress=2;
 reach({x:328,y:g.MAZE_TOP-4},10);w.challenges.mazeDone=true;
 reach({x:461,y:g.worldY(-382)},48);w.progress=3;reach(g.RIVER_SHORE,30);
 Object.assign(w,g.RIVER_EXIT);w.challenges.river='done';reach({x:360,y:g.worldY(-560)},38);
 w.progress=4;reach({x:195,y:g.worldY(-1000)},48);w.progress=6;reach({x:342,y:g.worldY(-1110)},10);
 w.progress=7;for(const p of g.PLANTS)reach(p,40);reach({x:430,y:g.worldY(-1250)},50);
 reach({x:342,y:g.worldY(-1320)},39);w.challenges.pattern='done';w.progress=8;
 reach({x:320,y:g.worldY(-1620)},58);
});
