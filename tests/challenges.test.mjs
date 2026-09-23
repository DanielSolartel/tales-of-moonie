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
 assert.equal(g.walkAllowed(w,10,-700),false);assert.equal(g.walkAllowed({...w,progress:1},342,-345),false);w.y=g.MAZE_TOP;g.tickChallenges(w,.02);assert.equal(w.challenges.mazeDone,true);
 // Documento Maestro: al salir se reproduce la revelación del segundo libro y cambia el objetivo.
 assert.equal(w.challenges.cinema.kind,'bookReveal');assert.equal(g.objectiveFor(w).text,'Examina el segundo libro');
});
test('La salida del laberinto no atasca a Moonie con controles normales',()=>{
 // Réplica del bucle real de movimiento (igual que el test del arroyo de más abajo):
 // sostener "arriba" desde justo antes de la salida no debe dejarla clavada en el punto
 // exacto donde estaba el bug (apenas 5px pasada la salida, antes del parche).
 const VIEW_SPEED=77;
 const frame=(w,dx,dy,dt)=>{
  const len=Math.hypot(dx,dy)||1,ndx=dx/len*VIEW_SPEED*dt,ndy=dy/len*VIEW_SPEED*dt;
  const bx=w.x,by=w.y;
  if(g.walkAllowed(w,w.x+ndx,w.y))w.x+=ndx;
  if(g.walkAllowed(w,w.x,w.y+ndy))w.y+=ndy;
  return Math.abs(w.x-bx)+Math.abs(w.y-by)>1e-6;
 };
 const w={x:g.MAZE_ROUTE[7].x,y:g.MAZE_TOP+g.MAZE_ROUTE[7].y-4,bloomed:true,progress:2,challenges:g.freshChallenges(0)};
 for(let i=0;i<120;i++)frame(w,0,-1,1/60); // 2s reales sosteniendo "arriba" (norte)
 // Antes del parche quedaba clavada en y=MAZE_TOP-5 (apenas salir) los 2s completos.
 assert.ok(w.y<g.MAZE_TOP-70,`solo avanzó hasta y=${w.y}, antes se atascaba en MAZE_TOP-5`);
 // Sostener "arriba" el resto del camino la detiene, con razón, justo en la reja del río
 // (progreso<3 todavía): eso es la historia, no el bug — no debe ir más allá.
 for(let i=0;i<300;i++)frame(w,0,-1,1/60); // 5s más
 assert.ok(w.y>g.RIVER_TOP,'no debe entrar al arroyo antes de leer el segundo libro');
});
for(let route=0;route<3;route++)test(`Arroyo ruta ${route+1}: decisiones físicas y cinco saltos`,()=>{
 const w={...world(route),bloomed:true,progress:3,...g.RIVER_SHORE};g.activateChallenge(w,g.nearAction(w));tick(w,9.1);assert.equal(w.challenges.river,'crossing');
 for(const index of g.RIVER_ROUTES[route]){const p=g.STONES[index],dx=Math.abs(p.x-w.x)<15?0:Math.sign(p.x-w.x),dy=Math.abs(p.x-w.x)<15?Math.sign(p.y-w.y):0;assert.ok(g.tryRiverStep(w,dx,dy));assert.equal(w.challenges.jumpIndex,index,`expected ${index}, from ${w.x},${w.y}`);tick(w,.57);assert.equal(w.challenges.river,'crossing');}
 assert.equal(w.challenges.stone,5);g.tryRiverStep(w,0,-1);tick(w,.57);assert.equal(w.challenges.river,'done');assert.equal(w.progress,3);
});
test('Piedra equivocada devuelve suavemente a la orilla y conserva la ruta',()=>{
 const w={...world(0),bloomed:true,progress:3,...g.RIVER_SHORE};g.activateChallenge(w,g.nearAction(w));tick(w,9.1);g.tryRiverStep(w,1,0);tick(w,.57);assert.equal(w.challenges.river,'returning');const x=w.x,y=w.y;tick(w,1.5);assert.notDeepEqual({x:w.x,y:w.y},{x,y});assert.notEqual(w.y,g.RIVER_SHORE.y);tick(w,7.5);assert.equal(w.challenges.river,'crossing');assert.equal(w.challenges.stone,0);assert.equal(w.challenges.riverRoute,0);assert.equal(w.y,g.RIVER_SHORE.y);
});
test('Salida del laberinto: revelación anclada, sin retroceso, posición intacta y regreso libre',()=>{
 // Bucle real (tickChallenges + movimiento por ejes a 77 u/s, 60 fps) desde el centro, ambos
 // bordes y ambas diagonales. La revelación del segundo libro (Documento Maestro) se reproduce
 // una vez; la cámara se queda en el encuadre previo durante el fundido, corta a un plano
 // cercano ANCLADO en el libro y vuelve exactamente al encuadre previo: nunca avanza y retrocede.
 const SP=77/60;
 for(const [x0,dx] of [[328,0],[312,0],[344,0],[320,1],[336,-1]]){
  const w={x:x0,y:g.MAZE_TOP+30,direction:'back',bloomed:true,progress:2,time:20,secondBloomTime:0,thirdBloomTime:0,challenges:g.freshChallenges(0)};
  const len=Math.hypot(dx,1);let prev=w.y,start=null,wide=null,closeY=null,frames=0,sawClose=false;
  for(let i=0;i<420;i++){
   g.tickChallenges(w,1/60);const c=w.challenges.cinema,cam=g.cinemaCamera(w);
   if(c){assert.equal(c.kind,'bookReveal');frames++;
    if(!start){start={x:w.x,y:w.y};wide=g.gameCamera(w.y);}
    assert.deepEqual({x:w.x,y:w.y},start,'Moonie no se desplaza durante la revelación');
    if(cam.close<.5)assert.equal(cam.y,wide,'sin panorámica: el plano abierto no se mueve');
    else{sawClose=true;if(closeY===null)closeY=cam.y;assert.equal(cam.y,closeY,'el plano cercano está anclado en el libro');}
    continue;}
   if(start&&frames)assert.equal(cam.y,g.gameCamera(w.y),'al terminar, la cámara vuelve al encuadre de juego');
   const nx=dx/len*SP,ny=-1/len*SP;if(g.walkAllowed(w,w.x+nx,w.y))w.x+=nx;if(g.walkAllowed(w,w.x,w.y+ny))w.y+=ny;
   assert.ok(w.y<=prev+1e-9,`x0=${x0}: retrocedió (${prev.toFixed(2)} -> ${w.y.toFixed(2)})`);prev=w.y;
  }
  assert.ok(frames>=200&&frames<=215&&sawClose,`x0=${x0}: la revelación debe durar ~3,5 s con plano cercano (${frames})`);
  assert.equal(g.objectiveFor(w).text,'Examina el segundo libro');
  assert.ok(w.y<g.MAZE_TOP-40,`x0=${x0}: no salió (y=${w.y.toFixed(1)})`);
  w.x=328;for(let i=0;i<150;i++){g.tickChallenges(w,1/60);if(g.walkAllowed(w,w.x,w.y+SP))w.y+=SP;}
  assert.ok(w.y>g.MAZE_TOP+20,`x0=${x0}: no pudo volver a entrar (y=${w.y.toFixed(1)})`);
  assert.equal(w.challenges.cinema,null,'volver a cruzar no repite la revelación');
 }
});
test('Cinemáticas: todo plano cercano es un fundido-corte anclado y la cámara vuelve exacta',()=>{
 // Espíritus, ritual, flores y bookReveal: mientras el plano abierto se funde no hay ningún
 // deslizamiento (encuadre idéntico al previo); el plano cercano queda fijo en su sujeto; al
 // terminar, la cámara es exactamente la del juego. Las panorámicas amplias arrancan suaves.
 for(const [kind,index,x,y] of [['spirit',0,200,520],['spirit',2,450,560],['ritual',0,342,230],['bloom2',0,360,g.worldY(-600)],['bloom3',0,342,g.worldY(-1280)],['bookReveal',0,328,g.MAZE_TOP-2]]){
  const w={x,y,direction:'back',bloomed:true,progress:3,time:20,secondBloomTime:0,thirdBloomTime:0,challenges:g.freshChallenges(0)};
  const before=g.cinemaCamera(w);g.startCinema(w,kind,index,4);const q=w.challenges;let anchored=null,sawClose=false;
  for(let t=0;t<4;t+=1/60){q.cinema.time=t;const cam=g.cinemaCamera(w);
   if(cam.close<.5)assert.equal(cam.y,before.y,`${kind}: el plano abierto se deslizó en t=${t.toFixed(2)}`);
   else{sawClose=true;if(anchored===null)anchored=cam.y;assert.equal(cam.y,anchored,`${kind}: el plano cercano no está anclado`);}
   assert.deepEqual({x:w.x,y:w.y},{x,y},`${kind}: Moonie no se mueve`);}
  assert.ok(sawClose,`${kind}: debe llegar al plano cercano`);q.cinema=null;
  assert.deepEqual(g.cinemaCamera(w),before,`${kind}: la cámara no vuelve exacta`);
 }
 // Cada panorámica parte del lugar donde ocurre en la historia: la orilla del arroyo, o el
 // claro de las plantas para la demostración del patrón y la constelación.
 for(const [kind,y0] of [['riverDemo',g.RIVER_SHORE.y],['patternDemo',g.worldY(-1200)],['constellation',g.worldY(-1200)]]){
  const w={x:320,y:y0,direction:'back',bloomed:true,progress:3,time:20,secondBloomTime:0,thirdBloomTime:0,challenges:g.freshChallenges(0)};
  const before=g.cinemaCamera(w);g.startCinema(w,kind,0,5);const q=w.challenges;
  q.cinema.time=1/60;assert.ok(Math.abs(g.cinemaCamera(w).y-before.y)<=1,`${kind}: la panorámica arranca de golpe`);
  q.cinema.time=5-1/60;assert.ok(Math.abs(g.cinemaCamera(w).y-before.y)<=1,`${kind}: la panorámica frena de golpe`);
  q.cinema=null;assert.deepEqual(g.cinemaCamera(w),before,`${kind}: la cámara no vuelve exacta`);
 }
});
test('Luciérnagas: vuelo individual, píxeles enteros, plano lejano y congeladas en pausa',async()=>{
 const fx=await import(await compile('effects'));
 const at=(t,cam=0)=>Array.from({length:27},(_,i)=>fx.fireflyAt(i,t,cam));
 for(const t of [0,3.37,17.9,123.456])for(const f of at(t,-777.3)){assert.ok(Number.isInteger(f.x)&&Number.isInteger(f.y),'posición no entera');}
 assert.deepEqual(at(42.5,-300),at(42.5,-300),'con el mismo tiempo (pausa) no se mueven');
 // En un mismo intervalo cada una se desplaza distinto: no vuelan en bloque.
 // Ventana de 3,5 s: en menos tiempo los desplazamientos redondeados a píxel coinciden por discretización.
 const a=at(10),b=at(13.5),moves=new Set(a.map((f,i)=>`${b[i].x-f.x},${b[i].y-f.y}`));
 assert.ok(moves.size>=20,`solo ${moves.size} desplazamientos distintos entre 27 luciérnagas`);
 const blinkA=at(5).map(f=>f.opacity),blinkB=at(5.6).map(f=>f.opacity),rises=blinkA.filter((o,i)=>blinkB[i]>o).length;
 assert.ok(rises>4&&rises<23,'los parpadeos no deben ir sincronizados');
 // Plano lejano: al mover la cámara 100 unidades, la banda se desplaza 12 (módulo 290).
 const band=(i,cam)=>((((i*89)%290)-cam*fx.FIREFLY_PLANE)%290+290)%290;
 assert.ok(Math.abs(((band(5,0)-band(5,100))+290)%290-12)<1e-9);
 // Al envolver en los bordes de la banda se desvanecen: nunca aparecen de golpe.
 for(let cam=0;cam<2500;cam+=7)for(const f of at(9,cam)){const edge=f.edge;if(edge<.05)assert.ok(f.opacity<.05,'aparición brusca al envolver');}
});
test('Rayos lunares del laberinto estables al cruzar las bocas: ningún parpadeo',()=>{
 // Los rayos se dibujaban solo con Moonie dentro, y el del punto de salida cruzaba la frontera:
 // una luz se encendía y apagaba en cada cruce. Ahora son escenario y la boca no tiene rayo.
 const SP=77/60;
 // Un laberinto sin resolver solo se cruza de ida y vuelta por la ENTRADA (salir lo resuelve una
 // única vez); resuelto, se cruza por la SALIDA. Ambos casos, con y sin ayuda de 45/105 s.
 for(const [mazeTime,mazeDone,mouth] of [[0,true,'salida'],[60,true,'salida'],[120,true,'salida'],[0,false,'entrada'],[60,false,'entrada'],[120,false,'entrada']]){
  const edge=mouth==='salida'?g.MAZE_TOP:g.MAZE_BOTTOM,sideIn=y=>mouth==='salida'?y>edge:y<edge;
  const w={x:328,y:mouth==='salida'?edge+40:edge-40,bloomed:true,progress:2,time:20,secondBloomTime:0,thirdBloomTime:0,challenges:g.freshChallenges(0)};
  const q=w.challenges;q.mazeTime=mazeTime;q.mazeDone=mazeDone;g.tickChallenges(w,1/60);
  let t=20,before=g.mazeRays(q,t),glow=g.guideGlowActive(w),crossings=0,wasIn=sideIn(w.y);
  for(let n=0;n<6;n++)for(const dir of (mouth==='salida'?[-1,1]:[1,-1]))for(let i=0;i<80;i++){
   t+=1/60;w.time=t;g.tickChallenges(w,1/60);if(g.walkAllowed(w,w.x,w.y+dir*SP))w.y+=dir*SP;
   if(sideIn(w.y)!==wasIn){crossings++;wasIn=sideIn(w.y);}
   const rays=g.mazeRays(q,t);assert.equal(rays.length,6);
   for(const [k,r] of rays.entries()){assert.ok(r.y>g.MAZE_TOP+40,'ningún rayo sobre la boca de salida');assert.ok(Math.abs(r.alpha-before[k].alpha)<.004,`salto de luz (${mouth}, ${mazeTime}s)`);}
   assert.equal(g.guideGlowActive(w),glow,`el resplandor de guía cambió al cruzar la ${mouth} (${mazeTime}s)`);
   before=rays;
  }
  assert.equal(q.mazeDone,mazeDone,'cruzar no cambia el estado del laberinto');
  assert.ok(crossings>=10,`solo ${crossings} cruces de la ${mouth}`);
 }
});
test('La tercera planta del minijuego queda en el suelo abierto del claro, fuera de los árboles',()=>{
 // Comprobación geométrica con la máscara medida del dibujo del claro (CLEARING_MASK).
 const P=g.PLANTS.map(p=>({x:p.x,y:g.storyY(p.y)})),d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 assert.deepEqual(P.slice(0,2),[{x:174,y:-1207},{x:280,y:-1174}],'las dos primeras no se mueven');
 const f=g.plantFootprint(P[2]);
 assert.equal(f.openBase,1,'toda su base pisa el suelo abierto del claro');
 assert.ok(f.bodyClearOfTrees>=.95,`su cuerpo no se mete en copas ni troncos (${(f.bodyClearOfTrees*100).toFixed(0)}% libre)`);
 const old=g.plantFootprint({x:184,y:-1317});
 assert.equal(old.openBase,0,'la máscara detecta que la posición anterior estaba entre los árboles');
 for(const p of P.slice(0,2))assert.ok(g.plantFootprint(p).openBase>=.75,'las plantas aprobadas también están en el claro');
 assert.ok(d(P[2],{x:430,y:-1250})>=165&&d(P[2],{x:342,y:-1320})>=100,'separada de Simón y de la flor lunar');
 assert.ok(d(P[2],P[0])>=75&&d(P[2],P[1])>=75,'no se superpone con las otras plantas');
 const w={bloomed:true,progress:7,time:20,secondBloomTime:0,thirdBloomTime:0,challenges:g.freshChallenges(0)};
 let reach=false;for(let a=0;a<360&&!reach;a+=10)for(let r=26;r<=46&&!reach;r+=4){const x=g.PLANTS[2].x+Math.cos(a*Math.PI/180)*r,y=g.PLANTS[2].y+Math.sin(a*Math.PI/180)*r;if(g.walkAllowed(w,x,y))reach=true;}
 assert.ok(reach,'se puede llegar a su zona de interacción');
});
test('La entrada del laberinto no choca con controles normales en ninguna columna del camino',()=>{
 // Reproduce el fallo observado en Chromium: subiendo por x=312/320/327 Moonie se detenía en
 // y≈-316/-321/-326 contra una pared diagonal entre el sendero anterior y el pasillo.
 const VIEW_SPEED=77;
 const frame=(w,dy,dt)=>{const ndy=dy*VIEW_SPEED*dt;if(g.walkAllowed(w,w.x,w.y+ndy))w.y+=ndy;};
 for(const x of [312,320,327,340]){
  const w={x,y:-285,bloomed:true,progress:2,time:20,secondBloomTime:0,thirdBloomTime:0,challenges:g.freshChallenges(0)};
  for(let i=0;i<150;i++)frame(w,-1,1/60); // 2.5s reales hacia arriba
  assert.ok(w.y<-345,`x=${x}: se detuvo en y=${w.y.toFixed(1)} antes de entrar`);
  for(let i=0;i<150;i++)frame(w,1,1/60); // y de vuelta al sendero
  assert.ok(w.y>-300,`x=${x}: no pudo volver a salir (y=${w.y.toFixed(1)})`);
 }
});
test('Orilla opuesta: Moonie se detiene sobre la tierra, sin pisar el borde de la primera piedra',()=>{
 // Estado exacto observado en el navegador tras cruzar con flechas: river 'done', stone 5,
 // en RIVER_EXIT. Antes se detenía en y=-1422, a 20 unidades del centro de la piedra superior
 // (y=-1402): los pies quedaban sobre su borde. Se exige un margen visual de 30 unidades.
 const VIEW_SPEED=77,top=g.STONES.reduce((a,p)=>p.y<a.y?p:a);
 for(const x of [294,320,346]){
  const w={...world(),bloomed:true,progress:3,x,y:g.RIVER_EXIT.y};const q=w.challenges;q.river='done';q.stone=5;q.currentStone=-1;
  for(let i=0;i<300;i++){const ndy=VIEW_SPEED/60;if(!g.tryRiverStep(w,0,1)&&g.walkAllowed(w,w.x,w.y+ndy))w.y+=ndy;}
  assert.ok(top.y-w.y>=30,`x=${x}: quedó a ${(top.y-w.y).toFixed(1)} del centro de la primera piedra`);
  assert.equal(q.river,'done');assert.equal(q.stone,5);assert.equal(w.progress,3);
 }
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
test('Entradas reales de teclado (cuadro a cuadro, como en el juego) no logran regresar por las piedras',()=>{
 // Reproduce exactamente la integración de movimiento de MoonieGame.tsx: normaliza dx/dy,
 // multiplica por VIEW.speed*dt, intenta tryRiverStep y solo si falla aplica walkAllowed
 // por eje. No es una aserción de estado: es la simulación del bucle real, tecla por tecla.
 const VIEW_SPEED=77,busy=(q)=>!!q.cinema||q.river==='jumping';
 const frame=(w,dx,dy,dt)=>{
  const jumped=(dx||dy)&&!busy(w.challenges)&&g.tryRiverStep(w,dx,dy);
  if(jumped)return true;
  if((dx||dy)&&!busy(w.challenges)&&w.challenges.river!=='returning'){
   const len=Math.hypot(dx,dy),ndx=dx/len*VIEW_SPEED*dt,ndy=dy/len*VIEW_SPEED*dt;
   const bx=w.x,by=w.y;
   if(g.walkAllowed(w,w.x+ndx,w.y))w.x+=ndx;
   if(g.walkAllowed(w,w.x,w.y+ndy))w.y+=ndy;
   return Math.abs(w.x-bx)+Math.abs(w.y-by)>1e-6;
  }
  return false;
 };
 // Caso 1: mantener "abajo" presionada 5 segundos reales a 60fps desde la salida exacta.
 {const w={...world(),bloomed:true,progress:4,...g.RIVER_EXIT};w.challenges.river='done';w.challenges.stone=5;w.challenges.currentStone=-1;
  for(let i=0;i<300;i++)frame(w,0,1,1/60);
  assert.ok(w.y<g.RIVER_TOP+78,`quedó en ${w.y}, debía detenerse antes de las piedras`);
  assert.ok(!g.STONES.some(p=>Math.hypot(p.x-w.x,p.y-w.y)<20),'no debe terminar sobre ninguna piedra');
  assert.ok(Math.hypot(g.RIVER_SHORE.x-w.x,g.RIVER_SHORE.y-w.y)>20,'no debe terminar en la orilla original');}
 // Caso 2: alternar abajo/izquierda/derecha 8 segundos (una jugadora insistiendo), desde un x desplazado.
 {const w={...world(),bloomed:true,progress:4,x:g.RIVER_EXIT.x-12,y:g.RIVER_EXIT.y};w.challenges.river='done';w.challenges.stone=5;w.challenges.currentStone=-1;
  const dirs=[[0,1],[1,1],[-1,1],[0,1]];
  for(let i=0;i<480;i++){const [dx,dy]=dirs[Math.floor(i/60)%dirs.length];frame(w,dx,dy,1/60);}
  assert.ok(w.y<g.RIVER_TOP+80,`quedó en ${w.y}`);
  assert.ok(!g.STONES.some(p=>Math.hypot(p.x-w.x,p.y-w.y)<20));}
 // Caso 3: volver desde mucho más al norte (como si hubiera seguido jugando y regresa a pie).
 {const w={...world(),bloomed:true,progress:4,x:320,y:g.RIVER_TOP-400};w.challenges.river='done';w.challenges.stone=5;w.challenges.currentStone=-1;
  for(let i=0;i<900;i++)frame(w,0,1,1/60); // 15s reales sosteniendo "abajo"
  assert.ok(w.y<g.RIVER_TOP+78,`quedó en ${w.y}`);
  assert.ok(!g.STONES.some(p=>Math.hypot(p.x-w.x,p.y-w.y)<20));}
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
