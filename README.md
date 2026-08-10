# INTÉRIEUR — Voyage dans le corps humain

Une exploration en 3D, dans le navigateur, de l'intérieur du corps humain.
Onze escales, de la peau jusqu'à l'ADN, en **version enfant** (dès 7 ans) et en
**version adulte**, avec trois missions et une relique cachée par escale.

▶ **[Ouvrir la visite](https://lukaa-s.github.io/corp-humain/)**

## Le voyage

Ce n'est pas une galerie de tableaux : c'est un trajet, et il a une logique.
La sonde entre par un pore de la peau, tombe dans un vaisseau, remonte le
courant jusqu'au cœur, se fait éjecter vers les poumons, puis redescend la
chaîne du carburant (estomac, intestin, foie), passe au tri des déchets par le
rein, va voir qui consomme tout ça (os et muscles), qui coordonne (le cerveau),
et finit dans une seule cellule. Chaque transition affiche un carton de
chapitre qui dit pourquoi on va là.

| # | Escale | Ce qu'on y voit |
|---|--------|-----------------|
| 1 | La peau | Dalles cornées, un poil géant, l'entonnoir d'un pore |
| 2 | L'artère | Endothélium en pavage, hématies, leucocyte, bouchon de plaquettes |
| 3 | Le cœur | Ventricule gauche, ses **deux** portes qui jouent en alternance, cordages |
| 4 | Les poumons | Bronchiole ciliée, un sac alvéolaire et son capillaire en file indienne |
| 5 | L'estomac | Plis, onde de brassage, champ de puits à acide, tranche de mucus |
| 6 | L'intestin grêle | Forêt de villosités, une villosité géante et sa bordure en brosse |
| 7 | Le foie | Lobules hexagonaux, travées, sinusoïdes |
| 8 | Le rein | Glomérule, capsule de Bowman, anse de Henle |
| 9 | Os et muscles | Réseau trabéculaire, moelle, fibre striée |
| 10 | Le cerveau | Arbres dendritiques, une synapse, une gaine de myéline |
| 11 | La cellule | Mitochondries, noyau, double hélice d'ADN |

## Ce que c'est

- **11 mondes 3D entièrement procéduraux** : aucun modèle 3D, aucune texture,
  aucune image. Tout est généré par le code au chargement de chaque escale.
- **Des repères qui désignent vraiment quelque chose.** Chaque repère est un
  cercle dont le rayon à l'écran est celui de l'objet visé, projeté, relié à son
  étiquette par un trait. Un clic dessus emmène la sonde au poste d'observation
  prévu pour cet objet, celui d'où on le voit bien.
- **Vol libre six axes.** Le réticule au centre désigne : `E` ou un clic ouvre
  la fiche du repère visé, que la souris soit capturée ou non.
- **Une couche de jeu** : trois missions par escale, des échantillons à récolter
  en volant dedans, une relique cachée près des limites, un score et un badge
  par escale. Une boussole et une jauge d'approche disent où est l'objectif et à
  partir de quand il compte comme atteint. La progression est conservée.
- **Deux écritures du contenu**, permutables à tout moment sans quitter la scène.
- **Un banc de lumières par escale** : clé, complément et ambiance ciel/sol
  propres à chaque organe.
- **Son entièrement synthétisé** (WebAudio) : une nappe et un lit de bruit par
  organe, plus des évènements propres au lieu. Le battement cardiaque enfle à
  mesure qu'on remonte l'artère vers le cœur.

## Commandes

| Touche | Effet |
|--------|-------|
| `Z Q S D` / flèches | Se déplacer |
| Souris | Regarder autour de soi |
| `Espace` / `Ctrl` | Monter / descendre |
| `E` ou `Entrée` | Ouvrir la fiche du repère visé |
| `G` | Se faire emmener jusqu'à la mission en cours |
| `,` `.` | Escale précédente / suivante |
| `Échap` | Rendre le curseur, fermer un panneau |
| `H` | Masquer l'interface (mode photo) |
| `M` | Couper le son |
| Molette | Focale |

## Lancer en local

```bash
node serve.mjs        # puis http://localhost:8123
```

Le site est purement statique : n'importe quel serveur de fichiers fait
l'affaire. Three.js est embarqué dans `vendor/`, rien n'est chargé depuis
Internet.

## Version « un seul fichier »

```bash
npm install           # esbuild uniquement
node build.mjs        # → dist/interieur.html
```

`dist/interieur.html` est autonome (≈ 0,9 Mo) : tout y est inliné.

## Paramètres d'URL

| Paramètre | Effet |
|-----------|-------|
| `?station=7` | Démarrer à une escale précise |
| `?age=enfant` | Choisir la version d'emblée |
| `?q=0.4` | Densité géométrique (0,12 à 1) |
| `?dpr=1` | Résolution de rendu |
| `?debug=1` | Expose `window.__app` (scène, sonde, jeu, son) |

## Architecture

```
src/core/     moteur — shaders, matériaux, post-traitement, caméra, son, jeu, UI
src/world/    un module par escale, qui construit sa géométrie et sa lumière
src/content/  tout le texte en deux écritures, et les missions
vendor/three/ Three.js r180 (module + addons de post-traitement)
```

Le rendu repose sur une petite famille de matériaux GLSL maison (tissu,
membrane, halo, particules en flux, champ de tiges, filins) partageant un même
jeu d'uniformes — temps, battement, respiration, brouillard, banc de lumières —
mis à jour une fois par image. Le matériau « tissu » sait en plus paver une
surface de cellules jointives : c'est ce qui donne l'endothélium d'une artère,
les dalles de la couche cornée et le revêtement d'une villosité.

Budget géométrique maximal mesuré : environ 1 million de triangles par escale à
pleine qualité.

Nécessite WebGL 2.
