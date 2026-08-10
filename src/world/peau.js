import * as THREE from 'three';
import { tissue, membrane, glow, voidDome, moteField } from '../core/mat.js';
import { rng, segmentsToMesh, mergeGeometries } from '../core/build.js';

/**
 * ESCALE 1 — la peau vue du sol, à l'échelle du micron.
 * Un désert de dalles cornées, des poils hauts comme des arbres,
 * et au bout du survol, l'entonnoir d'un pore : notre porte d'entrée.
 */
export default function peau() {
  const group = new THREE.Group();
  const rnd = rng(11);
  const PORE = new THREE.Vector3(40, 0, 620);

  /* ── ciel : le monde extérieur, flou et chaud ── */
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(2600, 40, 26),
    voidDome({ top: 0xc25f38, bottom: 0xd9a271, cloud: 0xffc79a, clouds: 0.55, scale: 0.4 })
  );
  group.add(sky);

  const sun = new THREE.Mesh(new THREE.SphereGeometry(180, 26, 18), glow({ color: 0xffe0b0, intensity: 1.3, core: 0.75, power: 1.6 }));
  sun.position.set(-1500, 1150, 900);
  group.add(sun);

  /* ── le sol : couche cornée ──
     Chaque dalle est une cellule morte, aplatie, qui chevauche ses voisines.
     Le pavage la dessine pour de bon : le bruit fissuré d'avant donnait un
     sol de terre craquelée, pas un empilement de tuiles. */
  const gGeo = new THREE.PlaneGeometry(3000, 3000, 320, 320);
  gGeo.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(gGeo, tissue({
    side: THREE.FrontSide,
    deep: 0x6a3320, mid: 0xd4966e, hot: 0xffe4ca,
    noiseScale: 0.0042, displace: 26, pulseAmp: 0.0,
    bumpScale: 0.05, bumpAmp: 0.3, normalMix: 0.42,
    rim: 0.2, wet: 0.16, shiny: 18, falloff: 0.0000045,
    ambient: 0.62, light: 1.0,
    pave: true, paveWorld: true, paveScale: [0.028, 0.028],
    paveDark: 0.62, paveTint: 0.2, paveBump: 0.55, paveRound: 0.95, paveGloss: 0.25,
  }));
  ground.position.y = -6;
  group.add(ground);

  /* ── poils ── */
  const hairSegs = [];
  const sampleGuard = [];
  for (let i = 0; i <= 26; i++) sampleGuard.push(i / 26);

  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-780, 150, -900),
    new THREE.Vector3(-430, 108, -600),
    new THREE.Vector3(-140, 86, -280),
    new THREE.Vector3(30, 96, 20),
    new THREE.Vector3(-40, 78, 260),
    new THREE.Vector3(60, 70, 430),
    PORE.clone().add(new THREE.Vector3(0, 46, -60)),
    PORE.clone().add(new THREE.Vector3(6, -40, 20)),
    PORE.clone().add(new THREE.Vector3(0, -190, 4)),
  ]);
  path.curveType = 'centripetal';
  const guard = sampleGuard.map(u => path.getPointAt(u));

  /**
   * Un poil : une tige qui s'affine, se courbe dans une direction constante et
   * se termine en pointe. L'ancienne version empilait six cylindres de même
   * diamètre coupés net, ce qui donnait des piquets de clôture.
   */
  const HAIR_SEG = 11;
  function growHair(x, z, height, thick, seed) {
    const r0 = rng(seed);
    const bend = new THREE.Vector3(r0() - 0.5, 0, r0() - 0.5).normalize().multiplyScalar(0.055 + r0() * 0.05);
    let cur = new THREE.Vector3(x, -22, z);
    const dir = new THREE.Vector3((r0() - 0.5) * 0.28, 1, (r0() - 0.5) * 0.28).normalize();
    const segs = [];
    for (let s = 0; s < HAIR_SEG; s++) {
      const u = s / HAIR_SEG, u1 = (s + 1) / HAIR_SEG;
      // profil : bulbe au pied, fût régulier, pointe effilée
      const rad = (t) => thick * (1.28 - 0.28 * Math.min(1, t * 6)) * Math.pow(1 - t * 0.97, 0.42);
      const len = height / HAIR_SEG;
      const nxt = cur.clone().addScaledVector(dir, len);
      segs.push({ a: cur.clone(), b: nxt, r0: rad(u), r1: rad(u1) });
      cur = nxt;
      dir.add(bend).addScaledVector(new THREE.Vector3(r0() - 0.5, 0, r0() - 0.5), 0.03).normalize();
    }
    return segs;
  }

  let placed = 0, tries = 0;
  while (placed < 42 && tries < 1200) {
    tries++;
    const x = (rnd() - 0.5) * 2400, z = (rnd() - 0.5) * 2400;
    const p = new THREE.Vector3(x, 0, z);
    if (p.distanceTo(PORE) < 260) continue;
    if (guard.some(gp => Math.hypot(gp.x - x, gp.z - z) < 88)) continue;
    placed++;
    hairSegs.push(...growHair(x, z, 130 + rnd() * 190, 12 + rnd() * 7, 700 + placed));
  }

  /* Le poil-repère. Une mission demande d'en atteindre le sommet : il faut
     donc qu'un poil, et un seul, s'impose comme celui-là. Il est deux fois
     plus haut que les autres, planté au bord du chemin, et il porte à son
     sommet une gouttelette qui accroche le soleil. */
  const HERO = new THREE.Vector3(-118, 0, 96);
  const heroSegs = growHair(HERO.x, HERO.z, 620, 26, 4242);
  hairSegs.push(...heroSegs);
  const HERO_TIP = heroSegs[heroSegs.length - 1].b.clone();

  const hairs = segmentsToMesh(hairSegs, tissue({
    side: THREE.DoubleSide, deep: 0x4a2412, mid: 0xc98a58, hot: 0xffe0b8,
    noiseScale: 0.05, displace: 0.7, bumpScale: 0.34, bumpAmp: 0.22, normalMix: 0.24,
    rim: 0.9, wet: 0.5, shiny: 34, falloff: 0.0000075, ambient: 0.5,
  }), 10);
  group.add(hairs);

  /* la gouttelette au sommet du poil-repère : un point de mire visible de loin */
  const crown = new THREE.Mesh(new THREE.SphereGeometry(19, 26, 18), membrane({
    inner: 0x4a3a20, edge: 0xfff0d0, power: 1.9, base: 0.10, rimAlpha: 0.95, glow: 0.9, irid: 0.22, alpha: 0.9,
  }));
  crown.position.copy(HERO_TIP);
  group.add(crown);
  const crownHalo = new THREE.Mesh(new THREE.SphereGeometry(52, 20, 14),
    glow({ color: 0xffd9a0, intensity: 0.30, core: 0.0, power: 2.6, flicker: 0.06 }));
  crownHalo.position.copy(HERO_TIP);
  group.add(crownHalo);

  /* ── le pore : entonnoir + bourrelet ── */
  const profile = [];
  for (let i = 0; i <= 26; i++) {
    const t = i / 26;
    const y = 22 - t * 420;
    const r = 96 - 62 * Math.pow(t, 0.55) + Math.sin(t * 9) * 3;
    profile.push(new THREE.Vector2(Math.max(r, 16), y));
  }
  const pore = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 64),
    tissue({
      side: THREE.BackSide, deep: 0x180705, mid: 0x8a3b32, hot: 0xff9e78,
      noiseScale: 0.03, displace: 5, bumpScale: 0.35, bumpAmp: 0.4, normalMix: 0.6,
      rim: 0.9, wet: 0.5, shiny: 26, falloff: 0.00008, ambient: 0.16,
    })
  );
  pore.position.copy(PORE);
  group.add(pore);

  const lip = new THREE.Mesh(
    new THREE.TorusGeometry(98, 20, 18, 72),
    tissue({
      side: THREE.FrontSide, deep: 0x3d1a12, mid: 0xb87a5e, hot: 0xffd0ad,
      noiseScale: 0.02, displace: 8, bumpScale: 0.2, bumpAmp: 0.4, normalMix: 0.6,
      rim: 0.4, wet: 0.25, shiny: 18, falloff: 0.000006, ambient: 0.55,
      })
  );
  lip.rotation.x = Math.PI / 2;
  lip.position.copy(PORE).add(new THREE.Vector3(0, 16, 0));
  group.add(lip);

  /* une goutte de sueur qui perle */
  const drop = new THREE.Mesh(new THREE.SphereGeometry(26, 28, 20), membrane({
    inner: 0x2a4f5a, edge: 0xdff6ff, power: 2.0, base: 0.06, rimAlpha: 0.9, glow: 0.5, irid: 0.1, alpha: 0.85,
  }));
  drop.position.copy(PORE).add(new THREE.Vector3(-30, 24, -46));
  drop.scale.set(1, 0.72, 1);
  group.add(drop);

  /* ── poussières ── */
  const dust = moteField(1100, 1800, {
    shape: 'box', spreadY: 420, colorA: 0xffd6ae, colorB: 0xfff0e0,
    size: 3.4, drift: 16, rate: 0.05, intensity: 0.34, twinkle: 0.8, maxPx: 22, near: 60,
  }, 21);
  dust.position.y = 150;
  group.add(dust);

  /* ── écailles détachées qui flottent ── */
  const flakeGeos = [];
  for (let i = 0; i < 40; i++) {
    const g = new THREE.CircleGeometry(6 + rnd() * 10, 6);
    g.rotateX(-Math.PI / 2 + (rnd() - 0.5) * 1.2);
    g.rotateY(rnd() * 6.28);
    g.translate((rnd() - 0.5) * 1600, 40 + rnd() * 260, (rnd() - 0.5) * 1600);
    flakeGeos.push(g);
  }
  const flakes = new THREE.Mesh(mergeGeometries(flakeGeos), tissue({
    side: THREE.DoubleSide, flat: true, bump: false,
    deep: 0x8a5c44, mid: 0xe8bfa2, hot: 0xfff0e0,
    noiseScale: 0.02, displace: 0, rim: 0.7, wet: 0.2, shiny: 12,
    falloff: 0.000008, ambient: 0.66, }));
  flakeGeos.forEach(g2 => g2.dispose());
  group.add(flakes);

  /* une dalle bien nette qu'on peut désigner du doigt */
  const CORNE = new THREE.Vector3(150, 12, -140);

  const spots = {
    poil: { p: HERO_TIP.clone(), r: 42, view: HERO_TIP.clone().add(new THREE.Vector3(112, 34, 118)) },
    pore: { p: PORE.clone().add(new THREE.Vector3(0, -60, 0)), r: 105,
            view: PORE.clone().add(new THREE.Vector3(-172, 118, -158)) },
    corne: { p: CORNE.clone(), r: 34, view: CORNE.clone().add(new THREE.Vector3(46, 74, 76)) },
  };

  return {
    group, path, spots, spotFar: 1900,
    speed: 0.0145, freeSpeed: 160, lookAhead: 0.02, fov: 72, shake: 0.35,
    bounds: { type: 'sphere', center: new THREE.Vector3(0, 60, 60), radius: 1250, floor: -400 },
    // plein soleil rasant, ciel bleu en rebond
    light: {
      key:  { dir: [-0.62, 0.55, 0.56], color: 0xffd0a0, int: 0.88 },
      fill: { dir: [0.5, -0.2, -0.6], color: 0x6090ff, int: 0.22 },
      sky:  { top: 0xffb488, bot: 0x401808, int: 0.3 },
    },
    grade: { bloom: 0.38, tint: [1.03, 0.99, 0.95], vig: 0.52, exposure: 0.96 },
    update(t) {
      flakes.rotation.y = t * 0.008;
      drop.position.y = PORE.y + 24 + Math.sin(t * 0.7) * 3;
      sky.rotation.y = t * 0.002;
    },
  };
}
