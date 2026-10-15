import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyNotebook,validateNotebook,withRecipe,blankRecipe,mergeNotebooks} from '../src/domain.js';
import {exampleNotebook} from '../src/examples.js';
import {installCatalogue} from '../src/catalogue.js';
import {installGardenPantry,addPantryLot,openPantryJar,useReserve,undoReserveUse,linkedRecipes,reserveStatus} from '../src/garden-pantry.js';
import {PANTRY_PREPARATIONS} from '../src/garden-pantry-data.js';
import {harvestToReserve,setMenu,rebuildShopping} from '../src/workflows.js';
import {makeBackup,readBackup} from '../src/backup.js';
import {NotebookStore} from '../src/storage.js';
import {MemoryIndexedDB} from './memory-indexeddb.mjs';
const notebook=()=>installGardenPantry(installCatalogue(emptyNotebook()).notebook).notebook;
const input=(book,extra={})=>({preparationId:book.preparations.find(p=>p.referenceId==='GM01').id,label:'Fraises du jardin',date:'2026-10-15',jarCount:2,netWeightG:null,container:'',closure:'',equipment:'',altitudeFt:null,treatmentMinutes:null,ingredientsNotes:'Fraises mesurées dans une cup US',treatmentNotes:'',location:'Étagère du cellier',notes:'Ma fournée',...extra});
const lot=(extra={})=>{const b=notebook();return addPantryLot(b,input(b,extra));};

