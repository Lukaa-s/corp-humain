# INTÉRIEUR — Voyage dans le corps humain

Une exploration en 3D, dans le navigateur, de l'intérieur du corps humain.
Onze escales — de la peau jusqu'à l'ADN — en **version enfant** (dès 7 ans) et
en **version adulte**, avec trois missions et une relique cachée par escale.

▶ **[Ouvrir la visite](https://lukaa-s.github.io/corp-humain/)**

## Ce que c'est

- **11 mondes 3D entièrement procéduraux** : aucun modèle 3D, aucune texture,
  aucune image. Tout est généré par le code au chargement de chaque escale.
- **Vol libre six axes**, seul mode de déplacement. Un clic sur un repère ou la
  touche `G` fait voyager la sonde jusqu'au point voulu.
- **Une couche de jeu** : trois missions par escale, des échantillons à récolter
  en volant dedans, une relique cachée près des limites, un score et un badge
  par escale. La progression est conservée d'une session à l'autre.
- **Deux écritures du contenu**, permutables à tout moment sans quitter la scène.
  Le registre adulte n'emploie aucun terme technique sans le traduire.
- **Un banc de lumières par escale** : clé, complément et ambiance ciel/sol
  propres à chaque organe — c'est ce qui distingue le relief d'un poumon de
  celui d'un os.
- **Son entièrement synthétisé** (WebAudio) : une nappe et un lit de bruit par
  organe, plus des évènements propres au lieu (bulles, gouttes, craquements,
  crépitements). Le battement cardiaque enfle à mesure qu'on remonte l'artère
  vers le cœur.

## Les escales

| # | Escale | Ce qu'on y voit |
|---|--------|-----------------|
| 1 | La peau | Dalles cornées, poils, entonnoir d'un pore |
| 2 | L'artère | Hématies, leucocytes, plaquettes, endothélium |
| 3 | Le cœur | Ventricule gauche, valve mitrale, cordages |
| 4 | Les poumons | Bronchiole ciliée, mousse alvéolaire, capillaires |
| 5 | L'estomac | Plis gastriques, onde de brassage, brume acide |
| 6 | L'intestin grêle | Forêt de villosités, nutriments absorbés |
| 7 | Le foie | Lobules hexagonaux, travées, sinusoïdes |
| 8 | Le rein | Glomérule, capsule de Bowman, anse de Henle |
| 9 | Os et muscles | Réseau trabéculaire, moelle, fibre striée |
| 10 | Le cerveau | Arbres dendritiques, influx, synapses |
| 11 | La cellule | Mitochondries, noyau, double hélice d'ADN |

## Commandes

| Touche | Effet |
|--------|-------|
| `Z Q S D` / flèches | Se déplacer |
| Souris | Regarder autour de soi |
| `Espace` / `Ctrl` | Monter / descendre |
| `G` | Se faire emmener jusqu'à la mission en cours |
| `,` `.` | Escale précédente / suivante |
| `E` ou `Entrée` | Ouvrir la fiche du repère visé |
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

Le rendu repose sur une petite famille de matériaux GLSL maison — tissu,
membrane, halo, particules en flux, champ de tiges — partageant un même jeu
d'uniformes (temps, battement, respiration, brouillard, banc de lumières) mis à
jour une fois par image. Budget géométrique maximal mesuré : environ 1 million
de triangles par escale à pleine qualité.

Nécessite WebGL 2.
