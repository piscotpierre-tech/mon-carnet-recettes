import {validateNotebook, LIMITS} from './domain.js?v=0.7.0';
import {exampleNotebook} from './examples.js?v=0.7.0';
import {CATALOGUE_INFO, CATALOGUE_RECIPES} from './catalogue-data.js?v=0.7.0';
import {ADDITIONAL_CATALOGUES, ADDITIONAL_RECIPES} from './additional-catalogue-data.js?v=0.7.0';

export {CATALOGUE_INFO, CATALOGUE_RECIPES, ADDITIONAL_CATALOGUES, ADDITIONAL_RECIPES};
const allSources=new Map([...CATALOGUE_RECIPES,...ADDITIONAL_RECIPES].map(r=>[r.id,r]));
const additionalIds=new Set(ADDITIONAL_RECIPES.map(r=>r.id));
const replacements = {'example-cabillaud':'CDR-R001','example-poulet':'CDR-R011','example-tarte':'CDR-R034'};

// Only replace the original, unedited demonstration. Keep personal edits,
// photos and snapshots of meals or a cooking session exactly as they were.
function signature(recipe) {
  const {id, number, version, createdAt, updatedAt, stepIngredients, ...fields} = recipe;
  return JSON.stringify({...fields, ingredients:fields.ingredients.map(({id,...item})=>item)});
}
export function installCatalogue(current) {
  validateNotebook(current);
  if (current.catalogueIds?.includes(CATALOGUE_INFO.id)) return {notebook:current, changed:false, added:0, completed:0};
  const fresh = current.revision === 0 && current.recipes.length === 0;
  const next = structuredClone(fresh ? {...exampleNotebook(), recipes:[], bookmarkedId:null} : current);
  const examples = exampleNotebook().recipes;
  const usedNumbers = new Set(next.recipes.map(r=>r.number));
  let added=0, completed=0;
  for (const source of CATALOGUE_RECIPES) {
    if (next.recipes.some(r=>r.editorial?.sourceId===source.id)) continue;
    const template = examples.find(r=>replacements[r.id]===source.id);
    const index = template ? next.recipes.findIndex(r=>r.id===template.id && r.version===1 && !r.photoId && signature(r)===signature(template)) : -1;
    const recipe = structuredClone(source);
    if (index >= 0) {
      const previous=next.recipes[index];
      Object.assign(recipe,{id:previous.id, number:previous.number, createdAt:previous.createdAt, version:previous.version+1});
      next.recipes[index]=recipe; completed++;
    } else {
      if (next.recipes.length>=LIMITS.recipes) throw new Error('Les 50 recettes n’ont pas été ajoutées : le carnet atteindrait sa limite de fiches. Vos données sont conservées.');
      while(next.recipes.some(r=>r.id===recipe.id))recipe.id='catalogue-'+recipe.id;
      if (usedNumbers.has(recipe.number)) recipe.number=Math.max(0,...usedNumbers)+1;
      usedNumbers.add(recipe.number); next.recipes.push(recipe); added++;
    }
  }
  if (fresh) next.bookmarkedId='CDR-R001';
  next.catalogueIds=[...new Set([...(next.catalogueIds??[]),CATALOGUE_INFO.id])];
  return {notebook:validateNotebook(next), changed:true, added, completed};
}

export function installAdditionalCatalogues(current) {
  validateNotebook(current);
  const pending=ADDITIONAL_CATALOGUES.filter(c=>!current.catalogueIds?.includes(c.id));
  if(!pending.length)return {notebook:current,changed:false,added:0};
  const next=structuredClone(current),usedNumbers=new Set(next.recipes.map(r=>r.number));let added=0;
  for(const collection of pending){
    for(const source of ADDITIONAL_RECIPES.filter(r=>r.editorial.collectionId===collection.id)){
      if(next.recipes.some(r=>r.editorial?.sourceId===source.id))continue;
      if(next.recipes.length>=LIMITS.recipes)throw Error('Les nouveaux recueils n’ont pas été ajoutés : le carnet atteindrait sa limite de fiches. Vos données sont conservées.');
      const recipe=structuredClone(source);
      while(next.recipes.some(r=>r.id===recipe.id))recipe.id='catalogue-'+recipe.id;
      if(usedNumbers.has(recipe.number))recipe.number=Math.max(0,...usedNumbers)+1;
      usedNumbers.add(recipe.number);next.recipes.push(recipe);added++;
    }
    next.catalogueIds=[...(next.catalogueIds??[]),collection.id];
  }
  return {notebook:validateNotebook(next),changed:true,added};
}

