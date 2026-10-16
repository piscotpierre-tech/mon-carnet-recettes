import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ADDITIONAL_CATALOGUES,ADDITIONAL_RECIPES,installCatalogue,installAdditionalCatalogues,methodText,ingredientPreparation,catalogueCount} from '../src/catalogue.js';
import {emptyNotebook,validateNotebook,withRecipe,blankRecipe,scaledQuantity,mergeNotebooks,searchRecipes} from '../src/domain.js';
import {installGardenPantry,installMetricPantry,linkedRecipes} from '../src/garden-pantry.js';
import {setMenu,rebuildShopping,beginCooking} from '../src/workflows.js';
import {NotebookStore} from '../src/storage.js';
import {MemoryIndexedDB} from './memory-indexeddb.mjs';
import {makeBackup,readBackup} from '../src/backup.js';
const previous=()=>installMetricPantry(installGardenPantry(installCatalogue(emptyNotebook()).notebook).notebook).notebook;
const complete=()=>installAdditionalCatalogues(previous()).notebook;
const recipe=id=>ADDITIONAL_RECIPES.find(r=>r.id===id);

test('les deux recueils ajoutent 50 entrées et 50 desserts complets aux 50 premières fiches',()=>{
 const book=complete();validateNotebook(book);assert.equal(book.recipes.length,150);assert.equal(catalogueCount(book),150);
 assert.deepEqual(Object.fromEntries(['Assiettes et plats','Entrées','Desserts'].map(c=>[c,book.recipes.filter(r=>r.category===c).length])),{'Assiettes et plats':40,'Entrées':55,'Desserts':55});
 assert.equal(ADDITIONAL_RECIPES.reduce((n,r)=>n+r.ingredients.length,0),712);assert.equal(ADDITIONAL_RECIPES.reduce((n,r)=>n+r.steps.length,0),401);assert.equal(new Set(book.recipes.map(r=>r.number)).size,150);
 for(const collection of ADDITIONAL_CATALOGUES){assert.equal(collection.count,50);assert.match(collection.sourcePdfSha256,/^[a-f0-9]{64}$/);}
 for(const r of ADDITIONAL_RECIPES){assert.equal(r.servings,4);assert.equal(r.status,'ready');assert.ok(r.ingredients.length>=3&&r.steps.length>=4);assert.ok(r.editorial.chefTip);assert.equal(r.editorial.sourcePage,r.editorial.sourceNumber+5);assert.equal(r.editorial.testedInKitchen,false);assert.ok(Object.values(r.nutrition.perServing).every(v=>v===null));}
});
test('les mesures françaises et les précisions de pesée des deux PDF sont conservées',()=>{
 for(const r of ADDITIONAL_RECIPES)for(const i of r.ingredients){assert.ok(['g','kg','ml','cl','l'].includes(i.unit));assert.ok(i.quantity>0);assert.ok(i.preparation);assert.equal(i.purchase,i.name!=='Eau');}
 const r=recipe('CDR-E001');assert.equal(r.ingredients[0].quantity,400);assert.match(r.ingredients[0].preparation,/rincés et égouttés/);assert.equal(r.ingredients.find(i=>i.name==='Vinaigre de vin').unit,'cl');assert.equal(recipe('CDR-E015').ingredients.find(i=>i.name==='Sel').quantity,1.5);
 const eggs=recipe('CDR-D002').ingredients.find(i=>i.name==='Œufs');assert.equal(eggs.quantity,50);assert.equal(eggs.unit,'g');assert.match(eggs.preparation,/sans coquille/);
 assert.ok(recipe('CDR-D049').ingredients.some(i=>i.name==='Flocons d’avoine'));assert.ok(recipe('CDR-E009').ingredients.some(i=>i.name==='Pomme'));
});
test('le lait réparti entre ganache et chantilly et les œufs suivent les convives',()=>{
 const r=recipe('CDR-D019'),cream=r.ingredients.find(i=>i.name==='Crème liquide entière');assert.equal(scaledQuantity(cream,4,2),15);assert.equal(cream.unit,'cl');assert.match(ingredientPreparation(r,cream,2),/dont 100 ml/);assert.match(methodText(r,0,2),/50 ml/);assert.match(methodText(r,1,2),/100 ml/);assert.match(methodText(r,2,2),/2 coupes/);assert.match(methodText(r,2,2),/3 h/);
 const eggs=recipe('CDR-D002').ingredients.find(i=>i.name==='Œufs');assert.match(ingredientPreparation(recipe('CDR-D002'),eggs,8),/environ 2 œufs/);assert.match(ingredientPreparation(recipe('CDR-D002'),eggs,2),/environ 0,5 œuf/);
});
test('les garnitures par portion gardent 30 g et 25 g quand on double la tablée',()=>{
 const rice=recipe('CDR-D008');assert.equal(scaledQuantity(rice.ingredients.find(i=>i.name==='Confiture de fraises'),4,8),240);assert.match(methodText(rice,2,8),/8 coupelles/);assert.match(methodText(rice,3,8),/30 g de confiture sur chaque portion/);
 assert.match(methodText(recipe('CDR-D021'),3,8),/25 g de marmelade sur chaque crème/);
});
test('les nombres de biscuits suivent les convives, les épaisseurs et températures restent fixes',()=>{
 const r=recipe('CDR-D006');assert.match(methodText(r,1,2),/170 °C/);assert.match(methodText(r,1,2),/3 mm/);assert.match(methodText(r,1,2),/8 biscuits/);assert.match(methodText(r,1,2),/4 d’entre eux/);assert.match(methodText(r,3,2),/4 fonds/);assert.match(methodText(r,3,2),/deux lunettes par personne/);assert.match(methodText(r,2,2),/12 à 15 min/);
 assert.match(methodText(recipe('CDR-D038'),2,2),/6 empreintes/);assert.match(methodText(recipe('CDR-D038'),2,2),/trois quarts/);assert.match(methodText(recipe('CDR-D045'),1,2),/2 nids/);
});
test('le sel rincé et le sel restant se répartissent sans garder une mesure fixe trompeuse',()=>{
 const r=recipe('CDR-E033'),salt=r.ingredients.find(i=>i.name==='Sel');assert.equal(scaledQuantity(salt,4,8),6);assert.match(ingredientPreparation(r,salt,8),/dont 4 g/);assert.match(methodText(r,0,8),/ajouter 4 g de sel/);assert.match(methodText(r,2,8),/2 g de sel restant/);
});
test('les recettes et précisions personnelles ne sont pas réécrites pendant l’affichage',()=>{
 const r=structuredClone(recipe('CDR-D019'));r.steps[0]='Mon essai avec 125 ml de crème.';assert.equal(methodText(r,0,8),r.steps[0]);const cream=r.ingredients.find(i=>i.name==='Crème liquide entière');cream.preparation='Mon repère : 120 ml froids';assert.equal(ingredientPreparation(r,cream,8),cream.preparation);
});
test('ajout unique, reprise partielle et doublons par référence préservent les corrections',()=>{
 const all=complete();all.recipes.find(r=>r.editorial?.sourceId==='CDR-E001').notes='Ma vinaigrette';assert.equal(installAdditionalCatalogues(all).notebook,all);assert.equal(installAdditionalCatalogues(all).changed,false);
 const partial=previous();partial.recipes.push(structuredClone(recipe('CDR-E001')));partial.recipes.at(-1).notes='Ma variante déjà importée';const result=installAdditionalCatalogues(partial);assert.equal(result.added,99);assert.equal(result.notebook.recipes.filter(r=>r.editorial?.sourceId==='CDR-E001').length,1);assert.equal(result.notebook.recipes.find(r=>r.editorial?.sourceId==='CDR-E001').notes,'Ma variante déjà importée');
 const onlyEntries=structuredClone(all);onlyEntries.catalogueIds=onlyEntries.catalogueIds.filter(id=>id!==ADDITIONAL_CATALOGUES[1].id);onlyEntries.recipes=onlyEntries.recipes.filter(r=>r.category!=='Desserts'||!r.editorial?.collectionId);assert.equal(installAdditionalCatalogues(onlyEntries).added,50);
});
test('les collisions n’écrasent ni une fiche personnelle ni les photos, menus et séances en cours',()=>{
 let b=previous();b=withRecipe(b,{...blankRecipe(),id:'CDR-E001',title:'Haricots blancs, thon et oignon rouge',notes:'Ma version personnelle'},{id:'my-photo',name:'photo.png',blob:new Blob(['photo'],{type:'image/png'})});b.favoriteIds=['CDR-E001'];b.bookmarkedId='CDR-E001';b=setMenu(b,{date:'2026-10-16',slot:'Midi',recipeId:'CDR-R001',servings:3});b=beginCooking(b,b.recipes[0],3);const before=structuredClone(b),next=installAdditionalCatalogues(b).notebook;
 for(const key of ['photos','menus','cooking','favoriteIds','bookmarkedId','preparations','plants','reserves'])assert.deepEqual(next[key],before[key]);for(const old of before.recipes)assert.deepEqual(next.recipes.find(r=>r.id===old.id),old);assert.equal(next.recipes.length,151);assert.equal(new Set(next.recipes.map(r=>r.number)).size,151);assert.equal(next.recipes.filter(r=>r.editorial?.sourceId==='CDR-E001').length,1);assert.equal(next.recipes.find(r=>r.id==='CDR-E001').notes,'Ma version personnelle');assert.deepEqual(b,before);
});
test('réouverture, export, restauration et fusion conservent les 150 recettes et les marqueurs',async()=>{
 const factory=new MemoryIndexedDB(),store=new NotebookStore({factory,scope:'/additional/'}),b=complete();b.recipes.find(r=>r.id==='CDR-D001').notes='Mon chocolat';const saved=await store.commit(b,0);store.close();const reopened=await new NotebookStore({factory,scope:'/additional/'}).read();assert.deepEqual(reopened,saved);const restored=(await readBackup(await makeBackup(reopened))).notebook;assert.deepEqual(restored,reopened);assert.equal(installAdditionalCatalogues(restored).changed,false);assert.deepEqual(mergeNotebooks(emptyNotebook(),restored).recipes,restored.recipes);
});
test('limite de fiches et échec de quota ne laissent aucun ajout partiel enregistré',async()=>{
 const b=previous();for(let i=50;i<951;i++)b.recipes.push({...blankRecipe(),id:'personal-'+i,number:i+1,title:'Ma fiche '+i});validateNotebook(b);const before=structuredClone(b);assert.throws(()=>installAdditionalCatalogues(b),/limite/);assert.deepEqual(b,before);
 const factory=new MemoryIndexedDB(),store=new NotebookStore({factory,scope:'/additional-failure/'}),saved=await store.commit(previous(),0);factory.failNextWrite=true;await assert.rejects(()=>store.commit(installAdditionalCatalogues(saved).notebook,saved.revision));assert.deepEqual(await store.read(),saved);
});
test('recherche, garde-manger, jardin, menus et courses trouvent les nouvelles fiches sans consommer le stock',()=>{
 const b=complete();assert.ok(searchRecipes(b,'millefeuilles').some(r=>r.id==='CDR-D030'));assert.ok(searchRecipes(b,'cœurs de palmier').some(r=>r.id==='CDR-E015'));assert.ok(linkedRecipes(b,'confiture').some(r=>r.id==='CDR-D008'));assert.ok(linkedRecipes(b,'poire').some(r=>r.id==='CDR-D001'));assert.ok(linkedRecipes(b,'basilic').some(r=>r.id==='CDR-E032'));
 const menu=setMenu(b,{date:'2026-10-16',slot:'Soir',recipeId:'CDR-D019',servings:8}),shopping=rebuildShopping(menu,'2026-10-12');assert.equal(shopping.shopping.generated.find(i=>i.name==='Crème liquide entière').quantity,600);assert.equal(shopping.shopping.generated.find(i=>i.name==='Crème liquide entière').unit,'ml');assert.deepEqual(shopping.reserves,b.reserves);
});
