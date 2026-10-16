# Mon carnet de recettes — 0.7.1

Couverture issue du véritable cahier de Pierre, sommaire en six chapitres, papier patiné et minuteur à molette manipulable.

Le fond crème reste lisse pour la lecture : les stries et les motifs répétitifs de papier sont retirés. Les marges gardent une patine douce et irrégulière, les traces de cuisine et les coins usés. La couverture illustrée est conservée.

« Menu de la semaine » est accessible directement dans le sommaire, entre « Mes recettes » et « Ma liste de courses ».

Les 50 recettes fournies par Pierre (40 assiettes, 5 entrées, 5 desserts) sont intégrées : ingrédients par composant, états de pesée, méthode, temps indicatifs, matériel, conseils de cuisson et astuces du chef.

Les deux recueils supplémentaires de Pierre ajoutent 50 entrées et salades et 50 desserts : 150 fiches au total, dont 40 assiettes, 55 entrées et 55 desserts. Les nouvelles recettes sont prévues pour quatre convives, avec 712 ingrédients et 401 étapes transcrits des PDF. Les poids égouttés et les œufs sans coquille restent précisés ; les temps de repos et de froid sont affichés séparément. Les mesures sont déjà françaises dans les deux recueils et sont conservées sans conversion arbitraire.

L’ajout des deux recueils est unique, sans remplacement des fiches personnelles. Les quantités totales et les nombres de portions suivent les convives ; les températures, épaisseurs et garnitures indiquées par portion gardent leur valeur. Les nouvelles fiches se retrouvent dans les catégories, la recherche, le mode cuisine, les menus, les courses et les liens depuis le jardin ou le garde-manger.

L’ajout s’effectue une seule fois au prochain chargement du carnet. Les exemples intacts sont complétés en conservant leurs identifiants ; les fiches personnelles ou modifiées restent préservées. Les favoris, photos, menus et préparations en cours sont conservés. Les sauvegardes V1/V2 restent lisibles.

Carnet personnel de Pierre : recettes, menus, courses, plantes, récoltes et réserves. HTML, CSS et JavaScript sans framework ; données et photos locales dans IndexedDB.

Application : https://piscotpierre-tech.github.io/mon-carnet-recettes/

## Ouvrir et vérifier

Depuis ce dossier : `python3 -m http.server 8080`, puis ouvrir `http://localhost:8080/`.

Tests : `npm test` et `npm run check` (Node 22 ou ultérieur). Aucun paquet à installer pour l’application.

La page `verification-0.3.0/controle-mobile.html` permet de consulter la version de recette dans des fenêtres de 360, 375, 390, 412 ou 430 px. Ses données restent séparées du carnet principal. Les sources, tests et captures sont documentés dans `docs/VERIFICATION-0.3.0.md`.

Exporter régulièrement le carnet depuis « Préférences et sauvegardes ». L’application ne synchronise pas les appareils et ne stocke aucune donnée personnelle sur GitHub. La fermeture d’un navigateur ne déclenche pas de sonnerie garantie. Le carnet prépare ses ressources pour une ouverture sans réseau : attendre la mention « Le carnet est prêt » dans les préférences avant de couper la connexion. La première ouverture demande du réseau ; les liens extérieurs aussi. Les essais réels en mode avion restent à exécuter.

Validation de cette intégration : 75 tests automatisés réussis et contrôles statiques. Le contrôle visuel mobile des nouvelles fiches n’a pas été exécuté dans ce lot. Voir `docs/VERIFICATION-0.4.1.md`.

La présentation privilégie le carnet de chef des années 80–90 : ingrédients, gestes, cuissons et annotations. Les encadrés institutionnels et les annonces de calcul alimentaire ont été retirés des fiches et de l’éditeur.

## Le garde-manger et le petit coin de verdure

Deux fiches de référence (confiture de fraises et demi-poires européennes dans l’eau) et deux guides (basilic et fraisier) sont intégrés au carnet. Les écrans utilisent les unités métriques françaises : g, kg, ml, cl, l, mm, cm, m et °C. L’altitude des nouvelles fournées se saisit en mètres. Les dimensions et fermetures des pots de référence restent précisées dans les méthodes.

La fiche courante de confiture s’appuie sur une recette Larousse pesée : 1 kg net de fraises, 800 g de sucre et le jus d’un petit citron. Elle ne reprend pas le tableau de traitement de l’ancienne formule américaine. Les anciennes fournées gardent leur méthode et leurs valeurs archivées ; leur lecture et les prélèvements s’effectuent en unités métriques. Les fiches personnalisées ne sont pas remplacées.

Les récoltes acceptent une quantité pesée, comptée ou inconnue. Elles peuvent rejoindre une réserve une seule fois. Les lots gardent la version de leur méthode et des notes sur le matériel réellement employé. Chaque pot a son ouverture, sa quantité connue ou son suivi par pot, et son journal de prélèvements annulables. L’annulation conserve la date d’ouverture. Les menus ne prélèvent rien automatiquement dans les réserves.

Validation 0.5.1 : 103 tests automatisés réussis et contrôles statiques réussis. Voir `docs/VERIFICATION-0.5.1.md`. Les anciennes sauvegardes restent acceptées ; l’export conserve les nouvelles données. Aucun contrôle visuel mobile n’a été exécuté dans ce lot.

Validation 0.6.0 : 116 tests automatisés réussis, contrôles statiques et copie autonome vérifiés. Les 712 quantités et unités ont été recoupées directement dans les deux PDF. Voir `docs/VERIFICATION-0.6.0.md`. Aucun contrôle visuel en navigateur ou sur téléphone n’a été exécuté pour cette version.

## Corrections après audit — 0.6.4

Un repas ouvre désormais sa version enregistrée et ses convives, conservés jusqu’en cuisine. La consultation d’une fiche pour une autre tablée ne change pas le repas. Dans le menu, changer les convives conserve la version enregistrée ; une case explicite permet de reprendre la fiche actuelle. Les courses suivent toujours les menus enregistrés et se recalculent par leur commande habituelle.

Les fiches du catalogue affichent « À essayer en cuisine » ou « Essayée en cuisine » selon leurs données ; l’origine reste consultable dans un détail. Aucune recette n’a été déclarée essayée par cette correction.

Le service worker met les ressources locales en cache après un téléchargement complet. Une installation incomplète laisse l’ancienne version disponible. La nouvelle version attend la fermeture des anciens onglets ; elle ne touche pas aux données IndexedDB. Le manifeste conserve l’ouverture sur la couverture. La couverture, les illustrations et le papier lisse restent inchangés.

Le parcours retenu par le brief actuel reste : couverture → « Ouvrir le carnet » → sommaire. L’ancienne proposition AUD-04 de feuille intermédiaire n’est pas appliquée.

Les contrôles et limites de cette livraison sont consignés dans `docs/VERIFICATION-0.6.4.md`.

## Huit nouvelles feuilles — 0.7.1

Les maquettes validées du 16 octobre habillent les huit écrans. Les motifs fleuris, dessins et couches de patine restent décoratifs ; les textes et actions sont sélectionnables. Le catalogue de 150 fiches est conservé. Les secrets de fabrication sont des notes personnelles enregistrables et modifiables, incluses dans les sauvegardes V2. La reprise en cuisine conserve son étape et son minuteur. Les convives choisis sont enregistrés par recette.

Contrôles : `npm test` (136 tests), `npm run check`. Voir `docs/VERIFICATION-0.7.0.md`. Pour examiner les largeurs de 360, 390 et 430 px : `controle-maquettes.html`.
