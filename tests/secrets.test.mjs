import {test} from 'node:test';
import assert from 'node:assert/strict';
import {emptyNotebook,migrateNotebook,validateNotebook,mergeNotebooks} from '../src/domain.js';
import {blankSecret,saveSecret} from '../src/secrets.js';
import {makeBackup,readBackup} from '../src/backup.js';
import {installCatalogue} from '../src/catalogue.js';
import {NotebookStore} from '../src/storage.js';
import {MemoryIndexedDB} from './memory-indexeddb.mjs';
test('un ancien carnet V2 rempli est enrichi sans modifier sa source ni ses données',()=>{
 const old=installCatalogue(emptyNotebook()).notebook;delete old.secrets;
 old.recipes[0].notes='Mon vieux cahier';old.favoriteIds=[old.recipes[0].id];
 const before=structuredClone(old),next=migrateNotebook(old);
 assert.deepEqual(old,before);assert.deepEqual(next.secrets,[]);
 assert.deepEqual(next.recipes,before.recipes);assert.deepEqual(next.favoriteIds,before.favoriteIds);
});
test('les secrets se créent, se corrigent et reviennent des sauvegardes avec les convives',async()=>{
 let b=installCatalogue(emptyNotebook()).notebook;
 const secret={...blankSecret(),title:'Essai personnel',waterMl:375,sugarG:42.5,recipeReference:'Mon essai',date:'2026-10-16',lot:'ESSAI-1',tips:'Noter mes gestes',trials:'Ajuster la prochaine fois'};
 b=saveSecret(b,secret);b=saveSecret(b,{...secret,sugarG:43.5});assert.equal(b.secrets.length,1);
 b.servingsByRecipe={[b.recipes[0].id]:3};
 const restored=(await readBackup(await makeBackup(b))).notebook;
 assert.deepEqual(restored.secrets,b.secrets);assert.deepEqual(restored.servingsByRecipe,b.servingsByRecipe);
 assert.equal(restored.secrets[0].waterMl,375);assert.equal(restored.secrets[0].sugarG,43.5);
});
test('la fusion de secrets ajoute sans doublon et refuse un conflit sans écraser le carnet',()=>{
 const a=saveSecret(emptyNotebook(),{...blankSecret(),title:'Mon secret'}),incoming=structuredClone(a);
 assert.equal(mergeNotebooks(a,incoming).secrets.length,1);
 incoming.secrets[0].tips='Changement concurrent';assert.throws(()=>mergeNotebooks(a,incoming),/Conflit/);
 assert.equal(a.secrets[0].tips,'');
});
test('un secret invalide ne peut pas enregistrer une quantité négative ni une fausse date',()=>{
 const row={...blankSecret(),title:'Test'};
 assert.throws(()=>saveSecret(emptyNotebook(),{...row,sugarG:-5}),/Quantité/);
 assert.throws(()=>saveSecret(emptyNotebook(),{...row,date:'2026-02-30'}),/Date/);
 assert.throws(()=>saveSecret(emptyNotebook(),{...row,waterMl:Infinity}),/Quantité/);
});
test('IndexedDB conserve une note, un secret et les convives après réouverture',async()=>{
 const factory=new MemoryIndexedDB(),options={factory,scope:'/maquettes-test/'};
 const store=new NotebookStore(options);let b=installCatalogue(emptyNotebook()).notebook;
 b.recipes[0].notes='Une note à conserver';b.servingsByRecipe={[b.recipes[0].id]:7};
 b=saveSecret(b,{...blankSecret(),title:'Secret durable'});await store.commit(b,0);
 const after=await new NotebookStore(options).read();assert.equal(after.secrets[0].title,'Secret durable');
 assert.equal(after.recipes[0].notes,'Une note à conserver');assert.equal(after.servingsByRecipe[b.recipes[0].id],7);
 validateNotebook(after);
});
