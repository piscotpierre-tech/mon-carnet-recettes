import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CATALOGUE_INFO,CATALOGUE_RECIPES,installCatalogue,methodText} from '../src/catalogue.js';
import {emptyNotebook,validateNotebook,withRecipe,blankRecipe,searchRecipes,scaledQuantity,exclusions,mergeNotebooks} from '../src/domain.js';
import {exampleNotebook} from '../src/examples.js';
import {NotebookStore} from '../src/storage.js';
import {makeBackup,readBackup} from '../src/backup.js';
import {MemoryIndexedDB} from './memory-indexeddb.mjs';
import {setMenu,rebuildShopping,beginCooking} from '../src/workflows.js';
const source=()=>installCatalogue(emptyNotebook()).notebook;

test('les 50 fiches fournies forment 40 assiettes, 5 entrées et 5 desserts complets, sans nutrition inventée',()=>{
 const book=source();validateNotebook(book);assert.equal(book.recipes.length,50);assert.equal(book.bookmarkedId,'CDR-R001');
 assert.deepEqual(Object.fromEntries(['Assiettes et plats','Entrées','Desserts'].map(c=>[c,book.recipes.filter(r=>r.category===c).length])),{'Assiettes et plats':40,'Entrées':5,'Desserts':5});
 assert.equal(book.recipes.reduce((n,r)=>n+r.ingredients.length,0),539);assert.equal(book.recipes.reduce((n,r)=>n+r.steps.length,0),205);
 assert.equal(new Set(book.recipes.map(r=>r.number)).size,50);
 for(const r of book.recipes){assert.ok(r.ingredients.length&&r.steps.length);assert.equal(r.servings,2);assert.equal(r.editorial.testedInKitchen,false);assert.ok(Object.values(r.nutrition.perServing).every(v=>v===null));assert.deepEqual(exclusions(r,book.settings),[]);}
 assert.match(CATALOGUE_INFO.sourcePdfSha256,/^[a-f0-9]{64}$/);
});
test('les précisions originales sont conservées et les quantités 2 → 4 doublent sans modifier les temps',()=>{
 const book=source(),r=book.recipes[0],lentils=r.ingredients.find(i=>i.name==='Lentilles vertes');
 assert.equal(lentils.preparation,'sèches');assert.equal(lentils.group,'Lentilles');assert.equal(scaledQuantity(lentils,2,4),240);
 const beans=book.recipes[2].ingredients.find(i=>i.name==='Haricots blancs');assert.equal(beans.preparation,'déjà cuits, rincés, égouttés');
 assert.match(methodText(r,0,4),/1\s?600 ml/);assert.match(methodText(r,0,4),/25 à 30 min/);assert.match(methodText(r,1,4),/120 ml/);
 assert.match(methodText(book.recipes[1],0,4),/190 °C/);assert.match(methodText(book.recipes[1],0,4),/2 cm/);assert.match(methodText(book.recipes[1],0,4),/16 g/);
 assert.equal(r.prepMinutes,15);assert.equal(r.cookMinutes,30);assert.equal(r.editorial.totalMinutes,40);
});
test('une méthode personnelle modifiée ne subit aucune réécriture automatique',()=>{
 const r=structuredClone(CATALOGUE_RECIPES[0]);r.steps[0]='Utiliser 200 ml et goûter.';assert.equal(methodText(r,0,4),r.steps[0]);
});
test('une installation répétée ne crée aucun doublon et ne réinitialise pas les annotations',()=>{
 const book=source();book.recipes[0].notes='Mon essai : très bon.';book.recipes[0].ingredients[0].quantity=350;
 const again=installCatalogue(book);assert.equal(again.changed,false);assert.equal(again.notebook,book);assert.equal(again.notebook.recipes[0].notes,'Mon essai : très bon.');assert.equal(again.notebook.recipes[0].ingredients[0].quantity,350);
});
test('les exemples intacts sont complétés sur place : favoris, marque-page et snapshots restent valides',()=>{
 let book=exampleNotebook();book.revision=4;book.favoriteIds=['example-cabillaud'];book=setMenu(book,{date:'2026-10-15',slot:'Midi',recipeId:'example-cabillaud',servings:3});book=beginCooking(book,book.recipes[0],3);
 const oldMenu=structuredClone(book.menus),oldCooking=structuredClone(book.cooking),before=structuredClone(book);
 const result=installCatalogue(book);assert.equal(result.completed,3);assert.equal(result.added,47);assert.equal(result.notebook.recipes.length,50);
 assert.equal(result.notebook.recipes.find(r=>r.id==='example-cabillaud').editorial.sourceId,'CDR-R001');assert.equal(result.notebook.bookmarkedId,book.bookmarkedId);assert.deepEqual(result.notebook.favoriteIds,book.favoriteIds);
 assert.deepEqual(result.notebook.menus,oldMenu);assert.deepEqual(result.notebook.cooking,oldCooking);assert.deepEqual(book,before);
});
test('les exemples retouchés, recettes, photos et numéros personnels ne sont pas écrasés',()=>{
 let book=exampleNotebook();book.revision=3;book.recipes[0].notes='Ma note personnelle';book.recipes[1].title='Mon poulet à moi';
 book=withRecipe(book,{...blankRecipe(),title:'Recette personnelle'}, {id:'photo-personnelle',name:'x.png',blob:new Blob(['photo'],{type:'image/png'})});
 const originals=structuredClone(book.recipes.slice(0,2)),personal=structuredClone(book.recipes.at(-1)),photo=book.photos[0];
 const result=installCatalogue(book);assert.equal(result.notebook.recipes.length,53);assert.deepEqual(result.notebook.recipes.slice(0,2),originals);assert.deepEqual(result.notebook.recipes.find(r=>r.id===personal.id),personal);assert.deepEqual(result.notebook.photos[0],photo);
 assert.equal(new Set(result.notebook.recipes.map(r=>r.number)).size,53);assert.equal(new Set(result.notebook.recipes.map(r=>r.editorial?.sourceId).filter(Boolean)).size,50);
});
test('une collision d’identifiant personnel est résolue sans remplacer la fiche',()=>{
 const book=withRecipe(emptyNotebook(),{...blankRecipe(),id:'CDR-R001',title:'Ma recette privée'});book.revision=1;
 const result=installCatalogue(book);assert.equal(result.notebook.recipes.find(r=>r.id==='CDR-R001').title,'Ma recette privée');assert.equal(result.notebook.recipes.filter(r=>r.editorial?.sourceId==='CDR-R001').length,1);assert.equal(result.notebook.recipes.length,51);
});
test('stockage : fermeture, reprise, export et restauration conservent les 50 recettes et leur marqueur',async()=>{
 const factory=new MemoryIndexedDB(),store=new NotebookStore({factory,scope:'/catalogue/'}),book=source();book.recipes[0].notes='Ma première cuisson';const saved=await store.commit(book,0);store.close();
 const reopened=new NotebookStore({factory,scope:'/catalogue/'}),found=await reopened.read();assert.deepEqual(found,saved);
 const restored=(await readBackup(await makeBackup(found))).notebook;assert.deepEqual(restored.recipes,found.recipes);assert.deepEqual(restored.catalogueIds,[CATALOGUE_INFO.id]);assert.equal(installCatalogue(restored).changed,false);
 assert.deepEqual(mergeNotebooks(emptyNotebook(),restored).catalogueIds,[CATALOGUE_INFO.id]);
});
test('quota atteint : un échec de l’ajout ne modifie pas le carnet enregistré',async()=>{
 const factory=new MemoryIndexedDB(),store=new NotebookStore({factory,scope:'/failure/'});const original=await store.commit(exampleNotebook(),0);factory.failNextWrite=true;
 await assert.rejects(()=>store.commit(installCatalogue(original).notebook,original.revision));assert.deepEqual(await store.read(),original);
});
test('les 50 recettes sont accessibles par ingrédient, accent et nom français',()=>{
 const book=source();assert.ok(searchRecipes(book,'boeuf').length>=3);assert.ok(searchRecipes(book,'oeufs').length>=4);assert.ok(searchRecipes(book,'échalote').length>10);assert.equal(searchRecipes(book,'Petits clafoutis aux cerises').length,1);
});
test('menus pour quatre : les courses reprennent les poids secs et ne demandent pas d’acheter l’eau',()=>{
 const book=source(),menu=setMenu(book,{date:'2026-10-15',slot:'Midi',recipeId:'CDR-R001',servings:4});const rows=rebuildShopping(menu,'2026-10-12').shopping.generated;
 assert.equal(rows.find(r=>r.name==='Lentilles vertes').quantity,240);assert.equal(rows.find(r=>r.name==='Lentilles vertes').state,'sèches');assert.equal(rows.find(r=>r.name==='Cabillaud').quantity,600);assert.equal(rows.some(r=>r.name==='Eau'),false);
 const kitchen=beginCooking(book,book.recipes[0],4);assert.match(methodText(kitchen.cooking.snapshot,0,4),/1\s?600 ml/);
});
test('une recette sans lien de catalogue garde sa méthode et son schéma de sauvegarde',()=>{
 const recipe={...blankRecipe(),title:'Familiale',steps:['Cuire avec 100 ml d’eau.']};assert.equal(methodText(recipe,0,4),recipe.steps[0]);assert.equal(installCatalogue(source()).changed,false);
});
