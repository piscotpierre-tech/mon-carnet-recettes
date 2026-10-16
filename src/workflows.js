import {id,scaledQuantity,normalize,validateNotebook} from './domain.js?v=0.7.2';
export const dayString=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function monday(date=new Date()){const d=new Date(date);d.setDate(d.getDate()-(d.getDay()+6)%7);return dayString(d);}
export function shiftDay(day,amount){const d=new Date(day+'T12:00:00');d.setDate(d.getDate()+amount);return dayString(d);}
export function remaining(timer,now=Date.now()){return timer.running?Math.max(0,timer.endAt-now):timer.remainingMs;}
export function timerAction(timer,action,value,now=Date.now()){
  const next={...timer};
  if(action==='set'){if(!Number.isFinite(value)||value<1||value>86400)throw new Error('Choisissez une durée entre 1 seconde et 24 heures.');next.durationMs=value*1000;next.remainingMs=next.durationMs;next.running=false;next.endAt=null;}
  if(action==='start'){next.remainingMs=remaining(timer,now)||timer.durationMs;next.running=true;next.endAt=now+next.remainingMs;}
  if(action==='pause'){next.remainingMs=remaining(timer,now);next.running=false;next.endAt=null;}
  if(action==='reset'){next.remainingMs=next.durationMs;next.running=false;next.endAt=null;}
  return next;
}
export function beginCooking(book,recipe,servings,{menuId}={}){
  if(!recipe.steps.length)throw new Error('Ajoutez au moins une étape à cette recette avant de passer en cuisine.');
  const next=structuredClone(book);next.cooking={snapshot:{...structuredClone(recipe),photoId:null},servings,stepIndex:0,completed:[],...(menuId?{menuId}:{}),timer:{name:recipe.title.slice(0,120),durationMs:300000,remainingMs:300000,running:false,endAt:null}};return validateNotebook(next);
}
export function setMenu(book,{date,slot,recipeId,servings,menuId,refreshRecipe=false}){
  const next=structuredClone(book),recipe=next.recipes.find(r=>r.id===recipeId);if(!recipe)throw new Error('Choisissez une recette du carnet.');
  const current=menuId?next.menus.find(m=>m.id===menuId):null;if(menuId&&!current)throw new Error('Ce repas est introuvable.');
  const snapshot=current?.recipeId===recipeId&&!refreshRecipe?current.snapshot:{...structuredClone(recipe),photoId:null};
  next.menus=next.menus.filter(m=>m.id!==menuId&&!(m.date===date&&m.slot===slot));next.menus.push({id:current?.id??id(),date,slot,recipeId,servings,snapshot});return validateNotebook(next);
}
function amountBase(ingredient,servings,reference){
  let quantity=scaledQuantity(ingredient,reference,servings),unit=ingredient.unit;
  if(unit==='kg'){quantity=quantity===null?null:quantity*1000;unit='g';}
  if(unit==='l'||unit==='cl'){quantity=quantity===null?null:quantity*(unit==='l'?1000:10);unit='ml';}
  return {quantity,unit};
}
export function aisle(name){const n=normalize(name);if(/cabillaud|poisson|truite|sardine/.test(n))return 'Poissonnerie';if(/poulet|volaille|boeuf|dinde/.test(n))return 'Boucherie';if(/beurre|lait|creme|oeuf|fromage/.test(n))return 'Produits frais';if(/poireau|carotte|echalote|basilic|fraise|champignon|courge|citron|pomme|oignon|salade|tomate|herbe/.test(n))return 'Fruits et légumes';return 'Épicerie';}
export function rebuildShopping(book,week){
  const next=structuredClone(book),groups=new Map(),old=new Map(next.shopping.generated.map(r=>[r.key,r]));
  const meals=next.menus.filter(m=>m.date>=week&&m.date<shiftDay(week,7));
  for(const menu of meals)for(const ingredient of menu.snapshot.ingredients){
    if(ingredient.purchase===false)continue;
    const state=ingredient.preparation||ingredient.state;
    const a=amountBase(ingredient,menu.servings,menu.snapshot.servings),key=JSON.stringify([normalize(ingredient.name).trim(),a.unit,state]);
    let row=groups.get(key);
    if(!row){row={id:old.get(key)?.id??id(),key,name:ingredient.name,quantity:0,unit:a.unit,state,aisle:aisle(ingredient.name),bought:false,atHome:false,needsReview:false,menuIds:[]};groups.set(key,row);}
    row.quantity=row.quantity===null||a.quantity===null?null:row.quantity+a.quantity;row.menuIds.push(menu.id);
  }
  for(const row of groups.values()){
    const previous=old.get(row.key);
    if(previous){const increased=row.quantity===null?previous.quantity!==null:previous.quantity!==null&&row.quantity>previous.quantity+1e-8;row.bought=increased?false:previous.bought;row.atHome=increased?false:previous.atHome;row.needsReview=increased||!!previous.needsReview;}
  }
  next.shopping.generated=[...groups.values()];next.shopping.week=week;return validateNotebook(next);
}
export function harvestToReserve(book,harvestId){
  const harvest=book.harvests.find(h=>h.id===harvestId);if(!harvest)throw new Error('Récolte introuvable.');
  if(book.reserves.some(r=>r.harvestId===harvestId))throw new Error('Cette récolte est déjà notée dans vos réserves.');
  const plant=book.plants.find(p=>p.id===harvest.plantId),next=structuredClone(book);
  next.reserves.push({id:id(),name:plant.kind==='fraisier'?'Fraises fraîches':plant.kind==='basilic'?'Basilic frais':plant.name,quantity:harvest.quantity,unit:harvest.unit,state:'récolté',lot:'',date:harvest.date,harvestId,notes:'Récolte enregistrée. Conditions et durée de conservation à documenter.'});return validateNotebook(next);
}
