// Conversions exactes de longueur et de volume. Aucune densité alimentaire supposée.
const n=value=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2}).format(value);
const conversions=new Map([
 ['cup us',[236.5882365,'ml']],['cups us',[236.5882365,'ml']],
 ['pint us',[473.176473,'ml']],['pints us',[473.176473,'ml']],
 ['half-pint us',[236.5882365,'ml']],['half-pints us',[236.5882365,'ml']],
 ['quart us',[946.352946,'ml']],['quarts us',[946.352946,'ml']],
 ['gallon us',[3.785411784,'l']],['gallons us',[3.785411784,'l']],
 ['ft',[0.3048,'m']],['inch',[25.4,'mm']],['inches',[25.4,'mm']],
 ['lb',[0.45359237,'kg']],['lbs',[0.45359237,'kg']],['oz',[28.349523125,'g']],['fl oz us',[29.5735295625,'ml']]
]);
export function metricQuantity(quantity,unit){
 const conversion=conversions.get(String(unit).trim().toLowerCase());
 return conversion?{quantity:quantity===null?null:quantity*conversion[0],unit:conversion[1]}:{quantity,unit};
}
export function fromMetricQuantity(quantity,originalUnit){const c=conversions.get(String(originalUnit).trim().toLowerCase());return c?quantity/c[0]:quantity;}
export function altitudeMeters(lot){return lot.altitudeM!==undefined?lot.altitudeM:lot.altitudeFt==null?null:lot.altitudeFt*0.3048;}
export function metricText(value=''){
 return String(value)
  .replace(/3 à 4 half-pints US/g,'3 à 4 pots Mason de référence de 236,59 ml')
  .replace(/1\/4 inch libre \(6,35 mm\)/g,'6,35 mm libres')
  .replace(/1\/2 inch libre \(12,7 mm\)/g,'12,7 mm libres')
  .replace(/1 gallon US d’eau froide \(environ 3,785 l\)/g,'3,785 l d’eau froide')
  .replace(/40 °F ou moins \(environ 4,4 °C\)/g,'4,4 °C ou moins')
  .replace(/1 001 à 6 000 ft/g,'Plus de 304,8 à 1 828,8 m')
  .replace(/1 001 à 3 000 ft/g,'Plus de 304,8 à 914,4 m')
  .replace(/3 001 à 6 000 ft/g,'Plus de 914,4 à 1 828,8 m')
  .replace(/0 à 1 000 ft/g,'0 à 304,8 m')
  .replace(/(?:Plus de|Au-dessus de) 6 000 ft/g,'Plus de 1 828,8 m')
  .replace(/(\d+(?:[.,]\d+)?(?:[ \u00a0\u202f]\d{3})*)\s*(cups? US|half-pints? US|pints? US|quarts? US|gallons? US|ft|inches|inch|lbs?|fl oz US|oz)\b/gi,(_,number,unit)=>{
   const q=Number(number.replace(/[ \u00a0\u202f]/g,'').replace(',','.')),m=metricQuantity(q,unit);return n(m.quantity)+' '+m.unit;
  })
  .replace(/Pints\s*:/g,'473,18 ml :').replace(/Quarts\s*:/g,'946,35 ml :')
  .replace(/half-pints ou pints US/g,'pots Mason de référence de 236,59 ou 473,18 ml')
  .replace(/pints ou quarts US/g,'pots Mason de référence de 473,18 ou 946,35 ml')
  .replace(/half-pints US/g,'pots Mason de référence de 236,59 ml')
  .replace(/formats US/g,'formats de référence')
  .replace(/half-pints/g,'formats de 236,59 ml').replace(/pints US/g,'formats de 473,18 ml')
  .replace(/quarts US/g,'formats de 946,35 ml')
  .replace(/une cup US/gi,'une mesure graduée de 236,59 ml');
}
export function metricPreparation(input){
 const p=structuredClone(input);
 for(const key of ['name','intro','method','yield','batchNote','tableNote','storage','notes','sourceTitle'])if(typeof p[key]==='string')p[key]=metricText(p[key]);
 p.ingredients=p.ingredients.map(i=>({...i,...metricQuantity(i.quantity,i.unit),name:metricText(i.name)}));
 if(p.table)p.table=p.table.map(row=>row.map(metricText));
 if(p.referenceId==='GM01'&&/Une cup US est une unité|Une cup US est une mesure|Une mesure graduée de 236,59 ml est une mesure/i.test(p.batchNote))p.batchNote='Mesurer séparément 946,35 ml de fraises écrasées et 946,35 ml de sucre dans un récipient gradué. Cette formule se mesure en volume : ne pas remplacer un volume par le même nombre de grammes. Garder la fournée indiquée ; pour davantage de pots, préparer plusieurs fournées séparées. Une autre composition demande sa propre méthode.';
 return p;
}
export function metricCommon(input){
 return {...input,equipment:metricText(input.equipment),compatibility:metricText(input.compatibility),steps:input.steps.map(metricText),storage:metricText(input.storage),caution:metricText(input.caution)};
}
