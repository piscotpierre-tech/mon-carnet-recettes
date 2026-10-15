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
 const routes=[['#accueil','LE CARNET DE PIERRE'],['#sommaire','SOMMAIRE'],['#recette/CDR-R001','MES RECETTES'],['#marche','LE MARCHÉ'],['#produit/carotte','LE MARCHÉ'],['#jardin','MON JARDIN'],['#plante/example-basilic','MON JARDIN'],['#recettes','MES RECETTES'],['#nouvelle','ÉCRIRE MA RECETTE'],['#menus','MES MENUS'],['#courses','LISTE DE COURSES'],['#garde-manger','LE GARDE-MANGER'],['#preparation/example-confiture','LE GARDE-MANGER'],['#preferences','LE CARNET DE PIERRE']];
 for(const [route,label]of routes){await go(route);assert.match(main.innerHTML,new RegExp(`data-screen="${label}"`),route);assert.ok(!main.innerHTML.includes('La page ne peut pas s’ouvrir'),route);assert.ok(main.innerHTML.includes('floral-banner'),route);assert.ok(main.innerHTML.includes('aria-hidden="true"'),route);}
 await go('#recette/CDR-R001');await click('servings-plus','CDR-R001');await click('cook','CDR-R001');await go('#cuisine');assert.match(main.innerHTML,/data-screen="À VOS TABLIERS !"/);assert.match(main.innerHTML,/timer-output/);assert.equal(current().cooking.servings,3);
});
test('le contrôleur conserve favoris, marque-page et progression de cuisine',async()=>{await go('#recette/CDR-R001');await click('favorite','CDR-R001');assert.ok(current().favoriteIds.includes('CDR-R001'));await click('bookmark','CDR-R001');assert.equal(current().bookmarkedId,null);await click('bookmark','CDR-R001');assert.equal(current().bookmarkedId,'CDR-R001');await go('#cuisine');await click('next-step');assert.equal(current().cooking.stepIndex,1);assert.deepEqual(current().cooking.completed,[0]);});
test('les quantités de la fiche sont injectées comme texte, non comme image de maquette',async()=>{await go('#recette/CDR-R001');assert.match(nodes.get('#recipe-ingredients').innerHTML,/750/);assert.match(nodes.get('#recipe-ingredients').innerHTML,/Poireaux/);assert.ok(main.innerHTML.includes('<input id="target-servings"'));});
test('le contrôleur de création conserve les saisies d’un formulaire simulé',async()=>{
 await go('#nouvelle');const f=nodes.get('#recipe-form');
 const fields={title:'Ma recette enregistrée',servings:'2',category:'Assiettes et plats',status:'draft',origin:'Mon essai',notes:'Une annotation personnelle.',material:'Une casserole',prepMinutes:'15',cookMinutes:''};
 f.elements=Object.fromEntries(Object.entries(fields).map(([key,value])=>[key,{value}]));
 const ingredient={dataset:{ingredient:'new-leeks'},querySelectorAll(){return Object.entries({name:'Poireaux',quantity:'500',unit:'g',state:'cru, nettoyé',component:'Garniture'}).map(([key,value])=>({dataset:{key},value}));}};
 f.querySelectorAll=selector=>selector==='[data-ingredient]'?[ingredient]:selector==='[data-step-text]'?[{value:'Laver et émincer les poireaux.'}]:[];
 await f.listeners.submit({preventDefault(){}});const saved=current().recipes.find(r=>r.title===fields.title);assert.ok(saved);assert.equal(saved.ingredients[0].quantity,500);assert.equal(saved.material,'Une casserole');assert.equal(saved.cookMinutes,null);assert.equal(saved.notes,fields.notes);await go('#recette/'+saved.id);assert.ok(main.innerHTML.includes(fields.title));
});

test('les 50 recettes intégrées ouvrent une fiche et un mode cuisine sans erreur de contrôleur',async()=>{
 const recipes=current().recipes.filter(r=>r.editorial);assert.equal(recipes.length,50);
 for(const r of recipes){await go('#recette/'+r.id);assert.ok(main.innerHTML.includes(r.title.replaceAll('&','&amp;').replaceAll('\"','&quot;')),r.id);assert.match(main.innerHTML,/La petite touche du chef/);assert.ok(nodes.get('#recipe-method').innerHTML.includes('<ol class="steps">'));await click('cook',r.id);await go('#cuisine');assert.match(main.innerHTML,/data-screen="À VOS TABLIERS !"/,r.id);assert.match(main.innerHTML,/Ingrédients de la recette/);}
});
test('la liste affiche les 50 titres et les catégories filtrent les 5 entrées et 5 desserts',async()=>{
 await go('#recettes');assert.equal((nodes.get('#recipe-list').innerHTML.match(/class="number"/g)||[]).length,51);
 await click('category','Entrées');assert.equal((nodes.get('#recipe-list').innerHTML.match(/class="number"/g)||[]).length,5);
 await click('category','Desserts');assert.equal((nodes.get('#recipe-list').innerHTML.match(/class="number"/g)||[]).length,5);
});

