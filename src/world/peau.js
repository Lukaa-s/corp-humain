import * as THREE from 'three';
import { tissue, membrane, glow, voidDome, moteField, U } from '../core/mat.js';
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

  /* ── le sol : couche cornée ── */
  const gGeo = new THREE.PlaneGeometry(3000, 3000, 300, 300);
  gGeo.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(gGeo, tissue({
    side: THREE.FrontSide,
    deep: 0x5a2a1a, mid: 0xd08f6e, hot: 0xffe4ca,
    noiseScale: 0.0048, displace: 30, pulseAmp: 0.0,
    bumpScale: 0.09, bumpAmp: 0.42, normalMix: 0.7,
    rim: 0.2, wet: 0.14, shiny: 16, falloff: 0.0000045,
    ambient: 0.62, light: 1.0,
    crack: 0.72, crackScale: 0.03,
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

  let placed = 0, tries = 0;
  while (placed < 34 && tries < 900) {
    tries++;
    const x = (rnd() - 0.5) * 2400, z = (rnd() - 0.5) * 2400;
    const p = new THREE.Vector3(x, 0, z);
    if (p.distanceTo(PORE) < 260) continue;
    if (guard.some(gp => Math.hypot(gp.x - x, gp.z - z) < 95)) continue;
    placed++;
    const h = 130 + rnd() * 210;
    const tilt = new THREE.Vector3((rnd() - 0.5) * 0.5, 1, (rnd() - 0.5) * 0.5).normalize();
    let cur = p.clone().setY(-14);
    let dir = tilt.clone();
    let r = 17 + rnd() * 11;
    for (let s = 0; s < 6; s++) {
      const len = h / 6;
      const nxt = cur.clone().addScaledVector(dir, len);
      hairSegs.push({ a: cur.clone(), b: nxt, r0: r, r1: r * 0.84 });
      cur = nxt; r *= 0.84;
      dir.x += (rnd() - 0.5) * 0.16; dir.z += (rnd() - 0.5) * 0.16;
      dir.normalize();
    }
  }
  const hairs = segmentsToMesh(hairSegs, tissue({
    side: THREE.DoubleSide, deep: 0x4a2412, mid: 0xc98a58, hot: 0xffe0b8,
    noiseScale: 0.05, displace: 0.9, bumpScale: 0.3, bumpAmp: 0.25, normalMix: 0.4,
    rim: 0.9, wet: 0.45, shiny: 30, falloff: 0.0000075, ambient: 0.5,
    }), 8);
  group.add(hairs);

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

  const spots = {
    poil: hairSegs.length ? hairSegs[Math.min(11, hairSegs.length - 1)].b.clone() : new THREE.Vector3(0, 120, 0),
    pore: PORE.clone().add(new THREE.Vector3(-96, 24, 0)),
    corne: new THREE.Vector3(-190, 34, 120),
  };

  return {
    group, path, spots, spotFar: 1500,
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
