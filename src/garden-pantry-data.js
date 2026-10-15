// Contenus du dossier de Pierre, version 1.1. Pas de conversion de fournée.
const N='https://nchfp.uga.edu/';
export const GARDEN_PANTRY_ID='CDR-BOCAUX-JARDIN-V1';
export const GARDEN_GUIDES={
 basilic:{title:'Le basilic en pot',name:'Mon basilic en pot',art:'basil',intro:'Pas besoin d’un grand jardin : on commence avec ce pot-là.',source:'https://www.rhs.org.uk/herbs/basil/grow-your-own',
 advice:[['Bien l’installer','Un coin lumineux, chaud et abrité. Pour un plant dehors, choisir un pot d’au moins 20 cm de largeur et de profondeur, drainé, avec un terreau sans tourbe. Garder le niveau de plantation initial.'],['Un coup d’arrosoir','Garder la terre régulièrement humide, sans laisser baigner les racines. Arroser plutôt le matin, au pied, sans éclabousser les feuilles. Observer la terre avant de décider.'],['La petite cueillette','Prélever régulièrement les extrémités des pousses pour étoffer le plant. Retirer les tiges florales pour continuer à récolter des feuilles.'],['Quand le temps fraîchit','Le basilic aime la chaleur. Dans un emplacement frais, préférer un rebord de fenêtre lumineux ou une serre. Adapter ces conseils au pot et au temps qu’il fait.']],search:'basilic'},
 fraisier:{title:'Un fraisier pour commencer',name:'Mon fraisier',art:'strawberry',intro:'Même trois fraises, c’est une récolte.',source:'https://www.rhs.org.uk/fruit/strawberries/grow-your-own?type=f',
 advice:[['Bien l’installer','Choisir un contenant drainé, du terreau sans tourbe et un coin ensoleillé et abrité. Laisser le collet au niveau de la surface. En jardinière, espacer les plants d’environ 20 cm.'],['Un coup d’arrosoir','Les pots sèchent vite : observer puis arroser selon les besoins, plutôt le matin. Éviter de mouiller les fruits et le cœur du plant.'],['Prendre soin des fruits','Garder les fraises à distance du terreau humide. Protéger les fleurs des gelées annoncées, en tenant compte du stade du plant et de la météo locale.'],['La petite cueillette','Cueillir les fruits pleinement colorés. Noter la variété et son caractère remontant si on les connaît ; laisser les cases vides sinon.']],search:'fraise'}
};
export const COMMON_CANNING={
 equipment:'La référence utilise des pots Mason destinés à la conserve, avec couvercle métallique en deux parties, une marmite couverte munie d’une grille et une pince à bocaux. Suivre la notice des fermetures ; utiliser des couvercles neufs.',
 compatibility:'Ces tableaux concernent les formats US indiqués. Un pot de 250 ou 500 ml, ou un autre système de fermeture, ne reprend pas automatiquement leur traitement. Noter le modèle et consulter une méthode qui couvre tout le matériel utilisé.',
 steps:[
 'Examiner, laver et rincer les pots. Pour un traitement de confiture de moins de 10 min, stériliser les pots vides : 10 min d’ébullition sous 1 000 ft, puis 1 min supplémentaire par tranche additionnelle de 1 000 ft ; consulter la notice complète pour l’altitude choisie.',
 'Pour les remplissages à chaud, préchauffer l’eau de la marmite à environ 82 °C. Placer les pots debout sur la grille. L’eau dépasse les couvercles d’au moins 2,54 cm ; pour un traitement de plus de 30 min, d’au moins 5,08 cm.',
 'Couvrir. Compter la durée du tableau à partir de la reprise de l’ébullition ; maintenir le niveau d’eau et l’ébullition. Si elle s’arrête, recommencer la durée entière après sa reprise.',
 'À la fin, couper le feu et découvrir. Attendre 5 min, sortir les pots debout, puis les laisser refroidir sans les déranger 12 à 24 h. Ne pas resserrer les bagues ni appuyer sur les couvercles. Vérifier ensuite les fermetures selon leur notice.'
 ],
 storage:'Étiqueter et dater. Pour des pots correctement fabriqués et fermés, ranger au frais, au sec et à l’abri de la lumière. L’utilisation dans l’année est un repère de qualité, pas une garantie pour un lot incertain.',
 caution:'Un pot suspect ne se goûte pas. Jeter tout le contenu d’une confiture moisie ou altérée. Une fermeture ou une odeur normale ne suffit pas à juger un lot.',
 sources:[['Bain d’eau bouillante',N+'publications/uga-publications/using-boiling-water-canners'],['Pots vides',N+'how/can/general-information/sterilization-of-empty-jars'],['Pots et couvercles',N+'how/can/general-information/recommended-jars-and-lids/'],['Rangement des bocaux',N+'how/can/general-information/storing-home-canned-foods'],['Confitures ouvertes',N+'how/store/storing-home-canned-jams-and-jellies/']]
};
export const PANTRY_PREPARATIONS=[
 {id:'pantry-GM01',referenceId:'GM01',version:1,name:'Confiture de fraises',status:'undocumented',source:N+'how/make-jam-jelly/jams-jellies-general-information/making-jam-without-added-pectin/',lot:'',notes:'',
 intro:'Un peu de la belle saison sur la tartine. Sur l’étiquette, la date et le nombre de pots ; dans le carnet, le tour de main.',
 ingredients:[{name:'Fraises écrasées',quantity:4,unit:'cups US'},{name:'Sucre',quantity:4,unit:'cups US'}],
 method:'Laver et préparer les fraises, puis les écraser. Mesurer 4 cups US de fruits et 4 cups US de sucre ; aucun jus de citron n’est prévu dans cette formule. Porter à ébullition en remuant, puis poursuivre jusqu’à épaississement. Essayer une petite cuillerée sur une assiette froide, hors du feu. Écumer, remplir les pots stériles à chaud en laissant 1/4 inch libre (6,35 mm), fermer puis appliquer le bain d’eau bouillante et le tableau de cette fiche.',
 yield:'Environ 3 à 4 half-pints US. Noter le nombre de pots réellement obtenus.',
 batchNote:'Une cup US est une mesure graduée, pas une tasse de cuisine. Pas de conversion des fruits ou du sucre en grammes sans référence adaptée. Garder cette fournée ; pour davantage de pots, préparer plusieurs fournées séparées. Une autre composition, notamment moins sucrée, demande sa propre méthode.',
 table:[['0 à 1 000 ft','5 min'],['1 001 à 6 000 ft','10 min'],['Plus de 6 000 ft','15 min']],tableNote:'Remplissage chaud ; half-pints ou pints US. La cuisson de la confiture jusqu’à la prise précède le traitement des pots remplis.',
 storage:'Après ouverture : réfrigérer à 40 °F ou moins (environ 4,4 °C). Pour une confiture cuite classique à teneur normale en sucre, un mois est un repère de meilleure conservation de la référence. Il ne couvre pas les versions réduites en sucre.',search:'confiture',
 sourceTitle:'NCHFP · Making Jam without added Pectin · tableaux 1 et 2',
 extraSources:[['Fournées séparées',N+'newsflash/can-i-double-the-recipe']]
 },
 {id:'pantry-GM02',referenceId:'GM02',version:1,name:'Poires en bocal',status:'undocumented',source:N+'how/can/canning-fruits-and-fruit-products/pears-halved/',lot:'',notes:'',
 intro:'Les poires sont rangées, le dessert a déjà un pied dans la cuisine. Sur chaque étiquette : le fruit, la date et le lot.',
 ingredients:[{name:'Poires européennes mûres, en demi-fruits',quantity:null,unit:'à noter'},{name:'Eau de cuisson et de couverture',quantity:null,unit:'selon les pots'}],
 method:'Laver et peler les poires, les couper en deux dans la longueur et retirer le cœur. Pour garder leur couleur, conserver les fruits préparés dans un bain de 3 g d’acide ascorbique pur pour 1 gallon US d’eau froide (environ 3,785 l), puis les égoutter. Ce bain sert à la couleur. Faire bouillir les poires égouttées 5 min dans l’eau. Remplir les pots avec les fruits chauds et leur liquide en laissant 1/2 inch libre (12,7 mm). Retirer les bulles, ajuster l’espace libre, essuyer les bords et fermer selon la notice. Appliquer le bain d’eau bouillante et le tableau de cette fiche.',
 yield:'Selon les fruits et les pots : noter le résultat réel.',batchNote:'Cette méthode concerne les poires européennes en demi-fruits dans l’eau. Elle ne se transpose pas aux poires asiatiques, purées, mélanges ou fruits entiers. Les formats US ne sont pas remplacés par un bocal métrique de volume voisin.',
 table:[['0 à 1 000 ft','Pints : 20 min · Quarts : 25 min'],['1 001 à 3 000 ft','Pints : 25 min · Quarts : 30 min'],['3 001 à 6 000 ft','Pints : 30 min · Quarts : 35 min'],['Plus de 6 000 ft','Pints : 35 min · Quarts : 40 min']],tableNote:'Remplissage chaud ; pints ou quarts US. Pour une autre combinaison de pot et de fermeture, retrouver la méthode correspondante.',
 storage:'Après ouverture : réfrigérer entre 0 et 4 °C. Le repère général USDA pour les conserves maison est de 3 à 4 jours après ouverture, sous réserve d’une fabrication et d’une conservation correctes. La date notée ne garantit pas un lot incertain.',search:'poires en bocal',
 sourceTitle:'NCHFP · Pears-Halved · préparation et tableau 1',
 extraSources:[['Bain pour préserver la couleur',N+'how/general/ensuring-high-quality-canned-foods/'],['Conserves maison après ouverture · tableau page 9','https://www.govinfo.gov/content/pkg/GOVPUB-A110-PURL-gpo38739/pdf/GOVPUB-A110-PURL-gpo38739.pdf'],['Rangement au réfrigérateur','https://agriculture.gouv.fr/cuisine-domicile-les-bons-gestes-dhygiene']]
 }
];
