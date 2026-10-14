import {id, LIMITS} from './domain.js?v=0.2.1';
export async function verifyPhotoDecoding(photos) {
  for (const photo of photos) {
    const objectURL = URL.createObjectURL(photo.blob), image = new Image();
    try {
      image.src = objectURL; await image.decode();
      if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 48000000) throw new Error('Dimensions de photo non prises en charge.');
    } catch { throw new Error('Une photo de la sauvegarde ne peut pas être lue. Le carnet actuel est conservé.'); }
    finally { URL.revokeObjectURL(objectURL); }
  }
}
export async function preparePhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Choisissez une photo JPEG, PNG ou WebP. Convertissez d’abord les photos HEIC.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Choisissez une photo de moins de 15 Mo.');
  const url = URL.createObjectURL(file), image = new Image();
  try {
    image.src = url; await image.decode();
    if (image.naturalWidth * image.naturalHeight > 48000000) throw new Error('Cette photo est trop grande. Réduisez-la avant de l’ajouter.');
    const ratio = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio)); canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext('2d'); if (!context) throw new Error('Ce navigateur ne peut pas préparer la photo.');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .82));
    if (!blob || blob.size > LIMITS.photoBytes) throw new Error('La photo reste trop volumineuse. Choisissez une image plus petite.');
    return {id: id(), name: file.name.slice(0, 200), blob};
  } catch (error) {
    if (error instanceof DOMException) throw new Error('Cette photo ne peut pas être lue. Choisissez un autre fichier.');
    throw error;
  } finally { URL.revokeObjectURL(url); }
}
