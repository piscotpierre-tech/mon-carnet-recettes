import {blankRecipe,emptyNotebook,validateNotebook} from './domain.js?v=0.7.2';
const item=(name,quantity,unit,state,component)=>({id:crypto.randomUUID(),name,quantity,unit,state,component});
export function exampleNotebook(){
  const book=emptyNotebook(),now=new Date().toISOString();
  const cab={...blankRecipe(),id:'example-cabillaud',number:1,title:'Cabillaud vapeur, poireaux fondants et lentilles vertes',servings:2,origin:'Exemple visible dans les maquettes de Pierre. À tester en cuisine.',notes:'Un filet de jus de citron en fin de cuisson. Cuissons à vérifier lors de l’essai.',material:'Casserole · sauteuse · vapeur · balance',prepMinutes:15,cookMinutes:30,art:'dish',isExample:true,
    ingredients:[item('Cabillaud',300,'g','cru','Préparation principale'),item('Lentilles vertes',120,'g','sec','Garniture'),item('Poireaux',500,'g','cru, nettoyé','Garniture'),item('Échalote',40,'g','cru','Garniture'),item('Huile d’olive',10,'g','non précisé','Garniture'),item('Beurre',10,'g','non précisé','Sauce'),item('Jus de citron',20,'g','non précisé','Sauce')],
    steps:['Laver et émincer les poireaux.','Faire fondre les poireaux. À feu doux, remuer et surveiller.','Préparer les lentilles selon leur mode de cuisson documenté.','Cuire le cabillaud selon une consigne vérifiée lors de l’essai, puis dresser l’assiette.'],createdAt:now,updatedAt:now};
  cab.stepIngredients=[[cab.ingredients[2].id],[2,3,4].map(i=>cab.ingredients[i].id),[cab.ingredients[1].id],[0,5,6].map(i=>cab.ingredients[i].id)];
  const chicken={...blankRecipe(),id:'example-poulet',number:4,title:'Poulet rôti au thym',art:'chicken',isExample:true,origin:'Exemple de maquette : ingrédients, étapes et cuissons à compléter.',ingredients:[item('Poulet',null,'g','cru','Préparation principale'),item('Thym',null,'g','non précisé','Finition')],steps:[]};
  const tart={...blankRecipe(),id:'example-tarte',number:12,title:'Tarte aux poireaux',art:'tart',isExample:true,origin:'Exemple de maquette : à rédiger et à tester.',ingredients:[item('Poireaux',null,'g','cru, nettoyé','Garniture')],steps:[]};
  book.recipes=[cab,chicken,tart];book.bookmarkedId=cab.id;
  book.plants=[{id:'example-basilic',name:'Mon basilic en pot',kind:'basilic',space:'Pot',location:'Emplacement à noter',source:'',notes:'Exemple à adapter à mon installation.'},{id:'example-fraisier',name:'Mon fraisier',kind:'fraisier',space:'Pot',location:'Emplacement à noter',source:'',notes:'Exemple à adapter à mon installation.'}];
  book.preparations=[{id:'example-confiture',name:'Confiture de fraises',status:'undocumented',source:'',method:'',storage:'',lot:'',notes:'Brouillon de la maquette. Ne fournit pas un procédé de conservation.',ingredients:[{name:'Fraises',quantity:500,unit:'g'},{name:'Sucre',quantity:null,unit:'g'},{name:'Jus de citron',quantity:null,unit:'g'}]}];
  return validateNotebook(book);
}
