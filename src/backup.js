import {APP, APP_VERSION, SCHEMA_VERSION, LIMITS, validateNotebook, mergeNotebooks, migrateNotebook} from './domain.js?v=0.6.3';

export async function digest(value) {
  const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
}
function toBase64(bytes) {
  let binary = ''; for (let offset = 0; offset < bytes.length; offset += 16384) binary += String.fromCharCode(...bytes.subarray(offset, offset + 16384));
  return btoa(binary);
}
function fromBase64(value) {
  if (typeof value !== 'string' || value.length > Math.ceil(LIMITS.photoBytes / 3) * 4 || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)) throw new Error('Photo encodée invalide.');
  return Uint8Array.from(atob(value), character => character.charCodeAt(0));
}
export function validImageSignature(bytes, type) {
  const at = (i, text) => text.split('').every((c, offset) => bytes[i + offset] === c.charCodeAt(0));
  return type === 'image/jpeg' ? bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    : type === 'image/png' ? bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((b, i) => bytes[i] === b)
    : type === 'image/webp' ? bytes.length >= 12 && at(0, 'RIFF') && at(8, 'WEBP') : false;
}
export async function makeBackup(book) {
  validateNotebook(book);
  const photos = await Promise.all(book.photos.map(async photo => ({id: photo.id, name: photo.name, type: photo.blob.type, data: toBase64(new Uint8Array(await photo.blob.arrayBuffer()))})));
  const payload = {...book, schemaVersion: SCHEMA_VERSION, photos};
  const payloadText = JSON.stringify(payload);
  const text = JSON.stringify({app: APP, appVersion: APP_VERSION, formatVersion: 2, exportedAt: new Date().toISOString(), sha256: await digest(payloadText), payload}, null, 2);
  if (new Blob([text]).size > LIMITS.backupBytes) throw new Error('La sauvegarde dépasse la limite de 45 Mo de ce premier lot.');
  return text;
}
export async function readBackup(text) {
  if (typeof text !== 'string' || new Blob([text]).size > LIMITS.backupBytes) throw new Error('La sauvegarde est trop volumineuse (45 Mo maximum).');
  let input; try { input = JSON.parse(text); } catch { throw new Error('Ce fichier n’est pas une sauvegarde JSON valide.'); }
  if (!input || input.app !== APP || !((input.formatVersion===1&&input.payload?.schemaVersion===1)||(input.formatVersion===2&&input.payload?.schemaVersion===2))) throw new Error('Ce format de sauvegarde n’est pas pris en charge. Votre carnet est conservé.');
  if (input.sha256 !== await digest(JSON.stringify(input.payload))) throw new Error('La sauvegarde est altérée ou incomplète. Aucune donnée n’a changé.');
  const payload = input.payload;
  if (!Array.isArray(payload.photos) || payload.photos.length > LIMITS.recipes) throw new Error('Liste de photos invalide.');
  const photos = payload.photos.map(photo => {
    if (!photo || typeof photo !== 'object' || typeof photo.type !== 'string') throw new Error('Une entrée photo de la sauvegarde est invalide.');
    const bytes = fromBase64(photo.data);
    if (!validImageSignature(bytes, photo.type)) throw new Error('Le contenu d’une photo ne correspond pas à son format.');
    return {id: photo.id, name: photo.name, blob: new Blob([bytes], {type: photo.type})};
  });
  const notebook = migrateNotebook({...payload, photos});
  return {notebook, exportedAt: input.exportedAt, appVersion: input.appVersion};
}
export async function prepareMerge(current, incoming) {
  const merged = mergeNotebooks(current, incoming);
  const existingPhotos = new Map(current.photos.map(p => [p.id, p]));
  for (const photo of incoming.photos) {
    const old = existingPhotos.get(photo.id);
    if (old && await digest(await old.blob.arrayBuffer()) !== await digest(await photo.blob.arrayBuffer())) throw new Error('Une photo présente dans les deux carnets diffère. La fusion est annulée.');
  }
  return merged;
}
