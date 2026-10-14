// Template and controller checks with DOM doubles. This is NOT browser QA.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MemoryIndexedDB} from './memory-indexeddb.mjs';
function element(){return {innerHTML:'',textContent:'',hidden:false,value:'',checked:false,elements:{},dataset:{},listeners:{},classList:{toggle(){}},setAttribute(){},removeAttribute(){},focus(){},scrollIntoView(){},querySelectorAll(){return[];},addEventListener(name,fn){this.listeners[name]=fn;}};}
const main=element(),message=element(),nodes=new Map([['#app',main],['#message',message]]),listeners={};
globalThis.document={visibilityState:'visible',title:'',body:{append(){}},querySelector(selector){if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);},querySelectorAll(){return[];},addEventListener(name,fn){listeners['document:'+name]=fn;}};
globalThis.location={hash:'#accueil',pathname:'/template-tests/'};
globalThis.window={addEventListener(name,fn){listeners[name]=fn;}};
globalThis.confirm=()=>true;
const factory=new MemoryIndexedDB();globalThis.indexedDB=factory;
const originalInterval=globalThis.setInterval;globalThis.setInterval=()=>0;
await import('../src/app.js');globalThis.setInterval=originalInterval;
const go=async route=>{location.hash=route;await listeners.hashchange();};
const click=async(action,value='')=>{await main.listeners.click({target:{closest(){return {dataset:{action,value}};}}});};
const current=()=>structuredClone(factory.backends.get('mon-carnet-recettes:/template-tests/').records.get('current'));
test('les 15 écrans se construisent avec des composants sélectionnables et sans exception de contrôleur',async()=>{
 const routes=[['#accueil','LE CARNET DE PIERRE'],['#sommaire','SOMMAIRE'],['#recette/example-cabillaud','MES RECETTES'],['#marche','LE MARCHÉ'],['#produit/carotte','LE MARCHÉ'],['#jardin','MON JARDIN'],['#plante/example-basilic','MON JARDIN'],['#recettes','MES RECETTES'],['#nouvelle','ÉCRIRE MA RECETTE'],['#menus','MES MENUS'],['#courses','LISTE DE COURSES'],['#garde-manger','LE GARDE-MANGER'],['#preparation/example-confiture','LE GARDE-MANGER'],['#preferences','LE CARNET DE PIERRE']];
 for(const [route,label]of routes){await go(route);assert.match(main.innerHTML,new RegExp(`data-screen="${label}"`),route);assert.ok(!main.innerHTML.includes('La page ne peut pas s’ouvrir'),route);assert.ok(main.innerHTML.includes('floral-banner'),route);assert.ok(main.innerHTML.includes('aria-hidden="true"'),route);}
 await go('#recette/example-cabillaud');await click('cook','example-cabillaud');await go('#cuisine');assert.match(main.innerHTML,/data-screen="À VOS TABLIERS !"/);assert.match(main.innerHTML,/timer-output/);assert.equal(current().cooking.servings,3);
});
test('le contrôleur conserve favoris, marque-page et progression de cuisine',async()=>{await go('#recette/example-cabillaud');await click('favorite','example-cabillaud');assert.ok(current().favoriteIds.includes('example-cabillaud'));await click('bookmark','example-cabillaud');assert.equal(current().bookmarkedId,null);await click('bookmark','example-cabillaud');assert.equal(current().bookmarkedId,'example-cabillaud');await go('#cuisine');await click('next-step');assert.equal(current().cooking.stepIndex,1);assert.deepEqual(current().cooking.completed,[0]);});
test('les quantités de la fiche sont injectées comme texte, non comme image de maquette',async()=>{await go('#recette/example-cabillaud');assert.match(nodes.get('#recipe-ingredients').innerHTML,/750/);assert.match(nodes.get('#recipe-ingredients').innerHTML,/Poireaux/);assert.ok(main.innerHTML.includes('<input id="target-servings"'));assert.ok(main.innerHTML.includes('Nutrition à compléter.'));});
test('le contrôleur de création conserve les saisies d’un formulaire simulé',async()=>{
 await go('#nouvelle');const f=nodes.get('#recipe-form');
 const fields={title:'Ma recette enregistrée',servings:'2',category:'Assiettes et plats',status:'draft',origin:'Mon essai',notes:'Une annotation personnelle.',material:'Une casserole',prepMinutes:'15',cookMinutes:''};
 f.elements=Object.fromEntries(Object.entries(fields).map(([key,value])=>[key,{value}]));
 const ingredient={dataset:{ingredient:'new-leeks'},querySelectorAll(){return Object.entries({name:'Poireaux',quantity:'500',unit:'g',state:'cru, nettoyé',component:'Garniture'}).map(([key,value])=>({dataset:{key},value}));}};
 f.querySelectorAll=selector=>selector==='[data-ingredient]'?[ingredient]:selector==='[data-step-text]'?[{value:'Laver et émincer les poireaux.'}]:[];
 await f.listeners.submit({preventDefault(){}});const saved=current().recipes.find(r=>r.title===fields.title);assert.ok(saved);assert.equal(saved.ingredients[0].quantity,500);assert.equal(saved.material,'Une casserole');assert.equal(saved.cookMinutes,null);assert.equal(saved.notes,fields.notes);await go('#recette/'+saved.id);assert.ok(main.innerHTML.includes(fields.title));
});
