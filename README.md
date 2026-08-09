# INTÉRIEUR — Voyage dans le corps humain

Une visite guidée en 3D, dans le navigateur, de l'intérieur du corps humain.
Onze escales — de la couche cornée de la peau jusqu'à la double hélice — en
**version enfant** (dès 7 ans) et en **version adulte** (anatomie et
physiologie détaillées).

▶ **[Ouvrir la visite](https://lukaa-s.github.io/corp-humain/)**

## Ce que c'est

- **11 mondes 3D entièrement procéduraux** : aucun modèle 3D, aucune texture,
  aucune image. Tout est généré par le code au chargement de chaque escale.
- **Deux modes de déplacement** : visite guidée sur rail (on regarde librement
  autour de soi) ou vol libre six axes.
- **Deux écritures du contenu**, permutables à tout moment sans quitter la scène.
- **Son entièrement synthétisé** (WebAudio) : bourdon d'organe, souffle,
  battements cardiaques.

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
| `Espace` | Visite guidée ↔ exploration libre |
| `Maj` / `Ctrl` | Monter / descendre |
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

## Architecture

```
src/core/     moteur — shaders, matériaux, post-traitement, caméra, son, UI
src/world/    un module par escale, qui construit sa géométrie et son rail
src/content/  tout le texte, en deux écritures
vendor/three/ Three.js r180 (module + addons de post-traitement)
```

Le rendu repose sur une petite famille de matériaux GLSL maison — tissu,
membrane, halo, particules en flux, champ de tiges — partageant un même jeu
d'uniformes (temps, battement, respiration, brouillard) mis à jour une fois
par image.

Nécessite WebGL 2.
