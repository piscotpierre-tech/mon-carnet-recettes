import {test} from 'node:test';
import assert from 'node:assert/strict';
import {capturePageTurn,playPageTurn} from '../src/page-turn.js';
test('les mises à jour dans la même page et la réduction des animations ne créent aucune feuille',()=>{
  globalThis.matchMedia=()=>({matches:false});
  assert.equal(capturePageTurn({querySelector(){throw Error('pas de capture nécessaire');}},'#cuisine','#cuisine'),null);
  globalThis.matchMedia=()=>({matches:true});
  assert.equal(capturePageTurn({querySelector(){return {};}},'#accueil','#sommaire'),null);
  playPageTurn(null);
});
test('la feuille ne conserve pas les identifiants interactifs, mais garde les masques des illustrations',()=>{
  globalThis.matchMedia=()=>({matches:false});globalThis.window={scrollY:720};
  const removed=[];
  const ids=[{namespaceURI:'http://www.w3.org/1999/xhtml',removeAttribute(name){removed.push('timer:'+name);}},{namespaceURI:'http://www.w3.org/2000/svg',removeAttribute(){throw Error('masque détruit');}}];
  const snapshot={querySelectorAll(){return ids;},removeAttribute(){},setAttribute(name,value){this[name]=value;}};
  const main={querySelector(){return {getBoundingClientRect(){return {left:6,top:-700,width:378};},cloneNode(){return snapshot;}};}};
  const result=capturePageTurn(main,'#cuisine','#sommaire');
  assert.deepEqual(removed,['timer:id']);assert.equal(result.snapshot.inert,true);assert.equal(result.snapshot['aria-hidden'],'true');assert.equal(result.back,true);assert.equal(result.scrollY,720);
});
