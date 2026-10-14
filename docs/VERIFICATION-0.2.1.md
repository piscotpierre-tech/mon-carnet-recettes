# Vérification du carnet 0.2.1 — 14 octobre 2026

## Changements livrés

- Couverture composée à partir des ornements de la référence fournie, avec titre et bouton en HTML sélectionnable. Les inscriptions imprimées sous ces éléments sont masquées dans la décoration.
- Bandeaux fleuris à partir de zones larges des références, sans répétition d’une petite fleur. Variantes marché et jardin.
- Suppression du mélange multiplicatif qui assombrissait les illustrations. Correction du cadrage du basilic et ajout du carnet de courses et de la cuillère aux herbes.
- Papier crème, reliure ombrée, bords patinés et coins repliés ; annotations dans une police calligraphique locale (Z003, licence jointe).
- Navigation avec une feuille DOM qui pivote en perspective, recto, verso papier et ombre mobile. Le retour vers couverture/sommaire utilise le sens inverse. Le défilement revient en haut lors d’un changement de page.
- Les mises à jour de données et du minuteur dans un même écran ne déclenchent pas de feuille. Respect de la préférence système de réduction des animations. La copie décorative est cachée de l’arbre accessible, sans contrôles actifs ni identifiants de champs.
- Ressources versionnées pour que les navigateurs retrouvent les corrections. La base IndexedDB, son nom, le chemin principal, le schéma 2 et les sauvegardes sont conservés.

## Contrôles exécutés

| Contrôle | Résultat |
| --- | --- |
| Tests Node : domaine, portions, minuteur, stockage simulé, migration V1, export/import, contrôleurs et feuille | 55 réussis |
| Syntaxe, imports et ressources locales, contrôles statiques | Réussis |
| Chrome : 15 écrans à 360 px et 15 écrans à 390 px | Aucun débordement horizontal ; toutes les commandes mesurées atteignent 44 × 44 px |
| Vérification du hash de chaque écran | 30 / 30 correspondent au parcours demandé |
| Mouvement de feuille au retour vers la couverture | Animation `sheet-back` observée dans le DOM ; couche décorative `aria-hidden` |
| Assiette pour 3 et ingrédients du mode cuisine | Poireaux : 750 g dans les deux écrans |
| Création d’une recette d’essai avec ingrédient, étape, photo et note | Enregistrement réel effectué dans IndexedDB de la version de vérification |
| Rechargement et recherche de cette recette | Retrouvée avec sa photo décodée de 2 × 2 pixels |
| Export par le bouton de l’application | Fichier JSON effectivement téléchargé et réimporté |
| Restauration du fichier exporté après changement d’une préférence | Message de restauration ; sonnerie rétablie à vrai ; aperçu de 4 recettes et 1 photo |
| Minuteur en pause, rechargement et reprise de la page cuisine | 00:59 avant et après rechargement |
| Intégrité de l’export réellement téléchargé | Lecture et vérification par le module de sauvegarde |

Le fichier `verification-0.2.1/mobile-checks.json` contient les trente mesures DOM. Trente mesures géométriques ont été effectuées. Quatorze captures JPEG ont pu être conservées, dont les accueils 360 et 390 joints au dépôt. La capture montre une fenêtre mobile dans Chrome ; le bandeau supérieur est l’outil de vérification.

## Limites et écarts qui demeurent

Les polices ne sont pas celles des maquettes. Les petits dessins issus des planches sont limités par leur définition et certains fonds papier restent visibles autour des objets. Les zones de formulaire et la fiche d’assiette sont plus hautes que dans les maquettes afin de conserver les textes de 16 px et les cibles de 44 px. Le verso de la feuille est du papier vierge ; il ne simule pas la déformation physique complète d’une vraie page. Aucun balayage tactile horizontal n’est ajouté : la feuille accompagne les liens et actions de navigation existants.

Les contrôles de largeur utilisent des fenêtres iframe réelles de 360 et 390 px dans Chrome cloud, sans émulation de matériel. Aucun test physique Android, de sonnerie en arrière-plan, de Wake Lock, de fermeture complète du navigateur ou de fonctionnement hors ligne n’est revendiqué dans ce lot. Les autres parcours menus, courses, récoltes et réserves sont couverts par les tests de logique et de contrôleurs déjà existants ; ils n’ont pas été tous répétés dans le navigateur pour cette correction visuelle.

Les exemples conservent leur statut de brouillon ; les valeurs nutritionnelles et les procédés de conserve non documentés restent inconnus. Les données d’essai sont propres au sous-dossier `verification-0.2.1`, séparées du carnet principal de Pierre.
