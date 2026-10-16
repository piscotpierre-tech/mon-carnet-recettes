# Corrections de l’audit 0.6.3 — version 0.6.4

Date : 16 octobre 2026. Base : `da1a264f02af0777b8ca0b5205597034b2fc8d48` sur `main`.

## Sources et périmètre demandé

Le rapport `Audit_Mon_carnet_de_recettes_0.6.3_2026-10-16.pdf` a été lu intégralement (5 pages). Le brief de reprise actuel et `docs/VERIFICATION-0.6.3.md` ont été examinés avant les corrections.

Les priorités retenues sont AUD-01 (contexte du repas), AUD-02 (ouverture hors ligne), AUD-03 (statut d’essai et provenance). Pour AUD-04, la dernière décision du brief prévaut : couverture → « Ouvrir le carnet » → sommaire. Aucune feuille intermédiaire n’est ajoutée.

## Réalisé

### AUD-01 — Le repas ouvre sa recette enregistrée

Le titre d’un repas mène à `#repas/<identifiant du repas>`. Cette consultation utilise la recette archivée dans le menu et ses convives ; elle propose un accès explicite à la fiche actuelle. Les quantités, annotations ajustées et étapes sont calculées à partir du même contexte. Le mode cuisine conserve la même version, les convives et un lien de retour au repas.

Le nombre de convives d’un repas se modifie dans le menu. Changer seulement les convives conserve sa recette archivée. Reprendre la fiche actuelle demande de cocher une commande explicite ; choisir une autre recette utilise sa fiche actuelle. Le recalcul des courses reste une action explicite, comme auparavant. Un lien vers un repas supprimé affiche son indisponibilité.

Aucune migration ou réécriture des menus existants n’est effectuée au démarrage. La nouvelle référence facultative `cooking.menuId` est validée et conservée dans les sauvegardes. Les anciennes préparations en cours, sans ce champ, restent lisibles.

### AUD-02 — Ressources disponibles sans réseau après préparation

Un service worker prépare un cache complet de l’interface, des modules, de la police et des illustrations. Le manifeste ouvre sur la couverture. Les préférences affichent l’état de préparation, la disponibilité hors ligne, l’échec ou l’attente d’une mise à jour.

L’installation exige un téléchargement complet ; un échec retire seulement le cache incomplet. Une nouvelle version attend la fermeture des anciens onglets avant son activation. Le nettoyage concerne uniquement les anciens caches de ce carnet et de son chemin d’hébergement. Le service worker ne modifie jamais IndexedDB, les recettes ou les photos. Les liens extérieurs demandent du réseau. Le premier chargement demande une connexion ; attendre la mention de disponibilité dans les préférences avant de partir hors ligne.

Ce mécanisme est implémenté et testé en simulation. Il ne constitue pas encore une réception du démarrage en mode avion sur un navigateur réel. L’installabilité PWA n’a pas été validée et n’est pas promise par ce lot.

### AUD-03 — Essai et origine visibles

Les fiches éditoriales affichent « À essayer en cuisine » ou « Essayée en cuisine » d’après `editorial.testedInKitchen`. L’origine est consultable dans un détail ; le numéro et la page du recueil, quand elle est renseignée, sont affichés. Aucun statut des 150 recettes réelles n’est changé et aucune validation culinaire n’est déclarée.

## Réellement testé

- Base avant modification : 116 tests automatisés réussis et contrôles statiques réussis.
- Après corrections : **129 tests automatisés réussis, 0 échec**. Sortie conservée dans `test-results/node-tests-0.6.4.txt`.
- `npm run check` réussi : syntaxe des modules, imports et ressources présents, langue, viewport, contrats CSS de 360, 375, 390, 412 et 430 px. Sortie dans `test-results/static-checks-0.6.4.txt`.
- Contrôleur avec doubles DOM et IndexedDB : repas pour six dans une session neuve, recette courante modifiée en version 2, consultation préalable pour quatre, passage en cuisine pour six en version 1, courses cohérentes, repas inchangé à la consultation, conservation après export/import, mise à jour explicite de la fiche du menu, lien manquant, deux états d’essai et provenance.
- Service worker simulé : réouverture sans réseau à la racine et avec un ancien paramètre `v`, ressources disponibles, installation interrompue, ancien cache conservé, activation et nettoyage limités au carnet, liens externes et écritures non interceptés, ressources nécessaires entièrement couvertes, états d’interface.
- Les tests existants couvrent toujours les 150 recettes, leurs catégories, quantités, méthodes, photos et annotations sur stockage simulé, favoris, minuteur, jardin, réserves, migrations, sauvegardes et quotas.
- `git diff --check` réussi. Aucun changement de `styles.css`, des illustrations ni des données de catalogue ; leurs textes et leurs quantités restent identiques.

## Non vérifié / réception restant à faire

Aucun navigateur de contrôle compatible n’est disponible dans cet environnement. Aucun serveur de prévisualisation ni navigateur supplémentaire n’a été installé. Les tests sur doubles et contrats CSS ne sont pas des essais réels de navigateur.

Restent à exécuter sur un profil d’essai :

1. Rendu et navigation à 360, 375, 390, 412 et 430 px, zoom, molette tactile et boutons.
2. Après affichage « Le carnet est prêt », fermeture puis réouverture en mode avion ; consultation et modification d’une annotation, puis nouvelle fermeture et réouverture.
3. Sur une prochaine mise à jour, conservation d’une recette personnelle avec photo, notes, favoris, menus et préparation en cours ; fermeture de tous les onglets pour activation.
4. Téléchargement puis import réel d’une sauvegarde dans un profil vierge.
5. Minuteur après verrouillage et suspension du navigateur. La sonnerie en arrière-plan reste non garantie.
6. Essais culinaires et vérification séparée des procédés de conservation ; ce lot ne les certifie pas.

Aucun carnet personnel réel n’a été ouvert ou modifié pendant les essais. La réception complète de la V1 n’est pas déclarée.
