// Application resources only. Personal data stays in IndexedDB.
const scope=new URL(self.registration.scope);
const CACHE_PREFIX='carnet-shell:'+encodeURIComponent(scope.pathname)+':';
const CACHE=CACHE_PREFIX+'0.6.4';
const SHELL=[
  "./index.html",
  "./manifest.webmanifest",
  "./styles.css?v=0.6.4",
  "./src/additional-catalogue-data.js?v=0.6.4",
  "./src/app.js?v=0.6.4",
  "./src/backup.js?v=0.6.4",
  "./src/catalogue-data.js?v=0.6.4",
  "./src/catalogue.js?v=0.6.4",
  "./src/domain.js?v=0.6.4",
  "./src/examples.js?v=0.6.4",
  "./src/garden-pantry-data.js?v=0.6.4",
  "./src/garden-pantry-ui.js?v=0.6.4",
  "./src/garden-pantry.js?v=0.6.4",
  "./src/metric.js?v=0.6.4",
  "./src/offline.js?v=0.6.4",
  "./src/page-turn.js?v=0.6.4",
  "./src/photos.js?v=0.6.4",
  "./src/retro-timer.js?v=0.6.4",
  "./src/storage.js?v=0.6.4",
  "./src/visual.js?v=0.6.4",
  "./src/workflows.js?v=0.6.4",
  "./assets/cahier-original.webp",
  "./assets/carnet-manuscrit.woff",
  "./assets/reference-core.webp",
  "./assets/reference-garden.webp",
  "./assets/reference-pantry.webp",
  "./assets/reference-planning.webp",
  "./assets/sommaire-original.webp",
  "./assets/tools-a.webp",
  "./assets/tools-b.webp",
  "./assets/tools-c.webp"
];
const shellURLs=new Set(SHELL.map(path=>new URL(path,scope).href));
self.addEventListener('install',event=>{
  // A partial download must never replace the last complete release.
  event.waitUntil((async()=>{
    try{const cache=await caches.open(CACHE);await cache.addAll(SHELL.map(path=>new URL(path,scope).href));}
    catch(error){await caches.delete(CACHE);throw error;}
  })());
  // No skipWaiting: an update starts after all old carnet tabs are closed.
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==CACHE).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  const request=event.request,url=new URL(request.url);
  if(request.method!=='GET'||url.origin!==scope.origin)return;
  const navigation=request.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===scope.pathname+'index.html');
  if(!navigation&&!shellURLs.has(url.href))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(navigation?new URL('./index.html',scope).href:request);
    return cached??fetch(request);
  })());
});
