# 0.7.1 — Huit feuilles du carnet

Base : `fea60ce` (0.6.4, branche `codex/audit-0.6.4`), descendante de la 0.6.3 publiée. Travail isolé sur `codex/maquettes-carnet-0.7.0`. Aucun autre espace de travail modifié.

Les quatre planches du 16 octobre sont la référence prioritaire. Le vrai cahier a été examiné (couverture et deux vues du sommaire). Les motifs et illustrations ont été extraits séparément des planches : aucun écran n’est une capture cliquable. Titres, ingrédients, listes, champs et actions sont du HTML. La patine est déterministe, différente par famille de page et hors interaction. Les fines stries verticales sont absentes.

## Réalisé

Couverture, sommaire avec recherche et six chapitres, recette avec convives enregistrés et notes rapides, cuisine avec reprise de progression, marché avec courses réelles, jardin, réserves et nouvel écran des secrets. Les composants communs habillent l’éditeur, les menus et les sauvegardes.

Les 150 fiches du catalogue restent installées sans remplacer les fiches personnelles. Le nom IndexedDB et le chemin principal sont inchangés. L’ajout optionnel `secrets` reste compatible avec le schéma V2 ; les sauvegardes V1/V2 restent acceptées. Les secrets et les convives enregistrés sont exportés, restaurés et fusionnés ; une divergence de secret annule la fusion. Aucune réserve, récolte ou note personnelle fictive n’est créée.

Les procédés de conservation et les sources horticoles préexistants sont conservés. Les secrets sont des notes personnelles, sans traitement thermique ni durée de conservation ajoutés.

## Contrôles exécutés

- Node.js : suite complète, 136 tests réussis ; contrôles de syntaxe et ressources réussis.
- Tests sur carnet rempli : photos, annotations, menus figés, courses, récoltes et réserves déjà couverts par la suite ; nouveaux tests de migration V2 sans mutation, persistance des secrets et convives, export/restauration et conflits de fusion.
- Service worker : cycle simulé, échec partiel d’installation, conservation de l’ancienne version, cache des modules, polices et assets locaux et reprise avec ancien paramètre de version.

## Vérifications navigateur exécutées sur GitHub Pages

Chrome du navigateur de contrôle, fenêtres mobiles à 360, 390 et 430 px via `controle-maquettes.html`. Les huit écrans ont été ouverts aux trois largeurs. Contrôles de géométrie des titres, champs et boutons et des cibles des boutons (au moins 44 × 44 px). Le navigateur de bureau consomme 15 px pour sa barre de défilement dans le premier passage ; la version finale restaure le masquage de cette barre utilisé par le carnet pour tester les largeurs exactes. Un débordement transitoire a été relevé pendant le changement de largeur sur la couverture ; la couche de transition est bornée dans la correction finale.

Parcours exécutés : couverture → sommaire ; recherche du sommaire ; recette personnelle avec photo ; favoris et marque-page ; 500 g pour deux → 750 g pour trois ; création et modification d’un secret (12,5 cl, 43,5 g) ; pause du minuteur à 00:53 et retour recette → cuisine avec la même durée et l’étape 2/4 ; demande de maintien d’écran acceptée ; observation de jardin créée puis modifiée ; récolte transférée une fois, le second clic ouvre sa réserve ; menu pour trois générant 750 g de courses ; coche et ajout depuis le marché.

Le carnet de contrôle a été rempli sous la vraie 0.6.3 avant mise à jour : une recette personnelle, une photo témoin de 80 × 60 px, une note, un favori et un marque-page. Ils sont retrouvés sous la 0.7.0, ainsi que l’étape 2/4 en cuisine. Un export réel contenant 151 recettes, une photo, un repas, deux plantes, une réserve et un secret a été téléchargé puis réimporté. Après modification de la note, le remplacement restaure son ancien texte et sa photo décodée de 80 × 60 px. La copie précédant le remplacement reste exportable.

La 0.7.1 corrige les raccords décoratifs de la couverture et replie la liste complète d’ingrédients en cuisine lorsque les données ne définissent pas d’association par étape ; le texte de l’étape et le minuteur restent visibles en priorité. Elle resynchronise aussi les convives affichés après import.

Le superviseur de prévisualisation local n’a pas démarré (`bwrap: Can't mount proc on /newroot/proc: Operation not permitted`) ; les contrôles d’interface ont été faits sur la version GitHub Pages.

## Limites du navigateur

Sonnerie lorsque l’onglet est suspendu ou fermé non garantie. Écran maintenu allumé selon la prise en charge et la permission du navigateur. Liens extérieurs accessibles uniquement avec réseau. Aucun compte ni synchronisation ajoutés.

Le navigateur affiche « prêt pour une ouverture sans réseau » après installation effective du service worker. Le cycle hors ligne est aussi couvert par les simulations Node. Le navigateur de contrôle ne fournit pas de commande pour couper son réseau : aucune réouverture en mode avion réel ni essai sur Android physique n’est revendiqué. La sonnerie visuelle de fin a été observée ; le son audible et son fonctionnement en arrière-plan ne sont pas certifiés par cet environnement.

Écarts visuels assumés : les pages longues défilent ; aucun texte n’est réduit pour reproduire la hauteur fixe des planches. Les cartouches et le minuteur sont réalisés en HTML/CSS/SVG ; leur tracé diffère légèrement du dessin. Les données personnelles illustrées dans les maquettes ne sont pas préremplies.
