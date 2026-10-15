import {test} from 'node:test';
import assert from 'node:assert/strict';
import {metricQuantity,fromMetricQuantity,metricText,metricPreparation,metricCommon,altitudeMeters} from '../src/metric.js';
import {PANTRY_PREPARATIONS,COMMON_CANNING} from '../src/garden-pantry-data.js';
import {installGardenPantry,installMetricPantry,addPantryLot,openPantryJar,useReserve,undoReserveUse} from '../src/garden-pantry.js';
import {installCatalogue} from '../src/catalogue.js';
import {emptyNotebook,validateNotebook} from '../src/domain.js';
import {makeBackup,readBackup} from '../src/backup.js';
import {procedureBody,lotForm,lotSummary,reserveBody} from '../src/garden-pantry-ui.js';
const forbidden=/\b(?:ft|cups?|half-pints?|pints?|quarts?|gallons?|inch(?:es)?)\b|°F/i;
const legacyBook=()=>installGardenPantry(installCatalogue(emptyNotebook()).notebook).notebook;
const values=b=>({preparationId:b.preparations.find(p=>p.referenceId==='GM01').id,label:'Ancienne fournée',date:'2026-10-15',jarCount:1,netWeightG:null,container:'Mason',closure:'Deux parties',equipment:'Marmite',altitudeFt:1000,treatmentMinutes:5,ingredientsNotes:'4 cups US de fruits',treatmentNotes:'',location:'Cellier',notes:''});