test('les deux fiches de conserve et les deux guides du jardin se lisent dans les contrôleurs',async()=>{
 for(const route of ['#culture/basilic','#culture/fraisier']){await go(route);assert.match(main.innerHTML,/Les gestes du jardinier/);assert.match(main.innerHTML,/Noter mon plant/);assert.ok(!main.innerHTML.includes('La page ne peut pas s’ouvrir'));}
 for(const p of current().preparations.filter(p=>p.referenceId)){await go('#preparation/'+p.id);assert.match(main.innerHTML,/La méthode/);assert.match(main.innerHTML,/Noter une fournée/);assert.ok(!main.innerHTML.includes('La page ne peut pas s’ouvrir'));}
});
test('le contrôleur note un lot, ouvre un seul pot, prélève puis annule sans changer l’ouverture',async()=>{
 const p=current().preparations.find(p=>p.referenceId==='GM01');await go('#preparation/'+p.id);const f=nodes.get('#lot-form');
 const fields={label:'Fraises — contrôle',date:'2026-10-15',jarCount:'2',netWeightG:'200',container:'Pot à noter',closure:'Fermeture à noter',equipment:'Marmite à noter',altitudeM:'',treatmentMinutes:'',ingredientsNotes:'Mes fraises',treatmentNotes:'Ma note',location:'Cellier',notes:'Une fournée'};
 f.elements=Object.fromEntries(Object.entries(fields).map(([name,value])=>[name,{value}]));await f.onsubmit({preventDefault(){},target:f});assert.ok(current().pantryLots,message.textContent);const lot=current().pantryLots.at(-1),[jar,other]=current().reserves.filter(r=>r.pantryLotId===lot.id);assert.ok(lot);assert.equal(lot.treatmentMinutes,null);
 await go('#reserve/'+jar.id);const opening=nodes.get('#jar-open-form');opening.elements={date:{value:'2026-10-15'}};await opening.onsubmit({preventDefault(){},target:opening});assert.equal(current().reserves.find(r=>r.id===jar.id).openedOn,'2026-10-15');assert.equal(current().reserves.find(r=>r.id===other.id).openedOn,null);
 const use=nodes.get('#reserve-use-form');use.elements={quantity:{value:'30'},recipeId:{value:'CDR-R050'},date:{value:'2026-10-15'},notes:{value:'Pour les crêpes'}};await use.onsubmit({preventDefault(){},target:use});assert.equal(current().reserves.find(r=>r.id===jar.id).quantity,170);const movement=current().reserveUses.at(-1);await click('undo-reserve-use',movement.id);assert.equal(current().reserves.find(r=>r.id===jar.id).quantity,200);assert.equal(current().reserves.find(r=>r.id===jar.id).openedOn,'2026-10-15');
});

test('le contrôleur garde une récolte non pesée et une observation, puis retrouve la réserve sans inventer de poids',async()=>{
 await go('#plante/example-fraisier');const observation=nodes.get('#observation-form');observation.elements={soil:{value:'Humide'},text:{value:'Trois fruits commencent à rougir.'},date:{value:'2026-10-15'}};await observation.onsubmit({preventDefault(){},target:observation});assert.ok(current().observations.some(o=>o.text==='Terre humide. Trois fruits commencent à rougir.'));
 const harvest=nodes.get('#harvest-form');harvest.elements={quantity:{value:''},unit:{value:'g'},date:{value:'2026-10-15'}};await harvest.onsubmit({preventDefault(){},target:harvest});const row=current().harvests.at(-1);assert.equal(row.quantity,null);await click('harvest-reserve',row.id);const r=current().reserves.find(r=>r.harvestId===row.id);assert.ok(r);assert.equal(r.quantity,null);await go('#reserve/'+r.id);assert.match(main.innerHTML,/Quantité non renseignée/);assert.ok(!main.innerHTML.includes('La page ne peut pas s’ouvrir'));
});
