import * as THREE from 'three';
import { tissue, membrane, pulseStrand, stalkField, spindle, instanced, moteField, glow, voidDome } from '../core/mat.js';
import { mergeGeometries, rng, lerp } from '../core/build.js';

/**
 * ESCALE 8 — le néphron.
 * Un peloton capillaire sous pression dans sa capsule, l'ultrafiltrat qui
 * s'en échappe, puis la longue épingle à cheveux de l'anse de Henle.
 */
export default function rein(q = 1) {
  const group = new THREE.Group();
  const rnd = rng(808);
  const CAPS = 300;

  group.add(new THREE.Mesh(new THREE.SphereGeometry(2600, 30, 20),
    voidDome({ top: 0x111c3a, bottom: 0x04060f, cloud: 0x25407a, clouds: 0.45, scale: 0.6 })));

  /* ── peloton glomérulaire ── */
  const loopGeos = [], surfacePts = [];
  for (let i = 0; i < 16; i++) {
    const pts = [];
    const base = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      const r = 70 + rnd() * 105;
      const v = new THREE.Vector3(
        Math.cos(a) * r + base.x * 60,
        Math.sin(a) * r * (0.5 + rnd() * 0.7) + base.y * 60,
        Math.sin(a * 1.7 + i) * r * 0.7 + base.z * 60);
      pts.push(v);
      surfacePts.push(v);
    }
    const c = new THREE.CatmullRomCurve3(pts, true);
    loopGeos.push(new THREE.TubeGeometry(c, 130, 12 + rnd() * 5, 9, true));
  }
  const glom = new THREE.Mesh(mergeGeometries(loopGeos), tissue({
    side: THREE.FrontSide, deep: 0x330d28, mid: 0xcc4260, hot: 0xffa8bc,
    noiseScale: 0.05, displace: 1.6, pulseAmp: 0.5,
    bumpScale: 0.5, bumpAmp: 0.35, normalMix: 0.4,
    rim: 0.95, wet: 0.4, shiny: 26, falloff: 0.000007, ambient: 0.36, light: 1.85,
  }));
  loopGeos.forEach(g => g.dispose());
  group.add(glom);

  /* ── podocytes accrochés au peloton ── */
  const NP = Math.round(900 * q);
  const pPos = new Float32Array(NP * 3), pDir = new Float32Array(NP * 3),
        pSc = new Float32Array(NP * 2), pSeed = new Float32Array(NP);
  for (let i = 0; i < NP; i++) {
    const a = surfacePts[Math.floor(rnd() * surfacePts.length)];
    const b = surfacePts[Math.floor(rnd() * surfacePts.length)];
    const base = a.clone().lerp(b, rnd() * 0.25);
    const d = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
    const p = base.clone().addScaledVector(d, 12);
    pPos[i * 3] = p.x; pPos[i * 3 + 1] = p.y; pPos[i * 3 + 2] = p.z;
    pDir[i * 3] = d.x; pDir[i * 3 + 1] = d.y; pDir[i * 3 + 2] = d.z;
    pSc[i * 2] = 1.6 + rnd() * 1.6; pSc[i * 2 + 1] = 8 + rnd() * 10;
    pSeed[i] = rnd();
  }
  const podo = new THREE.Mesh(instanced(spindle(5, 3), NP, {
    aPos: { array: pPos, size: 3 }, aDir: { array: pDir, size: 3 },
    aScale: { array: pSc, size: 2 }, aSeed: { array: pSeed, size: 1 },
  }), stalkField({
    root: 0x3a2050, tip: 0xa8c8ff, hot: 0xe0f0ff,
    sway: 0.16, rate: 1.0, rim: 0.9, wet: 0.4, ambient: 0.38, falloff: 0.00002, tipGlow: 0.3,
  }));
  podo.frustumCulled = false;
  group.add(podo);

  /* ── capsule de Bowman ── */
  const caps = new THREE.Mesh(new THREE.SphereGeometry(CAPS, 52, 34), membrane({
    inner: 0x101a38, edge: 0xbcd8ff, power: 2.4, base: 0.05, rimAlpha: 0.75,
    glow: 0.5, irid: 0.08, alpha: 0.92, wobble: 4, noiseScale: 0.012,
  }));
  caps.renderOrder = 3;
  group.add(caps);

  /* ── artérioles afférente et efférente ── */
  const artGeos = [];
  for (const [dx, r] of [[-1, 30], [1, 22]]) {
    const pts = [
      new THREE.Vector3(dx * 620, 120 * dx, -180),
      new THREE.Vector3(dx * 400, 70 * dx, -120),
      new THREE.Vector3(dx * 230, 30 * dx, -60),
      new THREE.Vector3(dx * 110, 6, -14),
    ];
    artGeos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, r, 12, false));
  }
  const arts = new THREE.Mesh(mergeGeometries(artGeos), tissue({
    side: THREE.DoubleSide, deep: 0x2a0a1e, mid: 0xb03a50, hot: 0xffa0a8,
    noiseScale: 0.03, displace: 2.5, pulseAmp: 0.4, bumpScale: 0.4, bumpAmp: 0.3,
    normalMix: 0.4, rim: 0.85, wet: 0.45, shiny: 28, falloff: 0.00001, ambient: 0.3,
  }));
  artGeos.forEach(g => g.dispose());
  group.add(arts);

  /* ── tubule : proximal, anse de Henle, collecteur ── */
  const tubPts = [];
  tubPts.push(new THREE.Vector3(0, -CAPS * 0.86, 30));
  for (let i = 0; i <= 26; i++) {           // spirale descendante
    const t = i / 26, a = t * Math.PI * 4.2;
    tubPts.push(new THREE.Vector3(Math.cos(a) * (200 - t * 40), -320 - t * 620, Math.sin(a) * (200 - t * 40) + 120));
  }
  for (let i = 1; i <= 10; i++) {           // épingle
    const t = i / 10, a = Math.PI * t;
    tubPts.push(new THREE.Vector3(Math.cos(4.2 * Math.PI) * 160 - Math.sin(a) * 190,
      -940 - Math.sin(a) * 130 + t * 20, 120 + Math.sin(4.2 * Math.PI) * 160 - (1 - Math.cos(a)) * 90));
  }
  for (let i = 1; i <= 22; i++) {           // remontée
    const t = i / 22, a = 4.2 * Math.PI - t * Math.PI * 3.4;
    tubPts.push(new THREE.Vector3(Math.cos(a) * (300 - t * 30) - 40, -920 + t * 620, Math.sin(a) * (300 - t * 30) + 60));
  }
  const tubCurve = new THREE.CatmullRomCurve3(tubPts);
  tubCurve.curveType = 'centripetal';
  const tubule = new THREE.Mesh(new THREE.TubeGeometry(tubCurve, 640, 56, 26, false), tissue({
    side: THREE.BackSide, deep: 0x141c3c, mid: 0x5878b8, hot: 0xd4ecff,
    noiseScale: 0.035, displace: 3.5, pulseAmp: 0.15,
    bumpScale: 0.5, bumpAmp: 0.42, normalMix: 0.5,
    rim: 0.7, wet: 0.5, shiny: 28, falloff: 0.00012, ambient: 0.24, light: 1.35,
    vein: true, veinAmt: 0.3, veinScale: 0.1,
  }));
  group.add(tubule);

  const tubGlow = new THREE.Mesh(new THREE.TubeGeometry(tubCurve, 320, 62, 12, false),
    pulseStrand({ base: 0x14203f, spark: 0x9fd0ff, speed: 0.16, width: 0.05, density: 6, rim: 0.6, intensity: 1.1, falloff: 0.00012, additive: true, alpha: 0.5, depthWrite: false }));
  group.add(tubGlow);

  /* ── ultrafiltrat ── */
  const filtrate = moteField(Math.round(1500 * q), 620, {
    shape: 'sphere', colorA: 0x8fc4f0, colorB: 0xd8ecff,
    size: 3.4, drift: 24, rate: 0.24, intensity: 0.34, twinkle: 0.9, maxPx: 20, near: 40,
  }, 82);
  group.add(filtrate);

  const core = new THREE.Mesh(new THREE.SphereGeometry(26, 20, 14),
    glow({ color: 0x9fd8ff, intensity: 0.7, core: 0.5, power: 2.2, pulseAmp: 1.2 }));
  group.add(core);

  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-560, 260, -520),
    new THREE.Vector3(-330, 170, -330),
    new THREE.Vector3(-190, 60, -120),
    new THREE.Vector3(-40, -30, 190),
    new THREE.Vector3(180, 60, 210),
    new THREE.Vector3(230, 150, -60),
    new THREE.Vector3(60, 200, -220),
    new THREE.Vector3(-90, 100, -160),
    new THREE.Vector3(-20, -140, 60),
    ...Array.from({ length: 26 }, (_, i) => tubCurve.getPointAt(lerp(0.02, 0.98, i / 25))),
  ]);
  path.curveType = 'centripetal';

  const spots = {
    glomerule: new THREE.Vector3(0, 0, 0),
    bowman: new THREE.Vector3(0, CAPS * 0.72, -CAPS * 0.5),
    henle: tubCurve.getPointAt(0.62),
    collecteur: tubCurve.getPointAt(0.94),
  };

  return {
    group, path, spots, spotFar: 950,
    focus: { point: new THREE.Vector3(0, 0, 0), from: 0.06, to: 0.42, fade: 0.1 },
    speed: 0.0072, freeSpeed: 110, lookAhead: 0.012, fov: 72, shake: 0.35,
    bounds: { type: 'sphere', center: new THREE.Vector3(0, -300, 60), radius: 1100 },
    // lumière froide et propre de salle blanche
    light: {
      key:  { dir: [0.2, 1, 0.2], color: 0xbcd8ff, int: 0.5 },
      fill: { dir: [-0.4, -0.6, -0.5], color: 0x2050a0, int: 0.26 },
      sky:  { top: 0x90b0ff, bot: 0x101a30, int: 0.24 },
    },
    grade: { bloom: 0.72, tint: [0.95, 0.99, 1.08], vig: 0.55, exposure: 1.06 },
    update(t, dt, pulse, breath, cam) {
      if (cam) filtrate.position.copy(cam.position);
      glom.rotation.y = t * 0.02;
      podo.rotation.y = t * 0.02;
    },
  };
}
