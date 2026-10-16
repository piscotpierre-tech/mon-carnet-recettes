# Accès au menu dans le sommaire — 0.6.1

Demande : rendre le menu de la semaine facile à retrouver dans le sommaire.

## Modification

Une sixième ligne « Menu de la semaine », avec l’illustration existante de la cocotte, ouvre directement `#menus`. Elle se trouve entre « Mes recettes » et « Ma liste de courses ». Le sous-titre des recettes devient « Assiettes, entrées et desserts ». Le libellé accessible du sommaire ne fixe plus le nombre de chapitres. Version et paramètres de cache passent à 0.6.1.

## Contrôles exécutés

- 116 tests existants réussis, aucun échec.
- Contrôles statiques réussis : syntaxe, imports et ressources, langue, viewport et contrats CSS de 360 à 430 px.
- Contrôle ponctuel avec les doubles DOM existants : six liens dans le sommaire, ordre des chapitres, libellé du menu et destination `#menus`, ouverture du planning avec sept jours et quatorze repas, passage à la semaine suivante puis retour, données du carnet inchangées par cette navigation.
- Diff vérifié ; CSS, illustrations, schéma et logique de stockage inchangés.

Aucun contrôle visuel dans un navigateur ou sur téléphone exécuté pour cette modification.
