import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import ts from 'typescript';
export const {createCanvas,Image}=createRequire(import.meta.url)('@napi-rs/canvas');
const uri=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const modules=new Map();
export async function compile(name){
  if(modules.has(name))return modules.get(name);
  let source=ts.transpileModule(await readFile(new URL(`../app/game/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const match of [...source.matchAll(/from ['"]\.\/([^'"]+)['"]/g)])source=source.replace(match[0],`from ${JSON.stringify(await compile(match[1]))}`);
  const result=uri(source);modules.set(name,result);return result;
}
export async function loadRenderer(){
  globalThis.document={createElement:()=>createCanvas(1,1)};
  globalThis.Image=class extends Image {set src(value){super.src=value.startsWith('data:')?value:resolve('public',value.replace(/^\//,''));}get src(){return super.src;}};
  const {MoonieRenderer}=await import(await compile('render'));
  const renderer=new MoonieRenderer();await renderer.load();return renderer;
}
