// Service-worker lifecycle simulation. This is not an airplane-mode browser test.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access,readdir} from 'node:fs/promises';
import vm from 'node:vm';
import {startOffline,offlineMessage,activateOfflineUpdate} from '../src/offline.js';
import {APP_VERSION} from '../src/domain.js';
const root=new URL('../',import.meta.url),code=await readFile(new URL('sw.js',root),'utf8');
const base='https://example.test/mon-carnet-recettes/';
const prefix='carnet-shell:'+encodeURIComponent('/mon-carnet-recettes/')+':';
const release=prefix+APP_VERSION;

function worker({failAt=null}={}){
 const handlers={},stores=new Map(),fetched=[];let claimed=false,skipped=false;
 const cacheFor=name=>{
  if(!stores.has(name))stores.set(name,new Map());
  const rows=stores.get(name);
  return {async addAll(paths){for(const request of paths){const path=typeof request==='string'?request:request.url;if(typeof request!=='string')assert.equal(request.cache,'reload');fetched.push(path);if(failAt&&path.includes(failAt))throw Error('Réseau coupé');rows.set(path,new Response('cached:'+path));}},async match(key){return rows.get(typeof key==='string'?key:key.url)?.clone();}};
 };
 const caches={open:async name=>cacheFor(name),keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name)};
 const self={skipWaiting:async()=>{skipped=true;},registration:{scope:base},clients:{claim:async()=>{claimed=true;}},addEventListener(name,fn){handlers[name]=fn;}};
 vm.runInNewContext(code,{self,caches,URL,Request,fetch:async()=>{throw Error('Hors ligne');}});
 const lifecycle=async name=>{let promise;handlers[name]({waitUntil(value){promise=value;}});await promise;};
 const request=async(url,overrides={})=>{
  let response;handlers.fetch({request:{url,method:'GET',mode:'cors',...overrides},respondWith(value){response=value;}});
  return response?await (await response).text():null;
 };
 return {stores,fetched,lifecycle,request,handlers,get claimed(){return claimed;},get skipped(){return skipped;}};
}

