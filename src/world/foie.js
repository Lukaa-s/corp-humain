import * as THREE from 'three';
import { tissue, pulseStrand, moteField, glow, voidDome } from '../core/mat.js';
import { blob, mergeGeometries, rng, lerp } from '../core/build.js';

/**
 * ESCALE 7 — le lobule hépatique.
 * Le seul endroit du corps où l'architecture est franchement géométrique :
 * des travées d'hépatocytes rayonnant vers une veine centrale, répétées
 * à l'identique jusque dans la brume.
 */
export default function foie(q = 1) {
  const group = new THREE.Group();
  const rnd = rng(707);
  const H = 760, R_IN = 52, R_OUT = 300;

  group.add(new THREE.Mesh(new THREE.SphereGeometry(2400, 30, 20),
    voidDome({ top: 0x2a0c09, bottom: 0x0c0403, cloud: 0x53150f, clouds: 0.4, scale: 0.6 })));

  const lobule = new THREE.Group();

  /* ── veine centrolobulaire ── */
  const vein = new THREE.Mesh(new THREE.CylinderGeometry(R_IN, R_IN * 1.15, H, 44, 1, true), tissue({
    side: THREE.DoubleSide, deep: 0x2a0708, mid: 0x94202c, hot: 0xff8a76,
    noiseScale: 0.03, displace: 4, pulseAmp: 0.3, bumpScale: 0.4, bumpAmp: 0.4,
    normalMix: 0.55, rim: 0.7, wet: 0.5, shiny: 26, falloff: 0.00005, ambient: 0.22,
  }));
  lobule.add(vein);

  const veinGlow = new THREE.Mesh(new THREE.CylinderGeometry(R_IN * 0.8, R_IN * 0.9, H, 30, 1, true),
    glow({ color: 0xff4a44, intensity: 0.16, core: 0.05, power: 2.4, side: THREE.DoubleSide, pulseAmp: 0.6 }));
  lobule.add(veinGlow);

  /* ── travées d'hépatocytes ── */
  const NA = 20, NL = Math.max(4, Math.round(8 * q)), NR = 7;
  const cellGeos = [];
  for (let ai = 0; ai < NA; ai++) {
    const a = (ai / NA) * Math.PI * 2 + 0.05;
    for (let li = 0; li < NL; li++) {
      const y = lerp(-H * 0.46, H * 0.46, li / (NL - 1));
      for (let ri = 0; ri < NR; ri++) {
        const r = lerp(R_IN + 26, R_OUT - 20, ri / (NR - 1));
        const jitter = (rnd() - 0.5) * 0.055;
        const size = 15 + rnd() * 8;
        const g = blob(size, q >= 0.8 ? 2 : 1, (n) => 0.13 * size * Math.sin(n.x * 5) * Math.sin(n.y * 6) * Math.sin(n.z * 5));
        g.scale(1.0, 0.86, 1.5);
        g.rotateY(-(a + jitter));
        g.translate(Math.cos(a + jitter) * r, y + (rnd() - 0.5) * 12, Math.sin(a + jitter) * r);
        cellGeos.push(g);
      }
    }
  }
  const cells = new THREE.Mesh(mergeGeometries(cellGeos), tissue({
    side: THREE.FrontSide, deep: 0x360b06, mid: 0xb84c30, hot: 0xffbe80,
    noiseScale: 0.05, displace: 1.6, bumpScale: 0.5, bumpAmp: 0.3, normalMix: 0.22,
    rim: 0.7, wet: 0.5, shiny: 26, falloff: 0.00001, ambient: 0.24,
  }));
  cellGeos.forEach(g => g.dispose());
  lobule.add(cells);

  /* ── sinusoïdes : le sang va de la périphérie vers le centre ── */
  const sinGeos = [];
  for (let ai = 0; ai < NA; ai++) {
    const a = ((ai + 0.5) / NA) * Math.PI * 2 + 0.05;
    for (let li = 0; li < NL; li++) {
      const y = lerp(-H * 0.44, H * 0.44, li / (NL - 1)) + (rnd() - 0.5) * 10;
      const pts = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        const r = lerp(R_OUT - 6, R_IN + 6, t);
        const aa = a + Math.sin(t * 3.1) * 0.045;
        pts.push(new THREE.Vector3(Math.cos(aa) * r, y + Math.sin(t * 5) * 5, Math.sin(aa) * r));
      }
      sinGeos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 26, 4.4, 6, false));
    }
  }
  const sinus = new THREE.Mesh(mergeGeometries(sinGeos), pulseStrand({
    base: 0x5c1218, spark: 0xffb46a, speed: 0.26, width: 0.1, density: 1.0,
    rim: 0.85, intensity: 1.5, falloff: 0.00001,
  }));
  sinGeos.forEach(g => g.dispose());
  lobule.add(sinus);

  /* ── espaces portes aux six sommets ── */
  const triadGeos = [], bileGeos = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const cx = Math.cos(a) * (R_OUT + 32), cz = Math.sin(a) * (R_OUT + 32);
    const mk = (dx, dz, r, arr) => {
      const g = new THREE.CylinderGeometry(r, r, H * 1.02, 14, 1, true);
      g.translate(cx + dx, 0, cz + dz);
      arr.push(g);
    };
    mk(0, 0, 26, triadGeos);
    mk(Math.cos(a + 1.9) * 40, Math.sin(a + 1.9) * 40, 13, triadGeos);
    mk(Math.cos(a - 1.9) * 40, Math.sin(a - 1.9) * 40, 10, bileGeos);
  }
  const triads = new THREE.Mesh(mergeGeometries(triadGeos), tissue({
    side: THREE.DoubleSide, deep: 0x2a0a1c, mid: 0x8e3a5c, hot: 0xffa0b8,
    noiseScale: 0.04, displace: 2.5, bumpScale: 0.4, bumpAmp: 0.3, normalMix: 0.4,
    rim: 0.8, wet: 0.5, shiny: 26, falloff: 0.00004, ambient: 0.18,
  }));
  triadGeos.forEach(g => g.dispose());
  lobule.add(triads);

  const bile = new THREE.Mesh(mergeGeometries(bileGeos), pulseStrand({
    base: 0x4a4818, spark: 0xc8cc70, speed: -0.18, width: 0.12, density: 0.8,
    rim: 0.6, intensity: 0.7, falloff: 0.00001,
  }));
  bileGeos.forEach(g => g.dispose());
  lobule.add(bile);

  /* ── hexagone lumineux marquant la limite du lobule ── */
  const hexPts = [];
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    hexPts.push(new THREE.Vector3(Math.cos(a) * (R_OUT + 32), 0, Math.sin(a) * (R_OUT + 32)));
  }
  const hexGeos = [];
  for (let li = 0; li < 3; li++) {
    const y = lerp(-H * 0.42, H * 0.42, li / 2);
    const pts = hexPts.map(p => p.clone().setY(y));
    hexGeos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0), 90, 3, 5, false));
  }
  const hex = new THREE.Mesh(mergeGeometries(hexGeos), glow({ color: 0xffb060, intensity: 0.5, core: 0.35, power: 2.0, side: THREE.DoubleSide }));
  hexGeos.forEach(g => g.dispose());
  lobule.add(hex);

  group.add(lobule);

  /* ── le motif se répète : six voisins dans la brume ── */
  const D = (R_OUT + 32) * 2.05;
  // Trois voisins suffisent à faire comprendre que le motif se répète ; six
  // triplaient la charge géométrique pour des lobules noyés dans la brume.
  const NEIGH = q >= 0.8 ? 3 : 2;
  for (let i = 0; i < NEIGH; i++) {
    const a = (i / 6) * Math.PI * 2;
    const c = lobule.clone();
    c.position.set(Math.cos(a) * D, (i % 2 ? 1 : -1) * 30, Math.sin(a) * D);
    c.rotation.y = rnd() * 0.4;
    group.add(c);
  }

  const dust = moteField(Math.round(1800 * q), 900, {
    shape: 'sphere', colorA: 0xffb060, colorB: 0xff6a4a, size: 5.5,
    drift: 12, rate: 0.1, intensity: 0.45, twinkle: 0.7,
  }, 77);
  group.add(dust);

  // On arrive de l'extérieur, en surplomb : la première image doit montrer
  // l'hexagone entier et ses travées qui rayonnent, pas un mur de cellules.
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(430, H * 0.86, 400),
    new THREE.Vector3(330, H * 0.62, 300),
    new THREE.Vector3(300, H * 0.20, 250),
    new THREE.Vector3(268, -H * 0.06, 208),
    new THREE.Vector3(190, -H * 0.24, 150),
    new THREE.Vector3(112, -H * 0.30, 92),
    new THREE.Vector3(96, -H * 0.12, 74),
    new THREE.Vector3(120, H * 0.14, 96),
    new THREE.Vector3(230, H * 0.30, 200),
    new THREE.Vector3(430, H * 0.34, 400),
    new THREE.Vector3(700, H * 0.30, 620),
  ]);
  path.curveType = 'centripetal';

  const hepP = new THREE.Vector3(Math.cos(0.4) * 175, -40, Math.sin(0.4) * 175);
  const sinP = new THREE.Vector3(Math.cos(1.55) * 210, 20, Math.sin(1.55) * 210);
  const bileP = new THREE.Vector3(Math.cos(Math.PI / 6 - 1.9) * 40 + Math.cos(Math.PI / 6) * (R_OUT + 32),
    -60, Math.sin(Math.PI / 6 - 1.9) * 40 + Math.sin(Math.PI / 6) * (R_OUT + 32));
  const spots = {
    lobule: { p: new THREE.Vector3(0, 0, 0), r: R_OUT + 40,
              view: new THREE.Vector3(560, H * 0.36, 500) },
    hepatocyte: { p: hepP.clone(), r: 26,
                  view: hepP.clone().multiplyScalar(0.72).add(new THREE.Vector3(0, 26, 0)) },
    sinusoide: { p: sinP.clone(), r: 18,
                 view: sinP.clone().multiplyScalar(0.78).add(new THREE.Vector3(0, 34, 0)) },
    bile: { p: bileP.clone(), r: 22, view: bileP.clone().multiplyScalar(0.82).add(new THREE.Vector3(0, 40, 0)) },
  };

  return {
    group, path, spots, spotFar: 720,
    speed: 0.0078, freeSpeed: 110, lookAhead: 0.02, fov: 76, shake: 0.3,
    bounds: { type: 'sphere', center: new THREE.Vector3(200, 0, 150), radius: 900 },
    // grenat profond, usine chimique
    light: {
      key:  { dir: [0.2, 1, 0.15], color: 0xffa060, int: 0.42 },
      fill: { dir: [-0.6, -0.3, -0.5], color: 0x5a1030, int: 0.2 },
      sky:  { top: 0x7a2418, bot: 0x1a0408, int: 0.18 },
    },
    grade: { bloom: 0.66, tint: [1.08, 0.98, 0.9], vig: 0.6, exposure: 1.0 },
    update(t, dt, pulse, breath, cam) { if (cam) dust.position.copy(cam.position); },
  };
}
