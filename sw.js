// Application resources only. Personal data stays in IndexedDB.
const scope=new URL(self.registration.scope);
const CACHE_PREFIX='carnet-shell:'+encodeURIComponent(scope.pathname)+':';
const CACHE=CACHE_PREFIX+'0.7.2';
const SHELL=[
  "./index.html",
  "./manifest.webmanifest",
  "./styles.css?v=0.7.2",
  "./src/additional-catalogue-data.js?v=0.7.2",
  "./src/app.js?v=0.7.2",
  "./src/backup.js?v=0.7.2",
  "./src/catalogue-data.js?v=0.7.2",
  "./src/catalogue.js?v=0.7.2",
  "./src/domain.js?v=0.7.2",
  "./src/examples.js?v=0.7.2",
  "./src/garden-pantry-data.js?v=0.7.2",
  "./src/garden-pantry-ui.js?v=0.7.2",
  "./src/garden-pantry.js?v=0.7.2",
  "./src/metric.js?v=0.7.2",
  "./src/offline.js?v=0.7.2",
  "./src/page-turn.js?v=0.7.2",
  "./src/photos.js?v=0.7.2",
  "./src/retro-timer.js?v=0.7.2",
  "./src/secrets.js?v=0.7.2",
  "./src/storage.js?v=0.7.2",
  "./src/visual.js?v=0.7.2",
  "./src/workflows.js?v=0.7.2",
  "./assets/atelier/basil.webp",
  "./assets/atelier/basket.webp",
  "./assets/atelier/carrots.webp",
  "./assets/atelier/copper.webp",
  "./assets/atelier/cover-bottom.webp",
  "./assets/atelier/cover-left.webp",
  "./assets/atelier/cover-right.webp",
  "./assets/atelier/cover-foot.webp",
  "./assets/atelier/cover-top.webp",
  "./assets/atelier/dish.webp",
  "./assets/atelier/floral.webp",
  "./assets/atelier/flower-purple.webp",
  "./assets/atelier/flower-red.webp",
  "./assets/atelier/jam.webp",
  "./assets/atelier/jar-jam.webp",
  "./assets/atelier/jar-pears.webp",
  "./assets/atelier/jar-pickles.webp",
  "./assets/atelier/leeks.webp",
  "./assets/atelier/market.webp",
  "./assets/atelier/menus.webp",
  "./assets/atelier/mushrooms.webp",
  "./assets/atelier/pantry.webp",
  "./assets/atelier/pot.webp",
  "./assets/atelier/pumpkin.webp",
  "./assets/atelier/secrets.webp",
  "./assets/atelier/shallot.webp",
  "./assets/atelier/strawberries.webp",
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
    try{const cache=await caches.open(CACHE);await cache.addAll(SHELL.map(path=>new Request(new URL(path,scope).href,{cache:'reload'})));}
    catch(error){await caches.delete(CACHE);throw error;}
  })());
  // Keep open notebooks stable; activation is automatic after tabs close, or explicit through the update button.
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

self.addEventListener('message',event=>{
  if(event.data?.type==='ACTIVATE_CARNET_UPDATE')event.waitUntil(self.skipWaiting());
});
