# Vérification du carnet 0.3.0 — 15 octobre 2026

## Demande retenue

Revenir au caractère du véritable cahier et des maquettes de Pierre : une couverture distincte en premier, puis une feuille tournée vers un sommaire mieux ordonné ; un minuteur rouge réellement manipulable ; des gouttes de vin et des traces de gras discrètes. Le carnet personnel reste indépendant de FORGE.

## Changements réalisés

- Couverture composée avec la photographie du véritable cahier, convertie en WebP sans redessiner son décor. Le titre et le bouton d'ouverture sont de vrais éléments HTML. Une cocotte rouge issue de la maquette complète la composition.
- Sommaire en cinq lignes illustrées, avec alignement constant, séparateurs, noms de chapitres et annotations bleues. Les dessins proviennent du sommaire fourni en haute définition ; les fenêtres SVG sont bornées pour ne pas afficher les illustrations voisines.
- Brin de romarin lié à la recette marquée, sur la couverture et dans le sommaire. Les favoris et la préparation en cours restent distincts.
- Taches de vin, empreintes de gras et trace partielle de verre dans les marges, sous le contenu. Papier crème ligné, bord usé, fleurs et coin corné conservés.
- Minuteur avec coque rouge, cadran crème, soixante graduations, chiffres et molette rotative. Tourner règle la durée par pas de quinze secondes ; toucher lance ou met en pause. Le réglage par clavier et le formulaire de durée restent accessibles. La molette règle jusqu'à une heure ; le formulaire conserve les durées plus longues et l'affichage conserve leur valeur réelle.
- Le décompte suit toujours une heure de fin réelle. Modifier les convives ne multiplie pas les temps de cuisson. Le schéma 2 et le nom de la base IndexedDB sont conservés.

## Contrôles réellement exécutés

| Contrôle | Résultat |
| --- | --- |
| Tests Node de domaine, portions, sauvegardes, stockage simulé, contrôleurs, navigation et molette | 61 réussis, 0 échec |
| Syntaxe et ressources locales avec `npm run check` | Réussies |
| Chrome : quinze écrans à 360 px et quinze à 390 px | 30 mesures, aucun débordement horizontal |
| Boutons, liens de navigation et molette mesurés dans ces écrans | Aucune cible mesurée sous 44 × 44 px |
| Route obtenue après chaque navigation | 30 / 30 correspondent au parcours choisi |
| Clavier : flèche vers le haut, minuteur en pause | 05:00 → 06:00 |
| Glissement réel à la souris, quart de tour horaire | 06:00 → 21:00, sans lancement automatique |
| Toucher simulé par un clic sur la molette | Lancement et apparition du bouton Pause |
| Décompte observé puis second clic sur la molette | 20:54 puis pause à 20:53 |
| Rechargement de la page puis retour au mode cuisine | 20:53 retrouvé en pause, durée choisie 21 min |
| Formulaire de durée et progression vers l'étape suivante | Durée de 5 min enregistrée, étape 2 affichée |
| Comparaison visuelle couverture et sommaire | Références originales réexaminées ; découpages voisins corrigés |

Les mesures sont dans `docs/verification-0.3.0/mobile-checks.json`. Les captures montrent Chrome avec une fenêtre mobile et un outil de contrôle autour de l'application. Les données d'essai sont séparées de celles du carnet principal par le sous-dossier `verification-0.3.0`.

## Limites explicites

La couverture utilise une photographie du cahier ; son grain et ses éclairages restent visibles. Les proportions s'adaptent au téléphone. Les dessins issus des planches conservent parfois un peu de leur fond papier. La typographie et les proportions ne reproduisent pas exactement les maquettes ; les commandes et formulaires gardent leur place nécessaire à la lecture et au toucher.

Les gestes ont été exécutés à la souris et au clavier dans Chrome cloud. Aucun test sur téléphone physique, de toucher matériel, de sonnerie en arrière-plan, de Wake Lock ou de fonctionnement hors ligne fiable n'est revendiqué. L'export et la restauration ont été réellement vérifiés dans la version 0.2.1 ; ce lot conserve leur logique, couverte par les tests automatisés, sans prétendre avoir répété le parcours complet dans le navigateur.

La feuille conserve le mouvement en perspective existant ; elle n'est pas une simulation physique complète du papier et ne comporte pas de balayage horizontal. Les autres fonctions du cahier des charges non réalisées ne sont pas annoncées comme livrées. Les exemples restent à tester en cuisine ; la nutrition et les procédés de conserve non sourcés restent à documenter.
