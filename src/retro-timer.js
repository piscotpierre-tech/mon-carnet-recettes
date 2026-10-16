import {remaining} from './workflows.js?v=0.6.3';
export const minuteAngle=seconds=>Math.min(360,Math.max(0,seconds/10));
export const angularDelta=(before,after)=>((after-before+540)%360)-180;
export const clampSeconds=seconds=>Math.min(3600,Math.max(1,Math.round(seconds/15)*15));
export function pointerAngle(x,y,rect){return (Math.atan2(x-(rect.left+rect.width/2),-(y-(rect.top+rect.height/2)))*180/Math.PI+360)%360;}
const clock=ms=>{const n=Math.ceil(Math.max(0,ms)/1000);return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;};
export function retroTimer(timer){
 const marks=Array.from({length:60},(_,i)=>`<line x1="140" y1="${i%5===0?25:29}" x2="140" y2="${i%5===0?40:36}" transform="rotate(${i*6} 140 140)" stroke="#4e3b24" stroke-width="${i%5===0?2:1}"/>`).join('');
 const digits=Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return `<text x="${140+88*Math.sin(a)}" y="${146-88*Math.cos(a)}" text-anchor="middle" fill="#3a2e20" font-family="Georgia,serif" font-size="18">${i*5}</text>`;}).join('');
 return `<div class="mechanical-timer"><div class="timer-shell"><div class="timer-dial" id="timer-dial" role="slider" tabindex="0" aria-label="Molette du minuteur" aria-describedby="dial-instructions" aria-valuemin="0" aria-valuemax="60" aria-valuenow="${Math.min(60,remaining(timer)/60000)}" aria-valuetext="${clock(remaining(timer))}" aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Home End Enter Space"><svg viewBox="0 0 280 280" aria-hidden="true" focusable="false"><defs><radialGradient id="dial-paper"><stop offset="0" stop-color="#fff3d2"/><stop offset=".8" stop-color="#f4dfb0"/><stop offset="1" stop-color="#c5a16d"/></radialGradient></defs><circle cx="140" cy="140" r="134" fill="#8e101e" stroke="#f3b1a1" stroke-width="2"/><circle cx="140" cy="140" r="126" fill="url(#dial-paper)" stroke="#6e3a20" stroke-width="4"/>${marks}${digits}<circle cx="140" cy="140" r="59" fill="none" stroke="#ac9064" stroke-width="1"/></svg><span class="mechanical-knob" aria-hidden="true" style="--knob-angle:${minuteAngle(remaining(timer)/1000)}deg"><span class="knob-pointer"></span><span class="knob-grip"></span></span></div></div><output class="timer-readout" id="timer-output" aria-label="Temps restant">${clock(remaining(timer))}</output><p class="hand dial-hint" id="dial-instructions">Tournez la molette pour régler.<br>Touchez-la pour lancer ou mettre en pause.</p></div>`;
}
export function updateTimerDial(timer){
 const dial=document.querySelector('#timer-dial');if(!dial?.querySelector||dial.dataset.dragging==='true')return;
 paint(dial,remaining(timer)/1000);
 const d=document.querySelector('#timer-duration');if(d)d.textContent=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(timer.durationMs/60000);
}
function paint(dial,seconds){
 const knob=dial.querySelector('.mechanical-knob');knob?.style.setProperty('--knob-angle',minuteAngle(seconds)+'deg');
 dial.setAttribute('aria-valuenow',String(Math.min(60,seconds/60)));dial.setAttribute('aria-valuetext',clock(seconds*1000));
 const output=document.querySelector('#timer-output');if(output)output.textContent=clock(seconds*1000);
}
export function wireTimerDial({getTimer,onSet,onToggle,isBusy=()=>false}){
 const dial=document.querySelector('#timer-dial');if(!dial?.getBoundingClientRect)return;
 let gesture=null;
 const reset=()=>{gesture=null;dial.dataset.dragging='false';updateTimerDial(getTimer());};
 dial.addEventListener('pointerdown',event=>{
  if(isBusy()||event.isPrimary===false||event.button!==0)return;
  const rect=dial.getBoundingClientRect();gesture={id:event.pointerId,x:event.clientX,y:event.clientY,angle:pointerAngle(event.clientX,event.clientY,rect),seconds:Math.min(3600,remaining(getTimer())/1000),moved:false};
  dial.setPointerCapture(event.pointerId);dial.focus({preventScroll:true});
 });
 dial.addEventListener('pointermove',event=>{
  if(!gesture||gesture.id!==event.pointerId)return;
  if(Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<7&&!gesture.moved)return;
  event.preventDefault();const angle=pointerAngle(event.clientX,event.clientY,dial.getBoundingClientRect());
  gesture.seconds=Math.max(0,Math.min(3600,gesture.seconds+angularDelta(gesture.angle,angle)*10));gesture.angle=angle;gesture.moved=true;dial.dataset.dragging='true';paint(dial,clampSeconds(gesture.seconds));
 });
 dial.addEventListener('pointerup',async event=>{
  if(!gesture||gesture.id!==event.pointerId)return;
  const done=gesture;gesture=null;dial.dataset.dragging='false';if(dial.hasPointerCapture(event.pointerId))dial.releasePointerCapture(event.pointerId);
  if(done.moved)await onSet(clampSeconds(done.seconds));else await onToggle();
  updateTimerDial(getTimer());
 });
 dial.addEventListener('pointercancel',reset);dial.addEventListener('lostpointercapture',()=>{if(gesture)reset();});
 dial.addEventListener('keydown',async event=>{
  if(isBusy())return;
  if(['Enter',' '].includes(event.key)){event.preventDefault();await onToggle();return;}
  const direction={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1}[event.key];
  if(!direction&&!['Home','End'].includes(event.key))return;
  event.preventDefault();const next=event.key==='Home'?1:event.key==='End'?3600:remaining(getTimer())/1000+direction*(event.shiftKey?300:60);
  await onSet(clampSeconds(next));updateTimerDial(getTimer());
 });
}
