import {readFile, access, readdir} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve(import.meta.dirname,'..'), errors=[];
const html=await readFile(resolve(root,'index.html'),'utf8'), css=await readFile(resolve(root,'styles.css'),'utf8');
for(const path of [...html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)].map(m=>m[1])){try{await access(resolve(root,path.split('?')[0]));}catch{errors.push(`Ressource absente : ${path}`);}}
if(!html.includes('lang="fr"'))errors.push('Langue de page absente');
if(!html.includes('width=device-width'))errors.push('Viewport mobile absent');
if(!html.includes('id="app"'))errors.push('Contenu principal absent');
if(!css.includes('font-size:16px'))errors.push('Texte de base inférieur à 16 px');
if(!css.includes('min-height:44px'))errors.push('Commandes tactiles non définies');
if(!css.includes(':focus-visible'))errors.push('Focus visible absent');
if(/https?:\/\//.test(html+css))errors.push('Dépendance réseau dans les ressources de démarrage');
for(const filename of await readdir(resolve(root,'src'))){
  if(!filename.endsWith('.js'))continue;
  const path=resolve(root,'src',filename), code=await readFile(path,'utf8');
  const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});if(result.status)errors.push(result.stderr);
  for(const match of code.matchAll(/(?:from\s+|import\s*)['"](\.\/?[^'"]+)['"]/g)){try{await access(resolve(dirname(path),match[1].split('?')[0]));}catch{errors.push(`Import absent dans ${filename} : ${match[1]}`);}}
}
// Layout contract only; not a browser rendering test.
const widths=[360,375,390,412,430];
const layoutContracts=widths.map(width=>({width,mediaRuleApplies:width<=540,contentWidth:width-12-8-28,twoFieldWidth:(width-12-8-28-10)/2,browserRendered:false}));
for(const contract of layoutContracts)if(contract.twoFieldWidth<130)errors.push(`Champs trop étroits au contrat ${contract.width}`);
const result={status:errors.length?'failed':'passed',kind:'static-source-checks',checks:['Syntaxe de tous les modules','Ressources et imports relatifs présents','Aucune ressource distante au démarrage','Langue, viewport, taille de base, focus et cibles tactiles définis'],layoutContracts,errors};
console.log(JSON.stringify(result,null,2));if(errors.length)process.exitCode=1;
