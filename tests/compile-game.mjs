import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const modules=new Map();
export async function compile(name){
 if(modules.has(name))return modules.get(name);
 let source=ts.transpileModule(await readFile(new URL(`../app/game/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const match of [...source.matchAll(/from ['"]\.\/([^'"]+)['"]/g)])source=source.replace(match[0],`from ${JSON.stringify(await compile(match[1]))}`);
 const result='data:text/javascript;base64,'+Buffer.from(source).toString('base64');modules.set(name,result);return result;
}
