export const APP = 'mon-carnet-recettes';
export const APP_VERSION = '0.2.0';
export const SCHEMA_VERSION = 2;
export const LIMITS = Object.freeze({recipes: 1000, photoBytes: 2 * 1024 * 1024, allPhotosBytes: 30 * 1024 * 1024, backupBytes: 45 * 1024 * 1024});
export const CATEGORIES = ['Assiettes et plats', 'Entrées', 'Desserts', 'Garnitures', 'Sauces et bases'];
export const UNITS = ['g', 'kg', 'ml', 'cl', 'l', 'pièce', 'c. à soupe', 'c. à café', 'pincée', 'à ajuster'];
export const STATES = ['non précisé', 'cru', 'cuit', 'sec', 'égoutté', 'nettoyé', 'cru, nettoyé'];
export const COMPONENTS = ['Préparation principale', 'Garniture', 'Sauce', 'Finition'];
export const NUTRIENTS = ['energyKcal', 'proteinG', 'carbohydrateG', 'fatG', 'fiberG', 'saltG'];
export const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const id = () => crypto.randomUUID();
const fail = message => { throw new Error(message); };
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const str = (value, max, label, empty = true) => typeof value === 'string' && value.length <= max && (empty || value.trim().length > 0) || fail(`${label} invalide.`);
const int = (value, min, max, label) => Number.isSafeInteger(value) && value >= min && value <= max || fail(`${label} invalide.`);
const enumValue = (value, values, label) => values.includes(value) || fail(`${label} invalide.`);
const identifier = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value) || fail('Identifiant invalide.');
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)) || fail('Date invalide.');

