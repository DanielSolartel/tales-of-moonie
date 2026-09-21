import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
const text=await readFile(new URL('../app/game/story.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const story=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
function reachable(bloomed,progress=0) {
  const queue=[[story.SPAWN.x,story.SPAWN.y]],seen=new Set([queue[0].join(',')]);
  for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[2,0],[-2,0],[0,2],[0,-2]]){
    const [x,y]=queue[i],p=[x+dx,y+dy],key=p.join(',');
    if(!seen.has(key)&&story.canWalk(...p,bloomed,progress)){seen.add(key);queue.push(p);}
  }
  return queue;
}
test('La primera flor es alcanzable y el sendero se abre únicamente al despertar',()=>{
  const before=reachable(false),after=reachable(true);
  assert.ok(before.some(([x,y])=>Math.hypot(x-story.FLOWER.x,y-story.FLOWER.y)<story.FLOWER.radius));
  assert.ok(before.every(([,y])=>y>=108));
  assert.ok(after.some(([,y])=>y<92));
});
test('Cada escena de la ampliación es alcanzable, secuencial y reversible',()=>{
  for(let progress=0;progress<4;progress++) {
    const area=reachable(true,progress),kind=story.SEQUENCE[progress];
    assert.ok(area.some(([x,y])=>story.nearbyInteraction(x,y,true,progress)===kind),kind+' alcanzable');
    assert.equal(story.completeScene(progress,kind),progress+1);
    for(const other of story.SEQUENCE.filter(s=>s!==kind))assert.equal(story.completeScene(progress,other),progress);
    assert.ok(area.every(([,y])=>y>=-610),'sendero oculto cerrado');
  }
  const complete=reachable(true,4);
  assert.ok(complete.some(([,y])=>y<-635),'cierre alcanzable');
  assert.equal(story.completeScene(4,'flower2'),4,'sin doble incremento');
  for(const progress of [0,1,2,3,4]) {
    assert.equal(story.canWalk(280,-480,true,progress),false,'agua bloqueada');
    assert.equal(story.canWalk(320,-480,true,progress),true,'piedras seguras');
  }
});
test('Los textos de las escenas 3–6 coinciden con el Documento Maestro',async()=>{
  const master=await readFile(new URL('../docs/Documento-Maestro.md',import.meta.url),'utf8');
  for(const kind of story.SEQUENCE)for(const line of story.SCRIPTS[kind])assert.ok(master.includes('> '+line.text),line.text);
  assert.equal(story.SIGN_LINES[0].text,'Abre bien los hojos.');
  assert.deepEqual(story.SEQUENCE.slice(0,4),['book1','sign','book2','flower2']);
});
test('El tercer tramo respeta todos los textos exactos y el orden autorizado',async()=>{
  const master=await readFile(new URL('../docs/Documento-Maestro.md',import.meta.url),'utf8');
  for(const kind of ['book3','star','roots','fall','simon','flower3'])for(const line of story.SCRIPTS[kind])assert.ok(master.includes('> '+line.text),line.text);
  assert.deepEqual(story.SEQUENCE.slice(4),['book3','star','fall','flower3']);
  for(const p of [4,5,6,7,8])assert.equal(story.completeScene(p,'simon'),p);
});
test('Libro, raíces, Simón opcional, flor y salida son alcanzables sin saltarse escenas',()=>{
  for(const [progress,kind] of [[4,'book3'],[7,'flower3']])assert.ok(reachable(true,progress).some(([x,y])=>story.nearbyInteraction(x,y,true,progress)===kind));
  assert.ok(reachable(true,6).some(([,y])=>y<-1105),'caída alcanzable');
  assert.ok(reachable(true,7).some(([x,y])=>story.nearbyInteraction(x,y,true,7)==='simon'),'Simón alcanzable');
  assert.equal(story.canWalk(320,-1380,true,7),false,'enredaderas cerradas');
  assert.ok(reachable(true,8).some(([,y])=>y<-1370),'salida alcanzable sin Simón');
  assert.equal(story.completeScene(8,'flower3'),8,'no se repiten flores');
});
test('Los límites y la flor bloquean el cuerpo sin bloquear el punto de aparición',()=>{
  assert.equal(story.canWalk(story.SPAWN.x,story.SPAWN.y,false),true);
  for(const p of [[0,0],[640,360],[365,212]])assert.equal(story.canWalk(...p,true),false);
  assert.equal(story.canWalk(320,20,false),false);
  assert.equal(story.canWalk(320,20,true),true); // authorized seamless extension
});
test('La introducción y el primer encuentro conservan los textos aprobados',()=>{
  assert.equal(story.CLASSROOM[2].text,'El equilibrio duró siete segundos.');
  assert.equal(story.AWAKENING[1].text,'Esto definitivamente no es Humanística III.');
  assert.equal(story.FLOWER_LINES[1].text,'Voy a tocarla.');
  assert.equal(story.FLOWER_LINES.length,2);
});
test('La portada usa el subtítulo aprobado sin el texto retirado',async()=>{
  const source=await readFile(new URL('../app/game/MoonieGame.tsx',import.meta.url),'utf8');
  assert.match(source,/Un pequeño cuento bajo la luna/);
  assert.doesNotMatch(source,/UN CUENTO PARA TI/);
});
test('El cofre solo es alcanzable tras las tres flores y Simón sigue opcional',()=>{
  assert.equal(story.canWalk(320,-1560,true,7),false);
  const area=reachable(true,8);
  for(const simonMet of [false,true])assert.ok(area.some(([x,y])=>story.nearbyInteraction(x,y,true,8,simonMet)==='chest'));
  assert.equal(story.nearbyInteraction(320,-1400,true,8),null);
  assert.equal(story.canWalk(320,-1620,true,8),false,'cofre sólido');
});
test('Las enredaderas y la colisión comparten el instante de apertura',()=>{
  for(const age of [0,.6,1.6,2.599])assert.equal(story.canWalk(325,-615,true,4,age),false);
  assert.equal(story.canWalk(325,-615,true,4,2.6),true);
  for(const age of [0,1.2,2.2,3.199])assert.equal(story.canWalk(320,-1380,true,8,10,age),false);
  assert.equal(story.canWalk(320,-1380,true,8,10,3.2),true);
});
test('Cofre y carta contienen literalmente el texto autorizado',async()=>{
  const master=await readFile(new URL('../docs/Documento-Maestro.md',import.meta.url),'utf8');
  for(const line of story.CHEST_LINES)assert.ok(master.includes('> '+line.text));
  for(const line of story.LETTER)assert.ok(master.includes('> '+line));
  assert.equal(story.LETTER[2],'Sábado 05/09/2026');
  const ui=await readFile(new URL('../app/game/MoonieGame.tsx',import.meta.url),'utf8');
  assert.doesNotMatch(ui,/Prueba completada|setFinished/);
  assert.match(ui,/FIN… POR AHORA 🌙/);
});