test('installer les deux fiches ne crée ni récolte, ni lot, ni réserve fictifs',()=>{
 const b=notebook();assert.equal(b.preparations.filter(p=>p.referenceId).length,2);assert.equal(b.harvests.length,0);assert.equal(b.reserves.length,0);assert.equal(b.pantryLots,undefined);assert.equal(installGardenPantry(b).changed,false);assert.equal(b.recipes.length,50);
});
test('l’ancien brouillon retouché est conservé avec ses quantités et notes',()=>{
 const b=exampleNotebook();b.preparations[0].notes='Ma recette de famille';const old=structuredClone(b.preparations[0]);
 const next=installGardenPantry(b).notebook;assert.deepEqual(next.preparations.find(p=>p.id===old.id),old);assert.equal(next.preparations.filter(p=>p.referenceId).length,2);assert.deepEqual(next.plants,b.plants);
});
test('les ingrédients de confiture gardent leurs cups US et le tableau ne remplace pas les pots par des ml',()=>{
 const p=PANTRY_PREPARATIONS[0];assert.equal(p.ingredients.length,2);assert.deepEqual(p.ingredients.map(i=>[i.quantity,i.unit]),[[4,'cups US'],[4,'cups US']]);assert.deepEqual(p.table.map(r=>r[1]),['5 min','10 min','15 min']);
 const b=lot();assert.equal(b.pantryLots[0].altitudeFt,null);assert.equal(b.pantryLots[0].treatmentMinutes,null);assert.equal(b.reserves[0].unit,'pot');assert.equal(b.reserves[0].quantity,1);
});
test('chaque pot a sa date : ouvrir le premier ne change pas le second',()=>{
 let b=lot(),[a,c]=b.reserves;b=openPantryJar(b,a.id,'2026-10-16');assert.equal(b.reserves[0].openedOn,'2026-10-16');assert.equal(b.reserves[1].openedOn,null);assert.equal(reserveStatus(b.reserves[0]),'Ouvert');assert.equal(reserveStatus(b.reserves[1]),'Fermé');assert.equal(b.reserves[0].quantity,1);
 assert.throws(()=>openPantryJar(b,a.id,'2026-10-14'),/précède/);
});
test('prélèvement pesé et annulation gardent ouverture, source et version de recette',()=>{
 let b=lot({netWeightG:250});const jar=b.reserves[0],recipe=b.recipes[49],snapshot=structuredClone(b.pantryLots[0].procedure);
 b=openPantryJar(b,jar.id,'2026-10-15');b=useReserve(b,{reserveId:jar.id,recipeId:recipe.id,quantity:30,date:'2026-10-16',notes:'Sur les crêpes'});
 assert.equal(b.reserves[0].quantity,220);assert.equal(b.reserveUses[0].recipeVersion,recipe.version);b.recipes[49].title='Ma variante';b.preparations[0].notes='Un nouvel essai';assert.deepEqual(b.pantryLots[0].procedure,snapshot);
 b=undoReserveUse(b,b.reserveUses[0].id);assert.equal(b.reserves[0].quantity,250);assert.equal(b.reserves[0].openedOn,'2026-10-15');assert.equal(b.reserveUses[0].undone,true);assert.equal(b.reserveUses[0].recipeTitle,recipe.title);
 assert.throws(()=>undoReserveUse(b,b.reserveUses[0].id),/déjà/);
});
test('stock insuffisant, pot fermé et prélèvement antérieur à ouverture : pas de consommation',()=>{
 let b=lot({netWeightG:100}),r=b.reserves[0];assert.throws(()=>useReserve(b,{reserveId:r.id,quantity:10}),/ouverture/);b=openPantryJar(b,r.id,'2026-10-16');const before=structuredClone(b);
 assert.throws(()=>useReserve(b,{reserveId:r.id,quantity:101,date:'2026-10-16'}),/dépasse/);assert.throws(()=>useReserve(b,{reserveId:r.id,quantity:10,date:'2026-10-15'}),/précède/);assert.deepEqual(b,before);
});
test('un pot non pesé se termine en pots entiers sans inventer de grammes',()=>{
 let b=lot();const r=b.reserves[0];b=openPantryJar(b,r.id,'2026-10-15');assert.throws(()=>useReserve(b,{reserveId:r.id,quantity:.5}),/entiers/);b=useReserve(b,{reserveId:r.id,quantity:1});assert.equal(b.reserves[0].quantity,0);assert.equal(reserveStatus(b.reserves[0]),'Terminé');assert.equal(b.reserves[1].quantity,1);
});
test('récolte inconnue, récolte comptée et transfert unique ne créent aucune conversion',()=>{
 const b=notebook();b.harvests.push({id:'h1',plantId:b.plants[1].id,quantity:null,unit:'g',date:'2026-10-15'});let next=harvestToReserve(b,'h1');assert.equal(next.reserves[0].quantity,null);assert.throws(()=>useReserve(next,{reserveId:next.reserves[0].id,quantity:10}),/quantité disponible/);assert.throws(()=>harvestToReserve(next,'h1'),/déjà/);
 next.harvests.push({id:'h2',plantId:next.plants[1].id,quantity:3,unit:'pièce',date:'2026-10-15'});next=harvestToReserve(next,'h2');assert.equal(next.reserves[1].quantity,3);assert.equal(next.reserves[1].unit,'pièce');
});
test('une réserve réellement pesée se prélève une seule fois et ne change pas les fruits sur le plant',()=>{
 const b=notebook();b.harvests.push({id:'h3',plantId:b.plants[1].id,quantity:60,unit:'g',date:'2026-10-15'});let next=harvestToReserve(b,'h3');const r=next.reserves[0];next=useReserve(next,{reserveId:r.id,quantity:20});assert.equal(next.reserves[0].quantity,40);assert.equal(next.harvests[0].quantity,60);assert.throws(()=>useReserve(next,{reserveId:r.id,quantity:41}),/dépasse/);
});
test('menus et courses ne consomment aucune réserve automatiquement',()=>{
 const b=notebook();b.harvests.push({id:'h4',plantId:b.plants[1].id,quantity:60,unit:'g',date:'2026-10-15'});const source=harvestToReserve(b,'h4'),r=source.reserves[0];const scheduled=setMenu(source,{date:'2026-10-15',slot:'Midi',recipeId:'CDR-R047',servings:2}),shopping=rebuildShopping(scheduled,'2026-10-12');assert.equal(shopping.reserves[0].quantity,r.quantity);assert.equal(shopping.reserveUses,undefined);
});
test('liens aux recettes : fraises et basilic rejoignent des recettes qui les emploient',()=>{
 const b=notebook();assert.ok(linkedRecipes(b,'fraise').some(r=>r.id==='CDR-R047'));assert.ok(linkedRecipes(b,'basilic').some(r=>r.id==='CDR-R003'));assert.equal(linkedRecipes(b,'confiture').length,0);
});
test('export, réouverture et restauration conservent pots, ouvertures, prélèvements, sources et valeurs inconnues',async()=>{
 let b=lot({netWeightG:200});b=openPantryJar(b,b.reserves[0].id,'2026-10-15');b=useReserve(b,{reserveId:b.reserves[0].id,recipeId:'CDR-R050',quantity:20});const factory=new MemoryIndexedDB(),store=new NotebookStore({factory,scope:'/pantry/'});const saved=await store.commit(b,0);store.close();const reopened=await new NotebookStore({factory,scope:'/pantry/'}).read();assert.deepEqual(reopened,saved);const restored=(await readBackup(await makeBackup(reopened))).notebook;assert.deepEqual(restored,reopened);assert.deepEqual(mergeNotebooks(emptyNotebook(),restored).pantryLots,restored.pantryLots);
});
test('les données de lot corrompues et les doublons de pots sont refusés',()=>{
 const b=lot(),copy=structuredClone(b);copy.reserves[1].jarNumber=1;assert.throws(()=>validateNotebook(copy),/dupliqué/);copy.reserves[1].jarNumber=2;copy.reserves.pop();assert.throws(()=>validateNotebook(copy),/manque/);const bad=structuredClone(b);bad.reserveUses=[{id:'use',reserveId:'absent',recipeId:null,recipeVersion:null,recipeTitle:'',quantity:2,unit:'g',date:'2026-10-15',notes:'',undone:false}];assert.throws(()=>validateNotebook(bad),/introuvable/);
});
test('l’ajout d’un lot interrompu par quota ne laisse ni pots ni lot partiels',async()=>{
 const factory=new MemoryIndexedDB(),store=new NotebookStore({factory,scope:'/quota-lots/'}),initial=await store.commit(notebook(),0);factory.failNextWrite=true;await assert.rejects(()=>store.commit(addPantryLot(initial,input(initial)),initial.revision));assert.deepEqual(await store.read(),initial);
});
