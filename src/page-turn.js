// Navigation only: forms, saved data and timer updates never trigger a turn.
// The snapshot is inert and absent from the accessibility tree.
let activeTurn;
export function capturePageTurn(main,from,to){
  activeTurn?.();
  if(from===to||!main.querySelector?.('.page')||
    typeof matchMedia!=='function'||matchMedia('(prefers-reduced-motion: reduce)').matches)return null;
  const page=main.querySelector('.page'),rect=page.getBoundingClientRect();
  const snapshot=page.cloneNode(true);
  snapshot.querySelectorAll('[id]').forEach(el=>{if(el.namespaceURI!=='http://www.w3.org/2000/svg')el.removeAttribute('id');});
  snapshot.removeAttribute('id');snapshot.setAttribute('aria-hidden','true');snapshot.inert=true;
  return {snapshot,rect,back:to==='#accueil'||to==='#sommaire'&&from!=='#accueil',scrollY:window.scrollY};
}
export function playPageTurn(capture){
  if(!capture)return;
  const {snapshot,rect,back,scrollY}=capture;
  const layer=document.createElement('div');
  layer.className=`page-turn ${back?'turn-back':'turn-forward'}`;
  layer.setAttribute('aria-hidden','true');layer.inert=true;
  layer.style.setProperty('--turn-left',`${rect.left}px`);
  layer.style.setProperty('--turn-width',`${rect.width}px`);
  layer.style.setProperty('--snapshot-offset',`${rect.top}px`);
  const sheet=document.createElement('div');sheet.className='turn-sheet';
  const front=document.createElement('div');front.className='turn-front';front.append(snapshot);
  const verso=document.createElement('div');verso.className='turn-verso';
  sheet.append(front,verso);layer.append(sheet);document.body.append(layer);
  // A fallback clears the layer even if animationend is not delivered.
  let timeout;const cleanup=()=>{clearTimeout(timeout);layer.remove();if(activeTurn===cleanup)activeTurn=null;};
  activeTurn=cleanup;sheet.addEventListener('animationend',cleanup,{once:true});
  timeout=setTimeout(cleanup,1000);
  if(scrollY)window.scrollTo({top:0,behavior:'instant'});
}
