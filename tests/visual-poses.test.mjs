import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {compile} from './compile-game.mjs';
const {rootShotLayout,REF_POSES}=await import(await compile('referencias'));

test('Caída: cuerpo completo y estrella fuera del diálogo, también en recuperación',()=>{
  for(const top of [180,210,240,260,280]){
    const p=rootShotLayout(top);
    assert.ok(p.feetY<=top-18,'margen libre para el diálogo');
    assert.ok(p.starY+20<top-18,'estrella visible fuera del cuadro');
    for(const pose of ['recostada','levantarse'])for(const outfit of ['real','artist','explorer']){
      const q=REF_POSES[pose][outfit];
      assert.ok(p.feetY-q.h*2>=0,'pose entera dentro del plano');
      assert.ok(p.x-q.w>=0&&p.x+q.w<=640);
    }
  }
});

test('El atlas mantiene sus dimensiones y cada recorte/anclaje aprobado',async()=>{
  const png=await readFile(new URL('../public/assets/moonie-poses-referencias.png',import.meta.url));
  const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
  assert.equal(width,332);assert.equal(height,201);
  for(const group of Object.values(REF_POSES))for(const q of Object.values(group)){
    assert.ok(q.x+q.w<=width&&q.y+q.h<=height);
    assert.ok(q.anchor.eyes.every(x=>x>=0&&x<q.w));
    assert.ok(q.anchor.y>0&&q.anchor.y<q.h);
  }
});
