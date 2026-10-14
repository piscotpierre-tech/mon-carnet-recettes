// Test double, not a real browser. Transactions use an isolated copy and commit
// once, in order. This exercises the production adapter's completion/abort paths.
// It does not certify browser IndexedDB, quotas, durability or mobile layout.
export class MemoryIndexedDB {
  constructor() { this.backends = new Map(); this.failNextWrite = false; this.failWriteAfter = null; }
  open(name) {
    const request = {};
    queueMicrotask(() => {
      let backend = this.backends.get(name), fresh = !backend;
      if (fresh) { backend = {records: new Map(), queue: Promise.resolve()}; this.backends.set(name, backend); }
      request.result = new MemoryDatabase(this, backend);
      if (fresh) request.onupgradeneeded?.();
      request.onsuccess?.();
    });
    return request;
  }
}
class MemoryDatabase {
  constructor(factory, backend) { this.factory = factory; this.backend = backend; this.closed = false; }
  createObjectStore() {}
  transaction(name, mode) {
    if (this.closed) throw new Error('Database closed');
    const tx = new MemoryTransaction(this.factory, this.backend, mode);
    this.backend.queue = this.backend.queue.then(() => tx.run());
    return tx;
  }
  close() { this.closed = true; }
}
class MemoryTransaction {
  constructor(factory, backend, mode) { this.factory = factory; this.backend = backend; this.mode = mode; this.operations = []; this.aborted = false; this.error = null; }
  objectStore() {
    return {
      get: key => { const request = {}; this.operations.push(() => {request.result=structuredClone(this.working.get(key));request.onsuccess?.();});return request; },
      put: (value,key) => { this.operations.push(() => {
        if (this.mode !== 'readwrite') throw new Error('Readonly transaction');
        if (this.factory.failNextWrite || this.factory.failWriteAfter === 0) {this.factory.failNextWrite=false;this.factory.failWriteAfter=null;throw new DOMException('No space','QuotaExceededError');}
        if (this.factory.failWriteAfter !== null) this.factory.failWriteAfter--;
        this.working.set(key,structuredClone(value));
      }); return {}; }
    };
  }
  abort() { this.aborted = true; }
  async run() {
    this.working=structuredClone(this.backend.records);
    try {
      for(let i=0;i<this.operations.length && !this.aborted;i++){await Promise.resolve();this.operations[i]();}
    }catch(error){this.error=error;this.aborted=true;this.onerror?.();}
    if(this.aborted) this.onabort?.();
    else {if(this.mode==='readwrite')this.backend.records=this.working;this.oncomplete?.();}
  }
}
