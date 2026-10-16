# Suppression des stries du papier — 0.6.3

Demande : retirer les lignes verticales qui fatiguent les yeux, examiner les six références de livres anciens fournies, et préserver la lisibilité.

## Sources examinées

Les six images ont été téléchargées et examinées visuellement :

1. https://i.ebayimg.com/images/g/wrQAAeSwi0pqjFq1/s-l960.webp
2. https://i.ebayimg.com/images/g/7hwAAeSwpG5qxfJV/s-l1200.webp
3. https://i.ebayimg.com/images/g/Bu8AAeSw6o5qjtv5/s-l960.webp
4. https://i.ebayimg.com/images/g/nNUAAeSw9i1pwuHn/s-l400.webp
5. https://www.lefestindebabette.fr/bouquinerie/wp-content/uploads/2023/11/73860-3.jpg
6. https://static.vecteezy.com/ti/photos-gratuite/t2/69357172-antique-livre-repos-sur-une-patine-en-bois-table-proche-en-haut-photo.jpg

Repères retenus : papier crème, patine irrégulière, tranches et coins usés, vieillissement doux dans les marges. Les photographies ne sont pas réutilisées comme fonds ni comme interface.

## Modification

Suppression des trois anciennes déclarations de fond de papier, y compris les répétitions diagonales fines responsables des stries et les réglures du fond général. Un seul fond CSS non répétitif les remplace : crème plus clair et légères taches diffuses aux bords. La zone centrale reste lisse. Les réglures des zones d’annotations manuscrites restent conservées.

Les illustrations, la couverture originale, les taches de vin et de gras, les tailles et couleurs des textes, les commandes et le menu de la semaine restent conservés. La version et les paramètres de cache passent à 0.6.3.

## Contrôles exécutés

- 116 tests existants réussis, aucun échec.
- Contrôles statiques réussis : syntaxe des modules, imports, ressources, langue, viewport et contrats CSS de 360 à 430 px.
- Diff relu et vérifié sans erreur d’espacement ; consolidation de toutes les déclarations de fond de papier.
- Contrastes calculés sur le fond crème central uni : texte principal 11.84:1, écriture bleue 6.99:1, texte secondaire 6.54:1. Ces valeurs théoriques ne mesurent pas le rendu sur écran ni les zones de patine.

Aucun contrôle visuel du rendu de l’application dans un navigateur ou sur téléphone exécuté pour cette version. L’absence de stries est contrôlée dans les sources ; les photographies de référence et la capture fournie ont été examinées. Les contrôles statiques ne remplacent pas une vérification sur appareil.
