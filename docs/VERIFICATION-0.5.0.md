# Bocaux et Jardin — 0.5.0

Demande : intégrer le dossier de Pierre dans « Le garde-manger » et « Mon petit coin de verdure », en conservant le vieux carnet de chef.

## Réalisé

- Deux fiches de conserve : confiture de fraises et poires européennes en demi-fruits dans l’eau. Composition, unités d’origine, méthode, pots, fermeture, bain d’eau bouillante, tableaux d’altitude, refroidissement et rangement sont repris du dossier. Les sources restent dans un feuillet repliable ; aucun panneau nutritionnel n’est réintroduit.
- Deux guides de culture : basilic en pot et fraisier. Installation, arrosage à partir de l’observation, cueillette, protection et contexte local. Variété, exposition, date d’installation, dimensions et drainage du pot peuvent être notés.
- Journal d’observations et récoltes pesées, comptées ou non renseignées. Aucune conversion fictive en grammes. Une récolte ne passe qu’une fois dans les réserves.
- Fiches de fournées avec méthode figée dans sa version, notes des ingrédients réels, modèle de pot, fermeture, appareil, altitude en ft et traitement effectivement consigné. Aucun champ de traitement n’est choisi ni rempli automatiquement.
- Réserves par pot, date d’ouverture propre à chaque pot, état fermé/ouvert/terminé/écarté, prélèvement confirmé et annulable avec lien facultatif à une recette et à sa version.
- Sans pesée d’un pot, suivi par pot entier terminé. Une quantité inconnue ne permet pas un prélèvement chiffré. Pas de stock négatif ni de double annulation. La date d’ouverture n’est pas effacée par l’annulation d’un prélèvement.
- Liens du jardin vers les recettes existantes qui utilisent réellement basilic ou fraises. Aucun remplacement de fruit cru par des fruits en bocal n’est effectué : une liaison culinaire non rédigée invite à créer sa fiche.

## Préservation

Ajout initial unique et transactionnel, avec marqueur de catalogue. L’ancien brouillon de confiture n’est complété que s’il est intact ; sinon il reste conservé à côté de la nouvelle référence. Les plantes et leurs notes ne sont pas remplacées, et aucun lot ou stock n’est créé avant une saisie explicite.

Le schéma V2 reste compatible : les tableaux de lots et de prélèvements sont facultatifs dans les anciens carnets. Export, import et fusion conservent ces tableaux, les versions, les dates et les valeurs inconnues ; les conflits et les données invalides annulent les opérations. Les photos et les 50 recettes sont conservées.

## Provenance et portée

Dossier fourni : `CDR_Bocaux_et_Jardin_Dossier_Pilotage_V1-1.pdf`, 14 pages. SHA-256 : `6232e87e9ed664fb04caca13486eb2dd72948bc40a1134152dc3d1842846348f`.

Les paramètres principaux ont été relus dans les pages NCHFP de la confiture sans pectine et des demi-poires, les consignes de bain d’eau bouillante, pots vides, fermetures et confitures ouvertes. Les guides RHS du basilic et du fraisier ont été recoupés. Les références USDA après ouverture, françaises de réfrigération et du bain de maintien de couleur sont accessibles dans la fiche concernée.

L’intégration ne déclare pas le matériel de Pierre compatible avec les tableaux US, ne transpose pas les volumes à un bocal métrique et ne certifie pas la fabrication d’un lot. Le mode guidé de fabrication reste hors de ce départ ; le carnet permet de lire la méthode et de consigner ce qui a réellement été fait.

## Contrôles exécutés

- 92 tests Node réussis, 0 échec : 75 précédents et 17 supplémentaires.
- Lecture des deux nouvelles fiches et deux guides avec les contrôleurs et des doubles de DOM.
- Formulaire de lot → ouverture d’un seul pot → prélèvement de 30 g → annulation, avec quantité initiale et date d’ouverture retrouvées.
- Observation du jardin → récolte inconnue → réserve conservant la quantité inconnue.
- Tests de stock insuffisant, pot fermé, dates incohérentes, pots non pesés, récolte transférée deux fois, lots corrompus et doublons de pots.
- Conservation des snapshots, notes, sources, versions et dates après fermeture/réouverture du stockage simulé, export, import et fusion ; annulation atomique sur échec de quota.
- Aucun changement de réserve lors de la planification des menus ou de la génération des courses.
- Contrôles statiques des imports, ressources, syntaxe et contrats CSS mobiles réussis. Les tableaux de traitement sont présentés en blocs verticaux.
- Copie autonome générée et syntaxe de son bootstrap vérifiée.

Résultats : `test-results/node-tests-0.5.0.txt` et `test-results/static-checks-0.5.0.txt`.

## Points non exécutés ou différés

Pas de navigateur de contrôle pris en charge disponible : aucun nouveau test visuel à 360–430 px, sur téléphone physique ou en mode hors ligne. Pas d’essai réel de conserve ni de culture. Pas de rappel automatique d’arrosage, de synchronisation, de déduction automatique de réserve dans les courses ni de transformation automatique d’une récolte en lot. Les affectations et les nouvelles idées de recettes restent manuelles ; les notes permettent de conserver leur origine.
