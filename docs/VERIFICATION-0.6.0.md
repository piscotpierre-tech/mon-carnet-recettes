# Entrées, salades et desserts — 0.6.0

Demande : intégrer les deux recueils joints et corriger les éventuelles erreurs du système métrique français.

## Sources et contenu

| Recueil fourni | Fiches | Ingrédients | Étapes | Base |
| --- | ---: | ---: | ---: | ---: |
| Mon_carnet_50_entrees_salades_V1.pdf | 50 | 419 | 200 | 4 convives |
| Mon_carnet_50_desserts_V1.pdf | 50 | 293 | 201 | 4 convives |

Chaque document contient 55 pages ; les recettes occupent les pages 6 à 55. Les titres, quantités, précisions de pesée, matériel, préparation, cuisson, repos, étapes, mots du chef et indications d’ingrédients à repérer ont été transcrits. Les deux tableaux du garde-manger des PDF sont des index ; ils ne deviennent pas des procédés de conservation ni des stocks fictifs.

SHA-256 des entrées : `bfc60a3c2d08a2933b85313c961cab453df53fa940f28a6437b2641615edb231`.

SHA-256 des desserts : `db58f52366cd96efedf8c4acd60bf492b81e1819badaf47c686c52d0978b84f1`.

Les données portent des références stables `CDR-E001` à `CDR-E050` et `CDR-D001` à `CDR-D050`. Les 50 recettes précédentes gardent leurs identifiants et leur contenu. Le carnet contient 150 recettes fournies : 40 assiettes, 55 entrées et 55 desserts, plus les éventuelles fiches personnelles.

## Unités et changements de convives

Les 712 quantités ont été vérifiées une seconde fois à partir de la colonne chiffrée du PDF, indépendamment du découpage des lignes d’ingrédients. Les recueils emploient déjà g, ml, cl et l ; aucun poids ou volume américain n’a été trouvé dans les fiches. Les températures restent en °C et les dimensions en mm ou cm. Les fractions de découpe « un quart » et « trois quarts » sont des proportions culinaires.

Les fruits et légumes en bocal gardent leur état égoutté, sauf mention de jus utilisé. Les œufs gardent leur poids net sans coquille et leur nombre approximatif. Les masses d’huile ou de crème en grammes restent des masses : aucune densité n’est supposée pour les convertir en ml.

Le passage de 4 à 2 ou 8 convives adapte les quantités de la liste, les mesures totales reprises dans les étapes, les sous-quantités des précisions de pesée et les nombres de pièces ou récipients. Le lait d’une mousse, par exemple, reste réparti correctement entre ganache chaude et chantilly froide. Les 30 g de confiture par portion de riz au lait et les 25 g de marmelade par crème restent identiques lorsque le nombre de portions augmente. Le sel de dégorgement et le sel restant suivent leur répartition.

Les durées, températures, tailles des morceaux, épaisseurs de pâte et proportions de remplissage ne sont pas multipliées. Le matériel indiqué reste celui de la recette de référence ; une note invite à adapter plats, fournées et épaisseur à la tablée. Les changements personnels de méthode et de précision d’ingrédient restent verbatim à l’affichage.

## Intégration et préservation

Ajout au chargement, une seule fois par recueil, dans la transaction existante. Les références éditoriales empêchent les doublons après une reprise partielle ou un import. Les collisions d’identifiant ou de numéro sont résolues sans écraser la recette personnelle. Les marqueurs restent dans les sauvegardes et la fusion ; une fiche supprimée après installation n’est pas recréée à chaque démarrage.

Les notes, photos, favoris, marque-page, menus, instantanés de cuisine en cours, jardin, réserves et méthodes archivées ne sont pas remplacés. Le schéma reste en V2, avec quelques métadonnées éditoriales facultatives. En cas de limite de fiches ou d’échec du stockage, aucun ajout partiel n’est enregistré.

Les nouvelles fiches sont accessibles dans la recherche, les catégories, le mode cuisine et la sélection des menus. Les courses reprennent les quantités et normalisent les volumes compatibles en ml. Les liens existants du garde-manger et du jardin retrouvent notamment confiture, poires, fraises et basilic dans les nouveaux ingrédients. Aucun stock n’est prélevé automatiquement.

## Contrôles exécutés

- 116 tests Node réussis, zéro échec, dont 13 nouveaux contrôles d’intégration et de fonctionnement.
- Les 150 fiches et leurs modes cuisine ouverts avec les contrôleurs et des doubles de DOM ; filtres de 55 entrées et 55 desserts contrôlés.
- Ajustement des quantités, sous-quantités, œufs, nombres de biscuits et portions ; conservation des doses par portion, températures, épaisseurs et temps.
- Affichage du repos/froid séparé, y compris « 1 h 30 min » ; contrôle des groupes d’ingrédients et du passage fiche → cuisine pour deux convives.
- Préservation des données personnelles, collisions, reprise partielle, marqueurs, absence de doublons, limite de fiches et annulation atomique sur échec de quota.
- Réouverture du stockage simulé, export, import, fusion, recherche, liens de recettes et courses des nouvelles fiches.
- Contrôles statiques des modules, imports, ressources locales et contrats CSS de 360 à 430 px réussis.
- Copie autonome générée et syntaxe du bootstrap vérifiée.

Résultats : `test-results/node-tests-0.6.0.txt`, `test-results/static-checks-0.6.0.txt` et `test-results/pdf-quantities-0.6.0.json`.

Aucun contrôle visuel en navigateur ou sur téléphone exécuté pour cette version. Les recettes sont rédigées, sans essai réel de cuisine effectué ici ; les quantités ont été vérifiées par rapport aux documents fournis.
