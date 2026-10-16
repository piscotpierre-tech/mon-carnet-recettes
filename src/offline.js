export function offlineMessage(state){
  return ({preparing:'Préparation du carnet pour une prochaine ouverture sans réseau…',
    ready:'Le carnet est prêt pour une ouverture sans réseau sur cet appareil. Les liens extérieurs demandent une connexion.',
    update:'Une nouvelle version est prête. Fermez tous les onglets du carnet puis rouvrez-le pour terminer la mise à jour.',
    unavailable:'Le carnet hors ligne n’est pas disponible dans ce navigateur. Une connexion reste nécessaire pour le rouvrir.',
    failed:'La préparation hors ligne n’a pas abouti. Rouvrez le carnet avec une connexion pour réessayer.'})[state];
}

export async function startOffline(onState,{navigator=globalThis.navigator}={}){
  if(!navigator?.serviceWorker){onState('unavailable');return;}
  onState('preparing');
  try{
    // Resolve relative to this module, including on a GitHub Pages subpath.
    const registration=await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url),{updateViaCache:'none'});
    const updateState=()=>onState(registration.waiting?'update':'ready');
    const observe=()=>{
      const worker=registration.installing;
      worker?.addEventListener('statechange',()=>{
        if(worker.state==='installed'&&registration.waiting)onState('update');
        if(worker.state==='redundant'&&!registration.active)onState('failed');
      });
    };
    registration.addEventListener('updatefound',observe);observe();
    await navigator.serviceWorker.ready;
    updateState();
  }catch{onState('failed');}
}

export async function activateOfflineUpdate({navigator=globalThis.navigator}={}){
 const registration=await navigator?.serviceWorker?.getRegistration(new URL('../',import.meta.url));
 if(!registration?.waiting)return false;
 registration.waiting.postMessage({type:'ACTIVATE_CARNET_UPDATE'});
 return true;
}
