import {id,validateNotebook,normalize,exclusions} from './domain.js?v=0.6.1';
import {dayString} from './workflows.js?v=0.6.1';
import {GARDEN_PANTRY_ID,PANTRY_PREPARATIONS,WEIGHED_JAM} from './garden-pantry-data.js?v=0.6.1';
export function installGardenPantry(book){
 validateNotebook(book);
 if(book.catalogueIds?.includes(GARDEN_PANTRY_ID))return {notebook:book,changed:false};
 const next=structuredClone(book);
 for(const source of PANTRY_PREPARATIONS){
  if(next.preparations.some(p=>p.referenceId===source.referenceId))continue;
  const old=next.preparations.find(p=>p.id==='example-confiture'&&p.name==='Confiture de fraises'&&p.lot===''&&source.referenceId==='GM01'&&p.source===''&&p.method===''&&p.storage===''&&p.notes==='Brouillon de la maquette. Ne fournit pas un procédé de conservation.'&&JSON.stringify(p.ingredients)===JSON.stringify([{name:'Fraises',quantity:500,unit:'g'},{name:'Sucre',quantity:null,unit:'g'},{name:'Jus de citron',quantity:null,unit:'g'}]));
  const row=structuredClone(source);
  if(old){row.id=old.id;next.preparations[next.preparations.indexOf(old)]=row;}
  else{while(next.preparations.some(p=>p.id===row.id))row.id='new-'+row.id;next.preparations.push(row);}
 }
 next.catalogueIds=[...(next.catalogueIds??[]),GARDEN_PANTRY_ID];
 return {notebook:validateNotebook(next),changed:true};
}
export function linkedRecipes(book,query){
 const q=normalize(query).trim();
 return book.recipes.filter(r=>!exclusions(r,book.settings).length&&r.ingredients.some(i=>normalize(i.name).includes(q)));
}
export function addPantryLot(book,input){
 const next=structuredClone(book),prep=next.preparations.find(p=>p.id===input.preparationId);
 if(!prep)throw Error('Choisir une fiche du garde-manger.');
 if(!Number.isInteger(input.jarCount)||input.jarCount<1||input.jarCount>100)throw Error('Noter entre 1 et 100 pots.');
 const netWeightG=input.netWeightG??null;if(netWeightG!==null&&(!Number.isFinite(netWeightG)||netWeightG<=0))throw Error('Le poids d’un pot doit être positif ou laissé vide.');
 const altitudeM=input.altitudeM??(input.altitudeFt==null?null:input.altitudeFt*0.3048);
 const lot={...input,altitudeM,netWeightG,id:id(),procedure:structuredClone(prep),createdAt:new Date().toISOString()};
 next.pantryLots??=[];next.pantryLots.push(lot);
 for(let i=1;i<=input.jarCount;i++)next.reserves.push({id:id(),name:prep.name,quantity:netWeightG??1,unit:netWeightG===null?'pot':'g',state:prep.referenceId==='GM01'?'confiture':'en bocal',lot:input.label,date:input.date,harvestId:null,notes:'',pantryLotId:lot.id,jarNumber:i,openedOn:null,discarded:false});
 return validateNotebook(next);
}
export function openPantryJar(book,reserveId,date=dayString()){
 const next=structuredClone(book),reserve=next.reserves.find(r=>r.id===reserveId);
 if(!reserve?.pantryLotId)throw Error('Ce pot n’est pas rattaché à un lot.');
 if(reserve.discarded||reserve.quantity===0)throw Error('Ce pot a été terminé ou écarté.');
 if(date<reserve.date)throw Error('La date d’ouverture précède celle du lot.');
 if((next.reserveUses??[]).some(u=>u.reserveId===reserveId&&!u.undone&&u.date<date))throw Error('Un prélèvement est déjà noté avant cette date. Corriger son suivi avant la date d’ouverture.');
 reserve.openedOn=date;return validateNotebook(next);
}
export function useReserve(book,{reserveId,recipeId=null,quantity,date=dayString(),notes=''}){
 const next=structuredClone(book),reserve=next.reserves.find(r=>r.id===reserveId);
 if(!reserve||reserve.discarded)throw Error('Cette réserve n’est pas disponible.');
 if(reserve.quantity===null)throw Error('Noter la quantité disponible avant de faire un prélèvement.');
 if(!Number.isFinite(quantity)||quantity<=0||quantity>reserve.quantity)throw Error('La quantité dépasse la réserve disponible ou n’est pas valable.');
 if(reserve.unit==='pot'&&!Number.isInteger(quantity))throw Error('Sans pesée, noter les pots entiers terminés.');
 if(reserve.pantryLotId&&!reserve.openedOn)throw Error('Noter d’abord l’ouverture du pot.');
 if(reserve.openedOn&&date<reserve.openedOn)throw Error('Le prélèvement précède l’ouverture du pot.');
 const recipe=recipeId?next.recipes.find(r=>r.id===recipeId):null;if(recipeId&&!recipe)throw Error('La recette choisie est introuvable.');
 next.reserveUses??=[];next.reserveUses.push({id:id(),reserveId,recipeId,recipeVersion:recipe?.version??null,recipeTitle:recipe?.title??'',quantity,unit:reserve.unit,date,notes,undone:false});
 reserve.quantity=Math.max(0,reserve.quantity-quantity);return validateNotebook(next);
}
export function undoReserveUse(book,useId){
 const next=structuredClone(book),use=next.reserveUses?.find(u=>u.id===useId);
 if(!use||use.undone)throw Error('Ce prélèvement a déjà été annulé ou n’existe pas.');
 const reserve=next.reserves.find(r=>r.id===use.reserveId);if(!reserve||reserve.quantity===null||reserve.unit!==use.unit)throw Error('La réserve a changé d’unité : corriger son suivi avant d’annuler.');
 reserve.quantity+=use.quantity;use.undone=true;return validateNotebook(next);
}
export function reserveStatus(reserve){return reserve.discarded?'Écarté':reserve.quantity===0?'Terminé':reserve.openedOn?'Ouvert':'Fermé';}

export function installMetricPantry(book){
 validateNotebook(book);const marker='CDR-METRIC-V1';if(book.catalogueIds?.includes(marker))return {notebook:book,changed:false};
 const next=structuredClone(book),legacy=PANTRY_PREPARATIONS.find(p=>p.referenceId==='GM01');
 for(let i=0;i<next.preparations.length;i++){
  const p=next.preparations[i],intact=Object.keys(legacy).filter(key=>!['id','notes','lot'].includes(key)).every(key=>JSON.stringify(p[key])===JSON.stringify(legacy[key]));
  if(intact)next.preparations[i]={...structuredClone(WEIGHED_JAM),id:p.id,notes:p.notes,lot:p.lot};
 }
 next.catalogueIds=[...(next.catalogueIds??[]),marker];return {notebook:validateNotebook(next),changed:true};
}
