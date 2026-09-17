# CLAUDE.md : INTÉRIEUR

Visite guidée en 3D de l'intérieur du corps humain, dans le navigateur. Onze
escales de la peau jusqu'à l'ADN, en **version enfant** (dès 7 ans) et en
**version adulte**, trois missions et une relique cachée par escale.

▶ https://lukaa-s.github.io/corp-humain/

## Ce que c'est techniquement

**Onze mondes 3D entièrement procéduraux** : aucun modèle 3D importé, aucune
texture bitmap, tout est généré par le code (Three.js + shaders). C'est la
contrainte fondatrice du projet : une escale nouvelle se construit avec de la
géométrie et des shaders, pas avec un fichier `.glb` téléchargé.

## Lancer et bâtir

```bash
node serve.mjs            # http://localhost:8123, sources telles quelles
node build.mjs            # → dist/interieur.html, un seul fichier autonome
```

`dist/interieur.html` embarque tout (three.js, shaders, contenu, feuille de
style) : il s'ouvre par double-clic, sans serveur. C'est le format à envoyer
quand quelqu'un veut simplement regarder.

## Publier

Dépôt `github.com/Lukaa-s/corp-humain`, branche `main`, servi par GitHub Pages.
Identité : `Lukaa-s` / `chercheur1801@gmail.com`.

Lukas ne peut pas ouvrir un artifact Claude depuis son poste : pour lui montrer
une modification, publier ou lui donner une URL joignable (voir le skill
`/voir`).

## Le trajet a une logique, et elle est le produit

Ce n'est pas une galerie d'organes : c'est un parcours. La sonde entre par un
pore, tombe dans un vaisseau, remonte jusqu'au cœur, est éjectée vers les
poumons, redescend la chaîne du carburant (estomac, intestin, foie), passe au
tri des déchets par le rein, va voir qui consomme (os et muscles), qui coordonne
(cerveau), et finit dans une cellule. **Chaque transition affiche un carton de
chapitre qui dit pourquoi on va là.** Ajouter une escale, c'est l'insérer dans
ce raisonnement, pas la poser à la fin.

## Le défaut déjà signalé, et la règle qui en sort

> « les bulles, on ne comprend quasiment pas à quoi ça fait référence, déjà
> parce que la 3D est parfois trop brouillonne »

Une annotation doit être **ancrée sur un objet réel de la scène**, pas flotter
au-dessus d'un magma. Si l'objet n'est pas lisible, c'est la scène qu'il faut
simplifier, pas l'étiquette qu'il faut allonger.

## Les deux versions

Enfant dès 7 ans et adulte. Elles ne diffèrent pas par la quantité de texte mais
par ce qu'on montre et le vocabulaire. Une version enfant qui est la version
adulte avec des mots plus courts a raté.

## Écriture

Français, sans em dash, sans point médian décoratif. Voir `/review-ui`.
