import {id,validateNotebook} from './domain.js?v=0.7.3';
export function blankSecret(){return {id:id(),title:'',recipeReference:'',waterMl:null,sugarG:null,perfumes:'',preparationNotes:'',date:'',lot:'',trials:'',tips:'',source:''};}
export function saveSecret(book,secret){
 const next=structuredClone(book);next.secrets??=[];
 const index=next.secrets.findIndex(s=>s.id===secret.id);
 if(index<0)next.secrets.push(structuredClone(secret));else next.secrets[index]=structuredClone(secret);
 return validateNotebook(next);
}
