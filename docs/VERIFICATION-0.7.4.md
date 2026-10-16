# Icône du raccourci — 0.7.4

Le manifeste 0.7.3 ne déclarait aucune icône. La version 0.7.4 fournit les PNG 192 et 512 px, une icône Apple de 180 px et un favicon de 32 px. La cocotte et le fond fleuri sont repris des illustrations validées. Le motif principal tient dans le cercle sûr Android (rayon de 40 %), avec fond opaque. `scripts/build-icons.cjs` permet de préparer ces fichiers avec sharp ; l’application n’utilise aucune nouvelle dépendance.

Le cache est versionné 0.7.4 et inclut les quatre images. Les identifiants du manifeste, le chemin de démarrage, le schéma et le stockage du carnet restent inchangés. Aucune donnée personnelle n’est supprimée ni migrée.

Contrôles exécutés le 16 octobre 2026 : Node 24.19.0, 139 tests réussis, `npm run check` réussi, `git diff --check` réussi. Les nouveaux tests vérifient les dimensions PNG, l’opacité, les chemins sous GitHub Pages, les déclarations Android/Apple/onglet et la disponibilité des icônes dans le cache simulé. L’icône produite a été examinée visuellement.

Publication contrôlée : HTTP 200 et types MIME corrects pour le manifeste, le service worker, la page et les quatre PNG ; fichiers publics identiques octet par octet aux fichiers livrés (empreintes dans `test-results/publication-icons-0.7.4.json`). Dans Chrome distant, passage effectif de 0.7.3 à 0.7.4 avec « Appliquer la mise à jour » ; préférences et recette marquée toujours présentes, retour à la couverture réussi, déclarations des icônes visibles dans le HTML chargé.

L’installation sur un téléphone Android/iPhone réel et le remplacement automatique d’un ancien raccourci ne sont pas vérifiés ici. Le cache hors ligne est contrôlé par simulation ; aucun nouvel essai en mode avion n’a été effectué pour ce correctif. Les contrôles des huit écrans de la version précédente restent consignés dans `VERIFICATION-0.7.3.md`.

Pour un ancien raccourci sans image : ouvrir le carnet dans le navigateur habituel, appliquer la mise à jour depuis les préférences si elle est proposée, puis retirer seulement le raccourci de l’écran d’accueil et l’ajouter à nouveau. Ne pas désinstaller l’application ni effacer les données du navigateur.

Références techniques : https://web.dev/learn/pwa/web-app-manifest et https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html.
