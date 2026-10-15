# Intégration des 50 recettes — 0.4.0

Demande : intégrer le document fourni par Pierre dans l’application existante, en conservant son identité visuelle et les données personnelles.

## Réalisé

- 50 vraies fiches : 40 assiettes, 5 entrées, 5 desserts ; 539 lignes d’ingrédients et 205 étapes.
- Noms, quantités, unités, états précis de pesée, regroupements, matériel, temps de préparation/cuisson/total indicatif, explications de composition, astuces et allergènes repris du contenu fourni.
- Repères S1–S4 et liens des sources du PDF accessibles dans un volet de chaque fiche. Les repères de cuisson sont ceux du document, sans procédé de conserve ajouté.
- Liste filtrable, recherche avec accents et ligatures françaises, portions, menus, courses, mode cuisine et annotations personnelles.
- Les grammes et millilitres de la méthode d’origine suivent les convives tant que les ingrédients, la base et les étapes ne sont pas modifiés. Temps, températures et dimensions ne sont pas multipliés. Une méthode retouchée reste verbatim et un repère indique de consulter les ingrédients recalculés.
- L’eau reste dans les ingrédients de cuisson et n’est pas ajoutée aux articles à acheter.
- Nutrition explicitement non calculée, valeurs absentes à `null`. Recettes rédigées et encore à tester en cuisine. Pas de photos de plats inventées.

## Préservation et ajout au carnet

L’ajout se fait au chargement, dans une transaction IndexedDB avec contrôle de révision. Le nom de la base et le schéma V2 sont conservés. Un marqueur de catalogue exportable empêche la réinstallation et les doublons après réouverture. Une sauvegarde ancienne sans marqueur reçoit le catalogue à son prochain chargement, tout en conservant ses fiches personnelles.

Les trois exemples restés strictement identiques à ceux de la version précédente sont complétés sur place, avec leurs identifiants et numéros. Les exemples retouchés et les fiches personnelles restent intacts. Les numéros déjà utilisés ne sont pas repris ; le numéro du document d’origine reste dans l’origine et les métadonnées de chaque fiche. Une collision d’identifiant est résolue avec un nouvel identifiant pour la fiche ajoutée.

Les favoris et marque-pages restent liés à leurs identifiants. Les versions enregistrées dans les menus et dans une préparation en cours ne sont pas réécrites. Les photos, préférences, courses personnelles, plantes et réserves sont conservées. Un échec de quota annule toute l’écriture.

## Provenance contrôlée

PDF joint : `Mon_carnet_50_recettes_V1-2.pdf` (56 pages).

SHA-256 : `bad11fb2edc3980f2e0cd9f5cd53fcaf3a2a772a94c9406120848f0c56850f08`.

Le texte extrait avec `pdftotext -layout` est identique, ligne pour ligne, au PDF V1 associé au catalogue structuré disponible : aucune différence. Ce catalogue a servi à l’adaptation du schéma applicatif ; les données n’ont pas été déduites des maquettes.

SHA-256 du catalogue structuré utilisé : `3b83e16ca04d37ab9868141155884f48a4b70e339084dcd2fd6cb9bbae47a45f`.

## Tests réellement exécutés

- `npm test` : 75 réussis, 0 échec (61 existants, 14 contrôles supplémentaires).
- Tous les contrôleurs des 50 fiches et des 50 modes cuisine exécutés avec des doubles de DOM, y compris les filtres entrées/desserts.
- Installation neuve, mise à jour des exemples intacts, préservation des exemples retouchés, notes et photos personnelles, favoris, marque-page, snapshots, collisions, idempotence et transaction annulée sur quota.
- Fermeture/réouverture du stockage simulé ; export, restauration et fusion avec le catalogue et les annotations.
- Portions 2 → 4, états secs/cuits/égouttés, méthode avec quantités adaptées et temps/températures/dimensions conservés, méthodes personnelles sans réécriture.
- Menus → courses pour 4 : cabillaud 600 g et lentilles sèches 240 g, sans eau à acheter.
- Recherche « boeuf », « oeufs », accents et ingrédients ; exclusions pomme fruit et flocons d’avoine.
- `npm run check` : syntaxe, imports, ressources et contrats CSS mobiles réussis.
- Génération de la copie autonome : réussie.

Les résultats sont dans `test-results/node-tests-0.4.0.txt` et `test-results/static-checks-0.4.0.txt`.

## Limites

Aucun navigateur de contrôle pris en charge n’était disponible pour ce lot : pas de nouveau contrôle visuel à 360/390 px, ni sur téléphone physique. Les doubles de DOM et les contrats CSS ne constituent pas un test de rendu. Les essais culinaires, calculs nutritionnels, sonnerie en arrière-plan et ouverture hors ligne ne sont pas revendiqués. La couverture, la patine, les illustrations et le minuteur existants sont conservés.
