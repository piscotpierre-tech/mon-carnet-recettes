# Mesures métriques françaises — 0.5.1

Demande : employer les mesures usuelles en France dans tout le carnet, notamment à la place des pieds et formats de pots américains vus dans le garde-manger.

## Réalisé

- Les longueurs, volumes, masses et températures des fiches du garde-manger se lisent en unités métriques. Les tableaux d’altitude gardent leurs seuils exacts, exprimés en mètres, sans intervalle manquant entre deux lignes. Les durées de la méthode d’origine restent inchangées.
- Les nouvelles fournées enregistrent `altitudeM`. Les anciens champs `altitudeFt` restent acceptés dans les sauvegardes et se lisent en mètres. Les valeurs originales des méthodes figées dans les lots ne sont pas réécrites.
- Les réserves et leur journal se lisent en unités métriques. Un prélèvement saisi en ml sur une ancienne réserve exprimée en volume américain est reconverti vers son unité archivée, pour conserver les mouvements et leur annulation. La correction de la quantité conserve cette unité interne lorsque l’unité métrique affichée reste identique.
- La fiche courante de confiture utilise une référence culinaire française pesée : 1 kg net de fraises, 800 g de sucre et le jus d’un petit citron. La mise à jour unique préserve les identifiants, notes personnelles, références de lots et méthodes archivées. Une fiche dont la composition, le tableau ou d’autres paramètres ont été personnalisés reste conservée.
- Présentation, recettes, photos, jardin, menus et sauvegardes restent dans le même carnet. Aucun panneau nutritionnel n’est ajouté.

## Référence culinaire et limites de la conversion

Recette relue le 15 octobre 2026 : [Larousse, Confiture de fraise](https://www.editions-larousse.fr/recette/confiture-de-fraise/). La nouvelle fiche est en version 2. La méthode de cuisson et les quantités proviennent de cette référence ; elle n’hérite pas du programme de traitement de la formule NCHFP en volumes. Aucun programme de traitement ni durée de stockage avant ouverture ne sont inventés pour cette composition.

Les conversions de longueur et de volume sont calculées à partir des facteurs exacts, puis formatées en français. Un volume de fruits n’est pas transformé arbitrairement en poids. Les formats historiques de pots sont donnés par leur capacité métrique avec leur fermeture de référence ; un pot proche en volume n’est pas déclaré équivalent. Les anciennes formules restent lisibles en ml lorsqu’elles ont réellement été mesurées ainsi.

Les unités d’origine peuvent subsister dans les données archivées et les exports pour garder l’historique exact. Les écrans correspondants emploient leur représentation métrique.

## Contrôles exécutés

- 103 tests Node réussis, 0 échec, dont 11 tests spécifiques aux mesures et à leur compatibilité.
- Lecture des méthodes courante et historiques sans unités américaines visibles ; contrôle du nombre de pots dans le rendement et des seuils d’altitude.
- Conservation des notes, des méthodes figées et des fiches personnalisées ; ajout unique et idempotent de la référence pesée.
- Sauvegarde et restauration des anciennes altitudes et des nouvelles saisies en mètres ; rejet des altitudes invalides.
- Prélèvement en ml dans une ancienne réserve volumique puis annulation avec retour à la quantité initiale.
- Contrôles statiques de syntaxe, imports, ressources et contrats de mise en page mobiles réussis.
- Copie autonome générée et syntaxe du bootstrap vérifiée.

Résultats : `test-results/node-tests-0.5.1.txt` et `test-results/static-checks-0.5.1.txt`.

Pas de contrôle visuel en navigateur ou sur téléphone exécuté dans ce lot. Aucun essai réel de fabrication ni de conservation des bocaux.
