export const artwork={
 chapterMarket:['sommaire-original',748,1536,32,273,235,170],chapterGarden:['sommaire-original',748,1536,34,461,232,175],chapterRecipes:['sommaire-original',748,1536,33,660,233,166],chapterShopping:['sommaire-original',748,1536,32,841,237,184],chapterPantry:['sommaire-original',748,1536,31,1039,237,187],rosemaryMarker:['sommaire-original',748,1536,644,1180,102,325],
  basin:['tools-a',1465,1536,10,115,530,330],waffle:['tools-a',1465,1536,545,20,515,485],gravy:['tools-a',1465,1536,984,145,460,300],pepper:['tools-a',1465,1536,105,462,250,530],grater:['tools-a',1465,1536,490,480,350,520],mandoline:['tools-a',1465,1536,930,490,500,515],citrus:['tools-a',1465,1536,15,1040,510,350],nutcracker:['tools-a',1465,1536,510,1010,430,440],knife:['tools-a',1465,1536,925,991,525,470],
  grinder:['tools-b',1465,1536,40,0,450,490],kettle:['tools-b',1465,1536,530,20,430,470],copper:['tools-b',1465,1536,950,105,500,375],mortar:['tools-b',1465,1536,65,490,400,490],masher:['tools-b',1465,1536,505,486,435,510],mincer:['tools-b',1465,1536,980,493,470,510],sieve:['tools-b',1465,1536,25,1010,460,430],mold:['tools-b',1465,1536,496,1030,485,390],skimmer:['tools-b',1465,1536,1000,1000,450,470],
  churn:['tools-c',1465,1536,115,10,355,485],ladle:['tools-c',1465,1536,525,20,440,470],madeleine:['tools-c',1465,1536,925,90,525,415],board:['tools-c',1465,1536,20,520,490,465],cakeSlice:['tools-c',1465,1536,530,495,445,480],funnel:['tools-c',1465,1536,985,560,470,390],basket:['tools-c',1465,1536,45,1010,540,420],tin:['tools-c',1465,1536,620,947,350,500],bottle:['tools-c',1465,1536,1090,948,260,520],
  shoppingNote:['reference-core',1536,768,435,455,120,84],spoonHerbs:['reference-core',1536,768,35,687,88,47],
  cocotte:['reference-core',1536,768,143,324,152,78],dish:['reference-core',1536,768,793,240,194,85],timer:['reference-core',1536,768,1176,476,184,184],bowl:['reference-core',1536,768,115,113,77,49],carrots:['reference-garden',1536,768,36,244,116,86],pumpkin:['reference-garden',1536,768,32,331,119,82],mushrooms:['reference-garden',1536,768,32,418,118,82],basil:['reference-garden',1536,768,800,216,114,133],strawberry:['reference-garden',1536,768,970,252,128,95],herbs:['reference-garden',1536,768,1190,545,72,59],marketBasket:['reference-garden',1536,768,33,550,150,78],watering:['reference-garden',1536,768,906,234,76,117],jar:['reference-pantry',1536,1024,55,607,96,107],berries:['reference-pantry',1536,1024,48,536,130,68],leek:['reference-core',1536,768,1179,324,76,44],chicken:['reference-planning',1536,768,83,430,98,40],tart:['reference-planning',1536,768,83,485,98,38]
};
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assetPath=file=>globalThis.CDR_ASSETS?.[file]??`./assets/${file}.webp`;
const atelier={cocotte:'pot',chapterRecipes:'pot',chapterMarket:'market',chapterGarden:'basil',chapterShopping:'basket',chapterPantry:'jam',chapterMenus:'menus',carrots:'carrots',pumpkin:'pumpkin',mushrooms:'mushrooms',basil:'basil',strawberry:'strawberries',marketBasket:'basket',jar:'jar-pears',jam:'jar-jam',pickles:'jar-pickles',berries:'strawberries',dish:'dish',leek:'leeks',shallot:'shallot',pantryStill:'pantry',secretsStill:'secrets',copper:'copper'};
let artId=0;
export function art(name,classes=''){
 if(atelier[name])return `<img class="art atelier-art ${classes}" src="./assets/atelier/${atelier[name]}.webp" alt="" aria-hidden="true" draggable="false">`;
 const [file,w,h,x,y,cw,ch]=artwork[name]??artwork.cocotte,id='art-window-'+(++artId);
 const shape=name==='cocotte'?'<path d="M162 349C161 337 177 332 196 331L196 326Q205 321 215 326L215 331C236 332 251 338 251 347L262 350Q279 351 279 356Q278 365 261 366L258 388Q213 405 167 389L161 366Q147 366 144 358Q142 351 161 351Z"/>':name==='rosemaryMarker'?'<path d="M694 1183L710 1184L714 1211L735 1194L742 1204L726 1234L744 1224L746 1241L732 1262L745 1251L745 1270L730 1288L741 1286L738 1307L722 1330L721 1362L706 1396L700 1432L679 1503L665 1503L675 1451L649 1440L645 1405L648 1375L650 1357L665 1347L662 1325L653 1310L647 1283L651 1269L669 1299L664 1269L660 1246L670 1243L678 1272L674 1232L680 1225L687 1262L692 1221Z"/>':`<rect x="${x}" y="${y}" width="${cw}" height="${ch}"/>`;
 return `<svg class="art ${classes}" viewBox="${x} ${y} ${cw} ${ch}" style="aspect-ratio:${cw}/${ch}" aria-hidden="true" focusable="false"><defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse">${shape}</clipPath></defs><image href="${assetPath(file)}" width="${w}" height="${h}" clip-path="url(#${id})"/></svg>`;
}
// Broad, varied areas from the supplied illustrations, never a repeated flower.
// These windows contain decoration only; labels and controls are live HTML.
let ornamentId=0;
export function flowers(){return `<span class="flowers atelier-flowers" aria-hidden="true"></span>`;}
export function coverDecor(){return `<div class="cover-decoration" aria-hidden="true"><img class="cover-top" src="./assets/atelier/cover-top.webp" alt=""><img class="cover-bottom" src="./assets/atelier/cover-bottom.webp" alt=""></div>`;}
const traces={
 wine:`<path d="M15 48c-9-6-20 6-15 14s19 5 18-3S18 51 15 48ZM8 90c-12-5-11 18-1 21s17-11 12-15Z"/><circle cx="26" cy="79" r="3"/><circle cx="4" cy="134" r="5"/><circle cx="20" cy="148" r="2"/>`,
 coffee:`<path d="M8 68C-18 28 31-8 62 15S91 64 59 85M14 69C-10 37 27 3 55 19S81 62 58 79" fill="none" stroke="currentColor" stroke-width="3"/><path d="m42 12 3 5m12 66 1 5" fill="none" stroke="currentColor"/>`,
 grease:`<path d="M5 36c22-26 51-13 43 10S6 74 0 59Z"/><ellipse cx="12" cy="105" rx="20" ry="12" transform="rotate(-25 12 105)"/>`,
 flour:`<path d="M5 42Q36 15 61 44T80 70Q57 98 10 73Z" fill="#fff"/><path d="M0 84 60 40M3 94 70 50" stroke="#d7c3a0" stroke-width="2"/><g fill="#fff">${Array.from({length:24},(_,i)=>`<circle cx="${(i*23)%90}" cy="${(i*37)%150}" r="${i%3+1}"/>`).join('')}</g>`,
 soil:`<path d="M6 90q20-7 32 6t-11 7Z"/><circle cx="12" cy="120" r="3"/><circle cx="27" cy="113" r="2"/><circle cx="6" cy="139" r="1"/><path d="M8 12q13-9 24 1t-4 14Z" opacity=".4"/>`
};
export function patina(kind='recipe'){
 const map={cover:['grease'],contents:['wine','grease'],recipe:['wine','grease'],kitchen:['grease','wine'],market:['coffee','grease'],garden:['soil','grease'],pantry:['grease','wine'],secrets:['flour','grease']};
 return `<div class="patina patina-${kind}" aria-hidden="true">${(map[kind]??map.recipe).map((name,i)=>`<svg class="trace trace-${name} trace-${i}" viewBox="0 0 90 160" focusable="false">${traces[name]}</svg>`).join('')}<span class="paper-crease"></span>${kind==='secrets'?'<span class="paper-repair"></span>':''}</div>`;
}
export const banner=(title,small=false)=>`<div class="floral-banner ${small?'small':''}">${flowers(title)}<${small?'h2':'div'} class="cartouche">${esc(title)}</${small?'h2':'div'}></div>`;
export function heading(title,annotation=''){return `<h1>${esc(title)}</h1>${annotation?`<p class="hand">${esc(annotation)}</p>`:''}`;}
export function section(title,body,illustration=''){return `<section class="section">${banner(title,true)}${illustration?`<div class="section-art">${art(illustration)}</div>`:''}${body}</section>`;}
export const action=(label,href,primary=false)=>`<a class="button ${primary?'primary':''}" href="${esc(href)}">${esc(label)} <span aria-hidden="true">→</span></a>`;
export function tools(names){return `<div class="tool-strip" aria-hidden="true">${names.map(name=>art(name)).join('')}</div>`;}
export function frame(label,content,{variant='',toolNames=[]}={}){
 const kind=variant.includes('cover ')?'cover':label==='SOMMAIRE'?'contents':label.includes('MARCHÉ')||label.includes('COURSES')?'market':label.includes('JARDIN')?'garden':label.includes('GARDE-MANGER')?'pantry':label==='MES SECRETS'?'secrets':label.includes('TABLIERS')?'kitchen':'recipe';
 return `<article class="page ${variant} leaf-${kind}" data-screen="${esc(label)}"><div class="paper-texture" aria-hidden="true"></div>${patina(kind)}<div class="binding" aria-hidden="true"></div><div class="page-content">${banner(label)}<div class="page-body">${content}${toolNames.length?tools(toolNames):''}</div><footer><nav aria-label="Navigation du carnet"><a href="#accueil" aria-label="Couverture du carnet">Couverture</a><a href="#sommaire">Sommaire</a><a href="#recettes">Mes recettes</a></nav><span class="folio" aria-hidden="true">${({cover:'',contents:'1',recipe:'12',kitchen:'13',market:'24',garden:'25',pantry:'38',secrets:'39'})[kind]}</span></footer></div><span class="fold" aria-hidden="true"></span></article>`;
}
