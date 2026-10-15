# Mon carnet de recettes — 0.3.0

Couverture issue du véritable cahier de Pierre, sommaire en cinq chapitres, papier patiné et minuteur à molette manipulable.

Carnet personnel de Pierre : recettes, menus, courses, plantes, récoltes et réserves. HTML, CSS et JavaScript sans framework ; données et photos locales dans IndexedDB.

Application : https://piscotpierre-tech.github.io/mon-carnet-recettes/

## Ouvrir et vérifier

Depuis ce dossier : `python3 -m http.server 8080`, puis ouvrir `http://localhost:8080/`.

Tests : `npm test` et `npm run check` (Node 22 ou ultérieur). Aucun paquet à installer pour l’application.

La page `verification-0.3.0/controle-mobile.html` permet de consulter la version de recette dans des fenêtres de 360, 375, 390, 412 ou 430 px. Ses données restent séparées du carnet principal. Les sources, tests et captures sont documentés dans `docs/VERIFICATION-0.3.0.md`.

Exporter régulièrement le carnet depuis « Préférences et sauvegardes ». L’application ne synchronise pas les appareils et ne stocke aucune donnée personnelle sur GitHub. La fermeture d’un navigateur ne déclenche pas de sonnerie garantie ; l’ouverture hors ligne n’est pas garantie.
