# 0.7.0 — Huit feuilles du carnet

Base : `fea60ce` (0.6.4, branche `codex/audit-0.6.4`), descendante de la 0.6.3 publiée. Travail isolé sur `codex/maquettes-carnet-0.7.0`. Aucun autre espace de travail modifié.

Les quatre planches du 16 octobre sont la référence prioritaire. Le vrai cahier a été examiné (couverture et deux vues du sommaire). Les motifs et illustrations ont été extraits séparément des planches : aucun écran n’est une capture cliquable. Titres, ingrédients, listes, champs et actions sont du HTML. La patine est déterministe, différente par famille de page et hors interaction. Les fines stries verticales sont absentes.

## Réalisé

Couverture, sommaire avec recherche et six chapitres, recette avec convives enregistrés et notes rapides, cuisine avec reprise de progression, marché avec courses réelles, jardin, réserves et nouvel écran des secrets. Les composants communs habillent l’éditeur, les menus et les sauvegardes.

Les 150 fiches du catalogue restent installées sans remplacer les fiches personnelles. Le nom IndexedDB et le chemin principal sont inchangés. L’ajout optionnel `secrets` reste compatible avec le schéma V2 ; les sauvegardes V1/V2 restent acceptées. Les secrets et les convives enregistrés sont exportés, restaurés et fusionnés ; une divergence de secret annule la fusion. Aucune réserve, récolte ou note personnelle fictive n’est créée.

Les procédés de conservation et les sources horticoles préexistants sont conservés. Les secrets sont des notes personnelles, sans traitement thermique ni durée de conservation ajoutés.

## Contrôles exécutés

- Node.js : suite complète, 134 tests réussis ; contrôles de syntaxe et ressources réussis.
- Tests sur carnet rempli : photos, annotations, menus figés, courses, récoltes et réserves déjà couverts par la suite ; nouveaux tests de migration V2 sans mutation, persistance des secrets et convives, export/restauration et conflits de fusion.
- Service worker : cycle simulé, échec partiel d’installation, conservation de l’ancienne version, cache des modules, polices et assets locaux et reprise avec ancien paramètre de version.

## Vérifications navigateur

À compléter après consultation de la version hébergée. Le superviseur local ne démarre pas dans l’environnement (`bwrap: Can't mount proc on /newroot/proc: Operation not permitted`). Les tests Node et simulations de service worker ne prouvent pas un rendu mobile ni un mode avion réel. `controle-maquettes.html` propose des fenêtres de 360, 390 et 430 px.

## Limites du navigateur

Sonnerie lorsque l’onglet est suspendu ou fermé non garantie. Écran maintenu allumé selon la prise en charge et la permission du navigateur. Liens extérieurs accessibles uniquement avec réseau. Aucun compte ni synchronisation ajoutés.
