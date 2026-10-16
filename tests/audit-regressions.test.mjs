// Controller and storage doubles, not browser or phone verification.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MemoryIndexedDB} from './memory-indexeddb.mjs';
import {NotebookStore} from '../src/storage.js';
import {emptyNotebook} from '../src/domain.js';
import {installCatalogue,installAdditionalCatalogues} from '../src/catalogue.js';
import {setMenu,rebuildShopping,monday} from '../src/workflows.js';
import {makeBackup,readBackup} from '../src/backup.js';

function element(){return {innerHTML:'',textContent:'',hidden:false,value:'',elements:{},dataset:{},listeners:{},classList:{toggle(){}},setAttribute(){},focus(){},scrollIntoView(){},querySelectorAll(){return[];},addEventListener(name,fn){this.listeners[name]=fn;}};}
const main=element(),nodes=new Map([['#app',main],['#message',element()]]),listeners={};
globalThis.document={visibilityState:'visible',body:{append(){}},querySelector(selector){if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);},querySelectorAll(){return[];},addEventListener(name,fn){listeners['document:'+name]=fn;}};
globalThis.location={hash:'#menus',pathname:'/audit-regressions/'};
globalThis.window={addEventListener(name,fn){listeners[name]=fn;}};
globalThis.confirm=()=>true;
const factory=new MemoryIndexedDB();globalThis.indexedDB=factory;
let initial=installAdditionalCatalogues(installCatalogue(emptyNotebook()).notebook).notebook;
const recipe=structuredClone(initial.recipes.find(r=>r.id==='CDR-R001'));
initial=setMenu(initial,{date:monday(),slot:'Midi',recipeId:recipe.id,servings:6});
initial=rebuildShopping(initial,monday());
const meal=structuredClone(initial.menus[0]);
const currentRecipe=initial.recipes.find(r=>r.id===recipe.id);
currentRecipe.title='Mon cabillaud modifié';currentRecipe.version=2;
currentRecipe.ingredients[0].quantity=100;
initial.recipes.find(r=>r.id==='CDR-R002').editorial.testedInKitchen=true;
await new NotebookStore().commit(initial,0);
const originalInterval=globalThis.setInterval;globalThis.setInterval=()=>0;
await import('../src/app.js');globalThis.setInterval=originalInterval;
const go=async route=>{location.hash=route;await listeners.hashchange();};
const click=async(action,value='')=>main.listeners.click({target:{closest(){return {dataset:{action,value}};}}});
const current=()=>structuredClone(factory.backends.get('mon-carnet-recettes:/audit-regressions/').records.get('current'));

test('AUD-01 : le menu ouvre son repas pour six en version 1 dans une session neuve',async()=>{
 await go('#menus');assert.ok(main.innerHTML.includes(`href="#repas/${meal.id}"`));
 await go('#repas/'+meal.id);
 assert.ok(main.innerHTML.includes(recipe.title));assert.ok(!main.innerHTML.includes(currentRecipe.title));
 assert.match(main.innerHTML,/6 convives · version 1/);
 assert.ok(!main.innerHTML.includes('id="target-servings"'));
 assert.match(nodes.get('#recipe-ingredients').innerHTML,/900/);
 await click('cook-meal',meal.id);await go('#cuisine');
 assert.equal(current().cooking.servings,6);assert.deepEqual(current().cooking.snapshot,meal.snapshot);
 assert.equal(current().cooking.menuId,meal.id);
 assert.match(main.innerHTML,/6 convives · version 1/);
 assert.ok(main.innerHTML.includes(`href="#repas/${meal.id}"`));
 assert.equal(current().shopping.generated.find(i=>i.name==='Cabillaud').quantity,900);
 assert.deepEqual(current().menus[0],meal);
});
test('la sauvegarde garde les convives, la recette et le lien au repas en cuisine',async()=>{
 const before=current(),restored=(await readBackup(await makeBackup(before))).notebook;
 assert.deepEqual(restored.cooking,before.cooking);
 assert.deepEqual(restored.menus,before.menus);
 assert.deepEqual(restored.shopping,before.shopping);
});
test('AUD-01 : consulter la fiche actuelle pour quatre ne change ni le repas ni sa cuisine',async()=>{
 await go('#recette/'+recipe.id);
 nodes.get('#target-servings').oninput({target:{value:'4',validity:{valid:true}}});
 await go('#repas/'+meal.id);assert.match(main.innerHTML,/6 convives · version 1/);
 await click('cook-meal',meal.id);assert.equal(current().cooking.servings,6);
 assert.deepEqual(current().cooking.snapshot,meal.snapshot);
 await go('#recette/'+recipe.id);assert.match(main.innerHTML,/value="4"/);
 assert.ok(main.innerHTML.includes(currentRecipe.title));
});
test('AUD-01 : un repas retiré ne redirige pas silencieusement vers une autre recette',async()=>{
 await go('#repas/introuvable');assert.match(main.innerHTML,/Ce repas n’est plus au menu/);
 assert.deepEqual(current().menus[0],meal);
});
test('AUD-01 : modifier seulement les convives préserve la version, la reprise actuelle est explicite',async()=>{
 await go('#menus');await click('menu-choose',monday()+'|Midi');
 assert.match(nodes.get('#menu-editor').innerHTML,/name="refreshRecipe" type="checkbox"/);
 const form=nodes.get('#menu-form');
 const fields={date:monday(),slot:'Midi',recipe:recipe.id,servings:'8'};
 form.elements=Object.fromEntries(Object.entries(fields).map(([key,value])=>[key,{value}]));
 form.elements.refreshRecipe={checked:false};
 await form.onsubmit({preventDefault(){},target:form});
 assert.equal(current().menus[0].id,meal.id);assert.equal(current().menus[0].servings,8);
 assert.deepEqual(current().menus[0].snapshot,meal.snapshot);
 await click('menu-choose',monday()+'|Midi');form.elements.refreshRecipe.checked=true;
 await form.onsubmit({preventDefault(){},target:form});
 assert.equal(current().menus[0].snapshot.version,2);
 assert.equal(current().menus[0].snapshot.title,currentRecipe.title);
});
test('AUD-03 : l’essai en cuisine et la provenance sont visibles, sans calcul alimentaire',async()=>{
 await go('#recette/CDR-R001');assert.match(main.innerHTML,/À essayer en cuisine/);
 assert.match(main.innerHTML,/Origine de la fiche/);assert.ok(main.innerHTML.includes(recipe.origin));
 await go('#recette/CDR-R002');assert.match(main.innerHTML,/Essayée en cuisine/);
 assert.ok(!main.innerHTML.includes('class="hand recipe-trial">À essayer'));
 await go('#recette/CDR-E001');assert.match(main.innerHTML,/Fiche 1 · page 6/);
 assert.ok(!main.innerHTML.includes('kcal'));assert.ok(!main.innerHTML.includes('Santé publique'));
});
test('le brief de reprise garde couverture → ouvrir le carnet → sommaire et son menu direct',async()=>{
 await go('#accueil');assert.match(main.innerHTML,/Ouvrir le carnet/);
 assert.match(main.innerHTML,/href="#sommaire"/);
 await go('#sommaire');assert.match(main.innerHTML,/Menu de la semaine/);
 assert.match(main.innerHTML,/href="#menus"/);
});