test('longueurs et volumes sont convertis sans inventer une masse alimentaire',()=>{
 assert.deepEqual(metricQuantity(1000,'ft'),{quantity:304.8,unit:'m'});assert.deepEqual(metricQuantity(4,'cups US'),{quantity:946.352946,unit:'ml'});assert.deepEqual(metricQuantity(1,'lb'),{quantity:.45359237,unit:'kg'});assert.deepEqual(metricQuantity(null,'cups US'),{quantity:null,unit:'ml'});assert.deepEqual(metricQuantity(500,'g'),{quantity:500,unit:'g'});
});
test('les tranches d’altitude conservent les seuils exacts sans trou entre deux lignes',()=>{
 const m=metricPreparation(PANTRY_PREPARATIONS[1]);assert.deepEqual(m.table.map(r=>r[0]),['0 à 304,8 m','Plus de 304,8 à 914,4 m','Plus de 914,4 à 1 828,8 m','Plus de 1 828,8 m']);assert.match(m.table[0][1],/20 min/);assert.match(m.table[3][1],/40 min/);
});
test('3 à 4 pots reste un nombre de pots et ne devient pas un volume de quatre pots',()=>{
 const p=metricPreparation(PANTRY_PREPARATIONS[0]);assert.match(p.yield,/3 à 4 pots/);assert.match(p.yield,/236,59 ml/);assert.doesNotMatch(p.yield,/3 à 946/);assert.doesNotMatch(p.batchNote,forbidden);
});
test('les deux méthodes historiques et les consignes communes n’affichent plus d’unités américaines',()=>{
 for(const p of PANTRY_PREPARATIONS)assert.doesNotMatch(procedureBody(p),forbidden);assert.doesNotMatch(JSON.stringify(metricCommon(COMMON_CANNING)),forbidden);
 assert.equal(metricText('1/2 inch libre (12,7 mm)'),'12,7 mm libres');assert.equal(metricText('40 °F ou moins (environ 4,4 °C)'),'4,4 °C ou moins');
});
test('la fiche courante de confiture est pesée et ne récupère pas le tableau d’un autre procédé',()=>{
 const b=installMetricPantry(legacyBook()).notebook,p=b.preparations.find(p=>p.referenceId==='GM01');assert.deepEqual(p.ingredients.map(i=>[i.quantity,i.unit]),[[1,'kg'],[800,'g'],[1,'pièce']]);assert.equal(p.version,2);assert.equal(p.canningMode,'recipe-only');assert.deepEqual(p.table,[]);assert.match(p.source,/editions-larousse/);assert.doesNotMatch(procedureBody(p),forbidden);assert.ok(!procedureBody(p).includes('Le traitement des pots remplis'));
});
test('mettre à jour la fiche ne change ni les notes ni la méthode de la fournée existante',()=>{
 let b=legacyBook();const p=b.preparations.find(p=>p.referenceId==='GM01');p.notes='Mes fruits du jardin';b=addPantryLot(b,values(b));const snapshot=structuredClone(b.pantryLots[0].procedure);const result=installMetricPantry(b);assert.equal(result.notebook.preparations.find(row=>row.id===p.id).notes,'Mes fruits du jardin');assert.deepEqual(result.notebook.pantryLots[0].procedure,snapshot);assert.equal(installMetricPantry(result.notebook).changed,false);
});
test('une fiche dont les ingrédients ou le procédé ont été personnalisés reste conservée',()=>{
 for(const change of [p=>{p.ingredients[0].quantity=3;},p=>{p.table[0][1]='10 min';},p=>{p.storage='Ma note personnelle';}]){
  const b=legacyBook(),p=b.preparations.find(p=>p.referenceId==='GM01');change(p);const original=structuredClone(p);assert.deepEqual(installMetricPantry(b).notebook.preparations.find(row=>row.id===p.id),original);
 }
});
test('les anciens lots en pieds se lisent en mètres sans effacer la valeur archivée',async()=>{
 const b=addPantryLot(legacyBook(),values(legacyBook()));assert.equal(altitudeMeters(b.pantryLots[0]),304.8);assert.equal(b.pantryLots[0].altitudeFt,1000);assert.doesNotMatch(lotSummary(b,b.pantryLots[0]),forbidden);const restored=(await readBackup(await makeBackup(b))).notebook;assert.equal(restored.pantryLots[0].altitudeFt,1000);assert.equal(altitudeMeters(restored.pantryLots[0]),304.8);
});
test('une nouvelle altitude est saisie en mètres et reste dans cette unité après sauvegarde',async()=>{
 const b=installMetricPantry(legacyBook()).notebook,input=values(b);delete input.altitudeFt;input.altitudeM=150;const n=addPantryLot(b,input);assert.equal(n.pantryLots[0].altitudeM,150);assert.equal(n.pantryLots[0].altitudeFt,undefined);assert.match(lotForm(n.preparations[0]),/name="altitudeM"/);assert.ok(!lotForm(n.preparations[0]).includes('name="altitudeFt"'));assert.equal((await readBackup(await makeBackup(n))).notebook.pantryLots[0].altitudeM,150);
});
test('une ancienne réserve volumique se prélève en ml affichés puis s’annule exactement',()=>{
 let b=legacyBook();b.reserves.push({id:'old-cup',name:'Mon liquide',quantity:1,unit:'cup US',state:'préparé',lot:'',date:'2026-10-15',harvestId:null,notes:''});const original=structuredClone(b.reserves[0]);assert.match(reserveBody(b,b.reserves[0]),/236,59 ml/);assert.doesNotMatch(reserveBody(b,b.reserves[0]),forbidden);
 b=useReserve(b,{reserveId:'old-cup',quantity:fromMetricQuantity(100,'cup US')});assert.ok(Math.abs(metricQuantity(b.reserves[0].quantity,b.reserves[0].unit).quantity-136.5882365)<1e-9);b=undoReserveUse(b,b.reserveUses[0].id);assert.deepEqual(b.reserves[0],original);
});
test('les altitudes invalides sont refusées et les anciens champs optionnels restent lisibles',()=>{
 const b=installMetricPantry(legacyBook()).notebook,input=values(b);delete input.altitudeFt;input.altitudeM=-1;assert.throws(()=>addPantryLot(b,input),/Altitude/);input.altitudeM=10001;assert.throws(()=>addPantryLot(b,input),/Altitude/);assert.ok(validateNotebook(b));
});
