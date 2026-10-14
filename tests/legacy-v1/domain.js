export const APP = 'mon-carnet-recettes';
export const APP_VERSION = '0.1.0';
export const SCHEMA_VERSION = 1;
export const LIMITS = Object.freeze({recipes: 1000, photoBytes: 2 * 1024 * 1024, allPhotosBytes: 30 * 1024 * 1024, backupBytes: 45 * 1024 * 1024});
export const CATEGORIES = ['Assiettes et plats', 'Entrées', 'Desserts', 'Garnitures', 'Sauces et bases'];
export const UNITS = ['g', 'kg', 'ml', 'cl', 'l', 'pièce', 'c. à soupe', 'c. à café', 'pincée', 'à ajuster'];
export const STATES = ['non précisé', 'cru', 'cuit', 'sec', 'égoutté'];
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
  return {schemaVersion: SCHEMA_VERSION, revision: 0, recipes: [], photos: [], settings: {apple: true, oats: true}};
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
  return validateNotebook(next); // Current personal preferences always remain in a merge.
}