// Adapt only the original supplied method. An edited method stays verbatim;
// the ingredient list remains the authoritative calculation for its servings.
export function culinaryMethod(recipe,index) {
  const text=recipe.steps[index];
  const source=allSources.get(recipe.editorial?.sourceId);
  if(!source || text!==source.steps[index])return text;
  return text
    .replace(' Noter le poids de chair et la quantité de jus consommée pour la nutrition.','')
    .replace('Contrôler la cuisson selon le repère poisson S3.','Vérifier la cuisson à cœur (63 °C).')
    .replace('Vérifier la cuisson du poisson selon S3.','Vérifier la cuisson à cœur (63 °C).')
    .replace(/(?:Vérifier|Contrôler) le repère poisson S3/g,'Vérifier la cuisson à cœur (63 °C)')
    .replace('contrôler le repère poisson S3','vérifier la cuisson à cœur (63 °C)')
    .replace('Vérifier la cuisson selon S3','Vérifier la cuisson à cœur (63 °C)')
    .replace('Vérifier la cuisson à cœur selon le repère volaille S3','Vérifier la cuisson à cœur (74 °C)')
    .replace('jusqu’à la cuisson à cœur du repère volaille S3','jusqu’à cuisson à cœur (74 °C)')
    .replace(/(?:vérifier|contrôler|Vérifier|Contrôler) le repère volaille S3/g,match=>(match[0]===match[0].toUpperCase()?'Vérifier':'vérifier')+' la cuisson à cœur (74 °C)')
    .replace('jusqu’au repère volaille S3','jusqu’à cuisson à cœur (74 °C)')
    .replace('jusqu’à des légumes tendres et au repère volaille S3','jusqu’à des légumes tendres et à une volaille cuite à cœur (74 °C)')
    .replace('jusqu’au repère viande hachée S3','jusqu’à cuisson à cœur (71 °C)')
    .replace('chaud à cœur selon S3','bien chaud à cœur (74 °C)')
    .replace('Vérifier le repère porc S3 et le repos indiqué.','Vérifier la cuisson à cœur (63 °C), puis laisser reposer 3 min.')
    .replace('cette fiche prévoit des œufs pris selon S3','laisser les œufs prendre jusqu’au cœur (71 °C)')
    .replace('la fiche prévoit blancs et jaunes pris selon S3, pas des œufs coulants','laisser les blancs et les jaunes prendre')
    .replace('une frittata prise selon S3','une frittata prise au centre (71 °C)')
    .replace('un appareil pris selon S3','un appareil pris au centre (71 °C)')
    .replace('un centre chaud et pris selon le repère plat aux œufs S3','un centre chaud et pris (71 °C)')
    .replace('un appareil pris au centre selon le repère plat aux œufs S3','un appareil pris au centre (71 °C)');
}
export function hasOriginalMethod(recipe) {
  const source=allSources.get(recipe.editorial?.sourceId);
  return !!source && recipe.servings===source.servings && recipe.steps.length===source.steps.length
    && recipe.steps.every((step,index)=>step===source.steps[index]||step===culinaryMethod(source,index))
    && recipe.ingredients.length===source.ingredients.length && source.ingredients.every(item=>recipe.ingredients.some(i=>i.id===item.id&&i.quantity===item.quantity&&i.name===item.name&&i.unit===item.unit));
}
export function methodText(recipe, index, target) {
  const text=culinaryMethod(recipe,index);
  if (!hasOriginalMethod(recipe) || target===recipe.servings) return text;
  const factor=target/recipe.servings;
  let scaled=scaleMeasures(text,factor,additionalIds.has(recipe.editorial?.sourceId));
  if(additionalIds.has(recipe.editorial?.sourceId)){
    const counts={quatre:4,huit:8,douze:12,seize:16};
    scaled=scaled.replace(/\b(quatre|huit|douze|seize)\s+((?:(?:petites?|petits?|fines?|fins?)\s+)?(?:assiettes|coupelles|coupes|ramequins|bols|verrines|verres|crêpes|galettes|moules|carrés|disques|portions|parts|tranches|tartines|rectangles|biscuits|fonds|millefeuilles|pots|boules|quenelles|empreintes|nids))\b/g,(_,word,noun)=>`${frenchNumber(counts[word]*factor)} ${counts[word]*factor===1?noun.replace(/s\b/g,''):noun}`)
      .replace(/\bhuit d’entre eux\b/g,`${frenchNumber(8*factor)} d’entre eux`)
      .replace(/\b(couper|partager) en quatre\b/g,(_,verb)=>`${verb} en ${frenchNumber(target)}`);
    if(recipe.editorial.sourceId==='CDR-E033')scaled=scaled.replace('le gramme de sel restant',frenchNumber(factor)+' g de sel restant');
    return scaled;
  }
  return scaled.replace(/\bdeux (assiettes|ramequins|cocottes)\b/g,`${target} $1`);
}
const frenchNumber=value=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(value);
function scaleMeasures(text,factor,keepPerPortion=false){
  return text.replace(/(\d+(?:[.,]\d+)?)\s*(kg|ml|cl|g|l)\b/g,(all,value,unit,offset,whole)=>{
    if(keepPerPortion&&/^(?:\s+de\s+[^.;,:]+?)?\s+(?:sur|dans)\s+chaque\b/.test(whole.slice(offset+all.length)))return all;
    return `${frenchNumber(Number(value.replace(',','.'))*factor)} ${unit}`;
  });
}
export function ingredientPreparation(recipe,item,target){
  const text=item.preparation||item.state,source=allSources.get(recipe.editorial?.sourceId),original=source?.ingredients.find(i=>i.id===item.id);
  if(!additionalIds.has(source?.id)||recipe.servings!==source.servings||target===recipe.servings||!original||original.preparation!==item.preparation||original.quantity!==item.quantity||original.unit!==item.unit||original.name!==item.name)return text;
  const factor=target/recipe.servings;
  return scaleMeasures(text,factor).replace(/environ (\d+) (œufs?|pièces?)\b/g,(_,number,noun)=>{
    const quantity=Number(number)*factor,label=noun.startsWith('œuf')?'œuf':'pièce';
    return `environ ${frenchNumber(quantity)} ${label}${quantity>=2?'s':''}`;
  });
}
export function ingredientGroups(recipe) {
  return [...new Set(recipe.ingredients.map(i=>i.group||i.component))];
}
export function catalogueCount(book) {
  return new Set(book.recipes.map(r=>r.editorial?.sourceId).filter(Boolean)).size;
}
