import {emptyNotebook, validateNotebook, migrateNotebook} from './domain.js?v=0.2.1';

export class NotebookStore {
  constructor({factory = globalThis.indexedDB, scope = globalThis.location?.pathname.replace(/[^/]*$/, '') ?? '/'} = {}) {
    this.factory = factory; this.name = `mon-carnet-recettes:${scope}`; this.db = null;
  }
  async open() {
    if (this.db) return this;
    if (!this.factory) throw new Error('Le stockage local est indisponible. Essayez dans votre navigateur habituel.');
    this.db = await new Promise((resolve, reject) => {
      const request = this.factory.open(this.name, 1); let failed = false;
      request.onupgradeneeded = () => request.result.createObjectStore('notebooks');
      request.onblocked = () => { failed = true; reject(new Error('Fermez les autres onglets du carnet puis réessayez.')); };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => { if (failed) request.result.close(); else resolve(request.result); };
    });
    this.db.onversionchange = () => { this.db.close(); this.db = null; };
    return this;
  }
  async read(key = 'current') {
    await this.open();
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('notebooks', 'readonly'), request = tx.objectStore('notebooks').get(key);
      let result;
      request.onsuccess = () => { result = request.result; };
      tx.oncomplete = () => { try { resolve(result ? migrateNotebook(result) : key === 'current' ? emptyNotebook() : null); } catch (error) { reject(error); } };
      tx.onabort = () => reject(tx.error ?? new Error('Lecture du carnet interrompue.'));
      tx.onerror = () => {}; // The abort event reports the failure exactly once.
    });
  }
  async commit(next, expectedRevision, {recovery = false} = {}) {
    validateNotebook(next); await this.open();
    return new Promise((resolve, reject) => {
      let reason, saved;
      let tx;
      try { tx = this.db.transaction('notebooks', 'readwrite', {durability: 'strict'}); }
      catch { tx = this.db.transaction('notebooks', 'readwrite'); }
      const store = tx.objectStore('notebooks'), request = store.get('current');
      request.onsuccess = () => {
        try {
          const current = request.result ?? emptyNotebook();
          if (current.revision !== expectedRevision) throw new Error('Le carnet a changé dans un autre onglet. Votre saisie reste affichée. Sauvegardez-la à part, puis rechargez le carnet avant de recommencer.');
          saved = {...next, revision: current.revision + 1}; validateNotebook(saved);
          if (recovery) store.put(current, 'before-import');
          store.put(saved, 'current');
        } catch (error) { reason = error; tx.abort(); }
      };
      tx.oncomplete = () => resolve(saved);
      tx.onabort = () => reject(reason ?? tx.error ?? new Error('Enregistrement interrompu.'));
      tx.onerror = () => {};
    });
  }
  close() { this.db?.close(); this.db = null; }
}
export function friendlyStorageError(error) {
  if (error?.name === 'QuotaExceededError') return 'L’espace du navigateur est insuffisant. Votre carnet précédent est conservé. Exportez-le et essayez une photo plus petite.';
  return error?.message || 'Le carnet n’a pas pu être enregistré. Gardez cette page ouverte et réessayez.';
}