test('le cache permet chaque ressource et la réouverture à la racine sans réseau, même avec un ancien paramètre v',async()=>{
 const w=worker();await w.lifecycle('install');
 assert.equal(w.claimed,false);await w.lifecycle('activate');assert.equal(w.claimed,true);
 for(const path of w.fetched)assert.equal(await w.request(path),'cached:'+path);
 for(const suffix of ['', '?v=0.6.3', 'index.html?v='+APP_VERSION]){
  assert.equal(await w.request(base+suffix,{mode:'navigate'}),'cached:'+base+'index.html');
 }
 assert.equal(await w.request(base+'src/app.js?v='+APP_VERSION),'cached:'+base+'src/app.js?v='+APP_VERSION);
});
test('une installation interrompue garde la version précédente et retire le cache incomplet',async()=>{
 const w=worker({failAt:'carnet-manuscrit.woff'});
 w.stores.set(prefix+'0.6.3',new Map([['old','complete']]));
 await assert.rejects(w.lifecycle('install'),/Réseau coupé/);
 assert.ok(w.stores.has(prefix+'0.6.3'));assert.ok(!w.stores.has(release));assert.equal(w.claimed,false);
});
test('la mise à jour retire seulement les anciens caches de ce carnet et ne force pas les onglets ouverts',async()=>{
 const w=worker();w.stores.set(prefix+'0.6.3',new Map());
 const other='carnet-shell:'+encodeURIComponent('/autre-carnet/')+':0.6.3';
 w.stores.set(other,new Map());w.stores.set('autre-application',new Map());
 await w.lifecycle('install');assert.ok(w.stores.has(prefix+'0.6.3'));
 await w.lifecycle('activate');assert.ok(!w.stores.has(prefix+'0.6.3'));
 assert.ok(w.stores.has(release));assert.ok(w.stores.has(other));assert.ok(w.stores.has('autre-application'));
 assert.equal(w.skipped,false);
 assert.doesNotMatch(code,/indexedDB|localStorage/);
});
test('les liens extérieurs, exports, écritures et ressources hors du carnet ne sont pas interceptés',async()=>{
 const w=worker();await w.lifecycle('install');
 assert.equal(await w.request('https://external.test/recette'),null);
 assert.equal(await w.request('https://example.test/autre/'),null);
 assert.equal(await w.request(base+'backup.json'),null);
 assert.equal(await w.request(base,{mode:'navigate',method:'POST'}),null);
 assert.equal(await w.request(base+'docs/VERIFICATION-0.6.3.md',{mode:'navigate'}),null);
});
test('le cache couvre tous les modules, leurs imports, le style et les illustrations du carnet',async()=>{
 const w=worker();await w.lifecycle('install');
 const paths=new Set(w.fetched.map(url=>url.slice(base.length)));
 for(const path of paths)await access(new URL(path.split('?')[0],root));
 const html=await readFile(new URL('index.html',root),'utf8');
 for(const [,relative]of html.matchAll(/(?:href|src)="\.\/([^"#]+)"/g))assert.ok(paths.has(relative),relative);
 const css=await readFile(new URL('styles.css',root),'utf8');
 for(const [,relative]of css.matchAll(/url\(['"]?\.\/([^'")]+)['"]?\)/g))assert.ok(paths.has(relative),relative);
 for(const filename of await readdir(new URL('src/',root))){
  if(!filename.endsWith('.js'))continue;
  assert.ok(paths.has('src/'+filename+'?v='+APP_VERSION),filename);
  const module=await readFile(new URL('src/'+filename,root),'utf8');
  for(const [,relative]of module.matchAll(/from\s*['"]\.\/([^'"]+)['"]/g))assert.ok(paths.has('src/'+relative),filename+': '+relative);
 }
 for(const filename of await readdir(new URL('assets/',root)))if(/\.(webp|woff)$/.test(filename))assert.ok(paths.has('assets/'+filename),filename);
 const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',root),'utf8'));
 assert.equal(manifest.start_url,'./#accueil');assert.equal(manifest.scope,'./');
});
test('l’interface distingue préparation, prêt, mise à jour, échec et navigateur sans prise en charge',async()=>{
 const states=[];await startOffline(s=>states.push(s),{navigator:{}});assert.deepEqual(states,['unavailable']);
 const registration={active:{},waiting:null,addEventListener(){}};
 let registered;
 const navigator={serviceWorker:{register:async(url,options)=>{registered={url,options};return registration;},ready:Promise.resolve(registration)}};
 states.length=0;await startOffline(s=>states.push(s),{navigator});assert.deepEqual(states,['preparing','ready']);
 assert.ok(registered.url.pathname.endsWith('/sw.js'));assert.equal(registered.options.updateViaCache,'none');
 registration.waiting={};states.length=0;await startOffline(s=>states.push(s),{navigator});assert.deepEqual(states,['preparing','update']);
 states.length=0;await startOffline(s=>states.push(s),{navigator:{serviceWorker:{register:async()=>{throw Error('Réseau');}}}});assert.deepEqual(states,['preparing','failed']);
 for(const state of ['preparing','ready','update','failed','unavailable'])assert.ok(offlineMessage(state));
});

test('les icônes d’installation PNG ont les dimensions annoncées et restent dans le chemin GitHub Pages',async()=>{
 const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',root),'utf8'));
 assert.equal(manifest.id,'./');
 assert.ok(manifest.icons.some(i=>i.sizes==='192x192'&&i.purpose.split(' ').includes('any')));
 assert.ok(manifest.icons.some(i=>i.sizes==='512x512'&&i.purpose.split(' ').includes('maskable')));
 for(const icon of manifest.icons){
  assert.equal(icon.type,'image/png');
  assert.ok(new URL(icon.src,base).href.startsWith(base+'assets/icons/'));
  const png=await readFile(new URL(icon.src,root));
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`,icon.sizes);
  assert.equal(png[25],2,'PNG opaque RGB, sans canal alpha');
 }
});

test('le raccourci Apple et l’icône d’onglet pointent sur de vraies images locales, toutes conservées hors ligne',async()=>{
 const html=await readFile(new URL('index.html',root),'utf8');
 const w=worker();await w.lifecycle('install');
 const manifest=JSON.parse(await readFile(new URL('manifest.webmanifest',root),'utf8'));
 const linked=[...html.matchAll(/<link\s+rel="(apple-touch-icon|icon)"[^>]*sizes="(\d+)x\d+"[^>]*href="([^"]+)"/g)];
 assert.ok(linked.some(m=>m[1]==='apple-touch-icon'&&m[2]==='180'));
 assert.ok(linked.some(m=>m[1]==='icon'&&m[2]==='32'));
 for(const [,kind,size,path]of linked){
  const png=await readFile(new URL(path,root));
  assert.equal(png.readUInt32BE(16),Number(size),kind);
  assert.equal(png.readUInt32BE(20),Number(size),kind);
 }
 for(const path of [...linked.map(m=>m[3]),...manifest.icons.map(i=>i.src)]){
  const url=new URL(path,base).href;
  assert.ok(w.fetched.includes(url),path+' absent du cache');
  assert.equal(await w.request(url),'cached:'+url);
 }
});

test('la mise à jour ne s’active immédiatement que sur demande explicite, après installation',async()=>{
 const w=worker();await w.lifecycle('install');assert.equal(w.skipped,false);
 let result;w.handlers.message({data:{type:'OTHER'},waitUntil(p){result=p;}});assert.equal(w.skipped,false);
 w.handlers.message({data:{type:'ACTIVATE_CARNET_UPDATE'},waitUntil(p){result=p;}});await result;assert.equal(w.skipped,true);
 let message;const navigator={serviceWorker:{getRegistration:async()=>({waiting:{postMessage:m=>{message=m;}}})}};
 assert.equal(await activateOfflineUpdate({navigator}),true);assert.deepEqual(message,{type:'ACTIVATE_CARNET_UPDATE'});
 assert.equal(await activateOfflineUpdate({navigator:{}}),false);
});