export function emptyNotebook() {
  return {schemaVersion: SCHEMA_VERSION, revision: 0, recipes: [], photos: [], settings: {apple: true, oats: true, sound: true, keepAwake: false},
    favoriteIds: [], bookmarkedId: null, cooking: null, menus: [], shopping: {generated: [], personal: []}, plants: [], observations: [], harvests: [], reserves: [], preparations: []};
}
export function migrateNotebook(input) {
  if (!input || ![1, 2].includes(input.schemaVersion)) fail('Version de données non prise en charge. Le carnet actuel est conservé.');
  const result = input.schemaVersion === 1 ? {...emptyNotebook(), ...structuredClone(input), schemaVersion:2, settings:{sound:true,keepAwake:false,...input.settings}} : input;
  return validateNotebook(result);
}
export function blankRecipe() {
  const now = new Date().toISOString();
  return {id: id(), number: 1, version: 1, title: '', category: CATEGORIES[0], status: 'draft', servings: 2,
    ingredients: [], steps: [], notes: '', origin: '', photoId: null, createdAt: now, updatedAt: now,
    nutrition: {status: 'undocumented', source: null, perServing: Object.fromEntries(NUTRIENTS.map(key => [key, null]))}};
}
export function validateRecipe(recipe) {
  if (!plain(recipe)) fail('Fiche invalide.');
  identifier(recipe.id); int(recipe.number, 1, 1000000, 'Numéro'); int(recipe.version, 1, 1000000, 'Version de fiche');
  str(recipe.title, 160, 'Titre', false); str(recipe.notes, 12000, 'Notes'); str(recipe.origin, 1000, 'Origine');
  enumValue(recipe.category, CATEGORIES, 'Catégorie'); enumValue(recipe.status, ['draft', 'ready'], 'Statut');
  int(recipe.servings, 1, 100, 'Nombre de convives'); date(recipe.createdAt); date(recipe.updatedAt);
  if (recipe.photoId !== null) identifier(recipe.photoId);
  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length > 150) fail('Liste d’ingrédients invalide.');
  const ingredientIds = new Set();
  for (const item of recipe.ingredients) {
    if (!plain(item)) fail('Ingrédient invalide.');
    identifier(item.id); if (ingredientIds.has(item.id)) fail('Ingrédient dupliqué.'); ingredientIds.add(item.id);
    str(item.name, 200, 'Nom d’ingrédient', false);
    if (item.quantity !== null && !(typeof item.quantity === 'number' && Number.isFinite(item.quantity) && item.quantity > 0 && item.quantity <= 1000000)) fail('Quantité invalide.');
    enumValue(item.unit, UNITS, 'Unité'); enumValue(item.state, STATES, 'État'); enumValue(item.component, COMPONENTS, 'Composant');
  }
  if (!Array.isArray(recipe.steps) || recipe.steps.length > 100) fail('Étapes invalides.');
  recipe.steps.forEach(step => str(step, 4000, 'Étape', false));
  if(recipe.material!==undefined)str(recipe.material,1000,'Matériel');
  for(const key of ['prepMinutes','cookMinutes'])if(recipe[key]!==undefined&&recipe[key]!==null)int(recipe[key],0,1440,'Durée');
  if(recipe.stepIngredients!==undefined&&(!Array.isArray(recipe.stepIngredients)||recipe.stepIngredients.length!==recipe.steps.length||recipe.stepIngredients.some(list=>!Array.isArray(list)||list.some(key=>!ingredientIds.has(key)))))fail('Ingrédients d’étape invalides.');
  if (recipe.status === 'ready' && (!recipe.ingredients.length || !recipe.steps.length)) fail('Pour être prête, une fiche doit contenir des ingrédients et des étapes.');
  const n = recipe.nutrition;
  if (!plain(n) || n.status !== 'undocumented' || n.source !== null || !plain(n.perServing) || NUTRIENTS.some(key => n.perServing[key] !== null)) fail('Ce lot ne prend pas encore en charge les données nutritionnelles chiffrées.');
  return recipe;
}
export function validateNotebook(book) {
  if (!plain(book) || book.schemaVersion !== SCHEMA_VERSION) fail('Version de données non prise en charge. Le carnet actuel est conservé.');
  int(book.revision, 0, Number.MAX_SAFE_INTEGER - 1, 'Révision');
  if (!Array.isArray(book.recipes) || book.recipes.length > LIMITS.recipes) fail('Trop de fiches ou liste invalide.');
  if (!Array.isArray(book.photos) || book.photos.length > LIMITS.recipes) fail('Liste de photos invalide.');
  if (!plain(book.settings) || typeof book.settings.apple !== 'boolean' || typeof book.settings.oats !== 'boolean') fail('Préférences invalides.');
  const ids = new Set(), numbers = new Set(), photos = new Map(); let bytes = 0;
  for (const photo of book.photos) {
    if (!plain(photo)) fail('Photo invalide.'); identifier(photo.id);
    if (photos.has(photo.id)) fail('Photo dupliquée.');
    if (!(photo.blob instanceof Blob) || !['image/jpeg', 'image/png', 'image/webp'].includes(photo.blob.type) || photo.blob.size < 1 || photo.blob.size > LIMITS.photoBytes) fail('Format ou taille de photo invalide.');
    str(photo.name, 200, 'Nom de photo'); photos.set(photo.id, photo); bytes += photo.blob.size;
  }
  if (bytes > LIMITS.allPhotosBytes) fail('Le carnet dépasse la limite de 30 Mo de photos de ce premier lot.');
  const referenced = new Set();
  for (const recipe of book.recipes) {
    validateRecipe(recipe);
    if (ids.has(recipe.id) || numbers.has(recipe.number)) fail('Identifiant ou numéro de fiche dupliqué.');
    ids.add(recipe.id); numbers.add(recipe.number);
    if (recipe.photoId) { if (!photos.has(recipe.photoId)) fail('Une photo référencée manque.'); if (referenced.has(recipe.photoId)) fail('Chaque fiche doit posséder sa propre photo.'); referenced.add(recipe.photoId); }
  }
  if (referenced.size !== photos.size) fail('Une photo ne correspond à aucune fiche.');
  validateExtensions(book);
  return book;
}
export function withRecipe(book, candidate, photo = undefined) {
  validateNotebook(book);
  const next = structuredClone(book), index = next.recipes.findIndex(r => r.id === candidate.id), old = next.recipes[index];
  const recipe = structuredClone(candidate);
  recipe.title = recipe.title.trim(); recipe.updatedAt = new Date().toISOString();
  recipe.number = old?.number ?? Math.max(0, ...next.recipes.map(r => r.number)) + 1;
  recipe.version = old ? old.version + 1 : 1; recipe.createdAt = old?.createdAt ?? recipe.createdAt;
  if (photo !== undefined) {
    if (old?.photoId) next.photos = next.photos.filter(p => p.id !== old.photoId);
    recipe.photoId = photo?.id ?? null;
    if (photo) next.photos.push(photo);
  } else recipe.photoId = old?.photoId ?? null;
  if (index < 0) next.recipes.push(recipe); else next.recipes[index] = recipe;
  return validateNotebook(next);
}
export function searchRecipes(book, query = '') {
  const q = normalize(query).trim();
  return book.recipes.filter(recipe => normalize([recipe.title, recipe.category, recipe.notes, ...recipe.ingredients.map(i => i.name)].join(' ')).includes(q))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.number - a.number);
}
export function scaledQuantity(item, base, target) {
  int(base, 1, 100, 'Convives de référence'); int(target, 1, 100, 'Convives');
  return item.quantity === null ? null : item.quantity * target / base;
}
export function displayQuantity(quantity) {
  return quantity === null ? 'À préciser' : quantity > 0 && quantity < 0.005 ? '< 0,01' : new Intl.NumberFormat('fr-FR', {maximumFractionDigits: 2}).format(quantity);
}
export function exclusions(recipe, settings) {
  const alerts = [];
  for (const item of recipe.ingredients) {
    const name = normalize(item.name).replace(/pommes?\s+de\s+terre/g, '');
    if (settings.apple && /\bpommes?\b|\bcidre\b|\bcalvados\b/.test(name)) alerts.push(`${item.name} : vérifier l’allergie à la pomme (fruit).`);
    if (settings.oats && /flocons?\s+(?:d['’ ]|de\s+)?avoine/.test(name)) alerts.push(`${item.name} : mauvaise tolérance déclarée aux flocons d’avoine.`);
  }
  return alerts;
}
export function mergeNotebooks(current, incoming) {
  validateNotebook(current); validateNotebook(incoming);
  const next = structuredClone(current), same = new Map(current.recipes.map(r => [r.id, r]));
  for (const recipe of incoming.recipes) {
    const previous = same.get(recipe.id);
    if (previous) {
      if (JSON.stringify({...previous, number: 0}) !== JSON.stringify({...recipe, number: 0})) fail(`Conflit sur « ${recipe.title} ». La fusion est annulée ; aucun carnet n’est modifié.`);
      if (recipe.photoId) {
        // Byte-level equality is checked by the backup service before committing.
        const a = current.photos.find(p => p.id === recipe.photoId), b = incoming.photos.find(p => p.id === recipe.photoId);
        if (a.blob.type !== b.blob.type || a.blob.size !== b.blob.size) fail(`Conflit de photo sur « ${recipe.title} ».`);
      }
      continue;
    }
    const added = structuredClone(recipe); added.number = Math.max(0, ...next.recipes.map(r => r.number)) + 1;
    if (added.photoId) {
      const photo = structuredClone(incoming.photos.find(p => p.id === added.photoId));
      if (next.photos.some(p => p.id === photo.id)) fail('Conflit d’identifiant de photo.');
      next.photos.push(photo);
    }
    next.recipes.push(added); same.set(added.id, added);
  }
  for (const key of ['plants','observations','harvests','reserves','preparations','menus']) next[key] = mergeRecords(current[key], incoming[key]);
  next.shopping = {generated: mergeRecords(current.shopping.generated, incoming.shopping.generated), personal: mergeRecords(current.shopping.personal, incoming.shopping.personal)};
  next.favoriteIds = [...new Set([...current.favoriteIds,...incoming.favoriteIds])];
  next.bookmarkedId ??= incoming.bookmarkedId;
  if (current.cooking && incoming.cooking && JSON.stringify(current.cooking)!==JSON.stringify(incoming.cooking)) fail('Deux préparations en cours différentes : la fusion est annulée.');
  next.cooking ??= incoming.cooking;
  return validateNotebook(next);
}
function mergeRecords(current,incoming) {
  const records = new Map(current.map(row=>[row.id,row]));
  for(const row of incoming){if(records.has(row.id)&&JSON.stringify(records.get(row.id))!==JSON.stringify(row))fail('Conflit de données personnelles : fusion annulée.');records.set(row.id,row);}
  return structuredClone([...records.values()]);
}
function validateExtensions(book) {
  if(typeof book.settings.sound!=='boolean'||typeof book.settings.keepAwake!=='boolean')fail('Réglages de cuisine invalides.');
  if(!Array.isArray(book.favoriteIds)||book.favoriteIds.length>1000||new Set(book.favoriteIds).size!==book.favoriteIds.length)fail('Favoris invalides.');
  const recipeIds=new Set(book.recipes.map(r=>r.id));
  book.favoriteIds.forEach(value=>{identifier(value);if(!recipeIds.has(value))fail('Un favori ne correspond à aucune recette.');});
  if(book.bookmarkedId!==null&&!recipeIds.has(book.bookmarkedId))fail('Recette marquée introuvable.');
  function rows(key,list,max=5000){if(!Array.isArray(list)||list.length>max)fail(`${key} invalide.`);const seen=new Set();for(const row of list){if(!plain(row))fail(`${key} invalide.`);identifier(row.id);if(seen.has(row.id))fail(`${key} dupliqué.`);seen.add(row.id);if(row.notes!==undefined)str(row.notes,12000,'Notes');}return list;}
  function quantity(value,positive=false){if(value!==null&&!(typeof value==='number'&&Number.isFinite(value)&&value>=(positive?0.00000001:0)&&value<=1000000))fail('Quantité invalide.');}
  function day(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+'T12:00:00Z'))||new Date(value+'T12:00:00Z').toISOString().slice(0,10)!==value)fail('Date du carnet invalide.');}
  for(const plant of rows('Plantes',book.plants,1000)){str(plant.name,160,'Nom de plante',false);str(plant.kind,80,'Type de plante');enumValue(plant.space,['Pot','Jardinière','Jardin'],'Installation');str(plant.location,300,'Emplacement');str(plant.source,1500,'Source de jardinage');}
  const plantIds=new Set(book.plants.map(p=>p.id));
  for(const observation of rows('Observations',book.observations)){if(!plantIds.has(observation.plantId))fail('Plante d’observation introuvable.');str(observation.text,4000,'Observation',false);day(observation.date);}
  for(const harvest of rows('Récoltes',book.harvests)){if(!plantIds.has(harvest.plantId))fail('Plante de récolte introuvable.');quantity(harvest.quantity,true);if(harvest.quantity===null)fail('Quantité de récolte requise.');str(harvest.unit,40,'Unité',false);day(harvest.date);}
  for(const reserve of rows('Réserves',book.reserves)){str(reserve.name,200,'Réserve',false);quantity(reserve.quantity);str(reserve.unit,40,'Unité',false);str(reserve.state,80,'État');str(reserve.lot,100,'Lot');day(reserve.date);if(reserve.harvestId!==null&&!book.harvests.some(h=>h.id===reserve.harvestId))fail('Récolte de réserve introuvable.');}
  if(new Set(book.reserves.filter(r=>r.harvestId).map(r=>r.harvestId)).size!==book.reserves.filter(r=>r.harvestId).length)fail('Une récolte est déjà enregistrée dans les réserves.');
  for(const preparation of rows('Préparations',book.preparations,1000)){str(preparation.name,200,'Préparation',false);str(preparation.source,1500,'Source');str(preparation.method,8000,'Méthode');str(preparation.storage,1500,'Stockage');str(preparation.lot,100,'Lot');if(preparation.status!=='undocumented')fail('Un procédé ne peut pas être déclaré vérifié dans cette version.');if(!Array.isArray(preparation.ingredients)||preparation.ingredients.length>150)fail('Ingrédients de préparation invalides.');for(const i of preparation.ingredients){str(i.name,200,'Ingrédient',false);quantity(i.quantity);str(i.unit,40,'Unité',false);}}
  const slots=new Set();
  for(const menu of rows('Menus',book.menus)){day(menu.date);enumValue(menu.slot,['Midi','Soir'],'Repas');int(menu.servings,1,100,'Convives');identifier(menu.recipeId);if(!recipeIds.has(menu.recipeId))fail('Recette de menu introuvable.');validateRecipe(menu.snapshot);if(menu.snapshot.id!==menu.recipeId)fail('Version de menu incohérente.');const slot=menu.date+menu.slot;if(slots.has(slot))fail('Deux menus occupent le même repas.');slots.add(slot);}
  if(!plain(book.shopping))fail('Courses invalides.');
  for(const row of [...rows('Courses',book.shopping.generated),...rows('Articles personnels',book.shopping.personal)]){str(row.name,200,'Article',false);str(row.unit,40,'Unité',false);quantity(row.quantity);if(typeof row.bought!=='boolean'||typeof row.atHome!=='boolean')fail('État des courses invalide.');if(row.key!==undefined)str(row.key,1000,'Clé de courses');}
  if(book.cooking!==null){const c=book.cooking;if(!plain(c))fail('Préparation en cours invalide.');validateRecipe(c.snapshot);int(c.servings,1,100,'Convives');int(c.stepIndex,0,Math.max(0,c.snapshot.steps.length-1),'Étape');if(!Array.isArray(c.completed)||c.completed.some(n=>!Number.isInteger(n)||n<0||n>=c.snapshot.steps.length))fail('Progression de cuisine invalide.');const t=c.timer;if(!plain(t)||typeof t.running!=='boolean'||!Number.isFinite(t.durationMs)||t.durationMs<1000||t.durationMs>86400000||!Number.isFinite(t.remainingMs)||t.remainingMs<0||t.remainingMs>86400000||!(t.endAt===null||Number.isFinite(t.endAt))||(t.running&&t.endAt===null))fail('Minuteur invalide.');str(t.name,120,'Nom du minuteur');}
}
