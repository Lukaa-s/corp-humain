import * as THREE from 'three';
import { tissue, driftCells, moteField, glow, membrane } from '../core/mat.js';
import { blob, rng, mergeGeometries } from '../core/build.js';

/**
 * ESCALE 5 — la cavité gastrique.
 * Des plis longitudinaux qui se referment en vagues, une brume acide,
 * des bulles qui montent et un repas en train de se défaire.
 */
export default function estomac(q = 1) {
  const group = new THREE.Group();
  const rnd = rng(505);
  const R = 330;

  /* ── paroi : plis gastriques ── */
  // On garde la formule sous la main : les puits à acide devront se creuser
  // exactement dans la surface, pas flotter devant.
  const wallDisp = (n) => {
    const ang = Math.atan2(n.z, n.x);
    const ridge = Math.sin(ang * 9 + n.y * 3.2) * 0.5 + 0.5;
    const ridge2 = Math.sin(ang * 17 - n.y * 5) * 0.5 + 0.5;
    const band = 0.55 + 0.45 * Math.sin(n.y * 6.5);
    return (ridge * 46 + ridge2 * 16) * band - Math.abs(n.y) * 26;
  };
  const wallAt = (v) => { const n = v.clone().normalize(); return n.multiplyScalar(R + wallDisp(n)); };
  const wallGeo = blob(R, 6, wallDisp);
  const wallMat = tissue({
    side: THREE.BackSide,
    deep: 0x4c380f, mid: 0xc09a3e, hot: 0xffe49c,
    noiseScale: 0.018, displace: 10, pulseAmp: 0.35,
    bumpScale: 0.22, bumpAmp: 0.34, normalMix: 0.12,
    rim: 0.5, wet: 0.26, shiny: 18, falloff: 0.000013, ambient: 0.34, light: 1.15, wrap: 0.62,
    vein: true, veinAmt: 0.4, veinScale: 0.045, ao: 0.62,
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  group.add(wall);

  /* ── onde de brassage : un bourrelet qui descend ── */
  const wave = new THREE.Mesh(new THREE.TorusGeometry(R * 0.86, 46, 14, 64), tissue({
    side: THREE.DoubleSide, deep: 0x4a3410, mid: 0xd8ac4c, hot: 0xfff0b0,
    noiseScale: 0.02, displace: 12, pulseAmp: 0.2, bumpScale: 0.3, bumpAmp: 0.36,
    normalMix: 0.16, rim: 0.7, wet: 0.4, shiny: 18, falloff: 0.00001, ambient: 0.36, light: 1.3,
  }));
  wave.rotation.x = Math.PI / 2;
  group.add(wave);

  /* ── entrée (cardia) et sortie (pylore) ── */
  const mkPort = (y, r, tube) => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 12, 44), tissue({
      side: THREE.DoubleSide, deep: 0x241703, mid: 0x9c7726, hot: 0xffd97e,
      noiseScale: 0.03, displace: 5, bumpScale: 0.35, bumpAmp: 0.4, normalMix: 0.5,
      rim: 0.8, wet: 0.5, shiny: 24, falloff: 0.00005, ambient: 0.2,
    }));
    m.rotation.x = Math.PI / 2; m.position.y = y;
    return m;
  };
  group.add(mkPort(R * 0.82, 62, 26));
  group.add(mkPort(-R * 0.84, 40, 20));

  /* ── bol alimentaire en cours de dissolution ── */
  const NF = Math.round(120 * q);
  const fPos = new Float32Array(NF * 3), fSize = new Float32Array(NF),
        fSeed = new Float32Array(NF), fSpin = new Float32Array(NF);
  for (let i = 0; i < NF; i++) {
    const u = rnd() * 2 - 1, a = rnd() * 6.28, rr = 250 * Math.cbrt(rnd());
    const s = Math.sqrt(1 - u * u);
    fPos[i * 3] = rr * s * Math.cos(a); fPos[i * 3 + 1] = rr * u * 0.42 - 148; fPos[i * 3 + 2] = rr * s * Math.sin(a);
    fSize[i] = 5 + rnd() * 15; fSeed[i] = rnd(); fSpin[i] = (rnd() - 0.5) * 1.5;
  }
  const chunkSrc = blob(1, 3, (n) => 0.22 * Math.sin(n.x * 7) * Math.sin(n.y * 6) * Math.sin(n.z * 8));
  const chunkGeo = new THREE.InstancedBufferGeometry();
  chunkGeo.index = chunkSrc.index;
  for (const k in chunkSrc.attributes) chunkGeo.setAttribute(k, chunkSrc.attributes[k]);
  chunkGeo.setAttribute('aPos', new THREE.InstancedBufferAttribute(fPos, 3));
  chunkGeo.setAttribute('aSize', new THREE.InstancedBufferAttribute(fSize, 1));
  chunkGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(fSeed, 1));
  chunkGeo.setAttribute('aSpin', new THREE.InstancedBufferAttribute(fSpin, 1));
  chunkGeo.instanceCount = NF;
  chunkGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  const chunks = new THREE.Mesh(chunkGeo, driftCells({
    deep: 0x2e1a06, mid: 0x9a6a2c, hot: 0xe8c078,
    drift: 22, rate: 0.09, spinRate: 0.5, falloff: 0.00005,
    rim: 0.7, wet: 0.35, ambient: 0.34, clear: 90,
  }));
  chunks.frustumCulled = false;
  group.add(chunks);

  /* ── bulles qui remontent ──
     Elles étaient dix fois trop nombreuses et trop brillantes : au-dessus de
     la tête, ça faisait un banc de neige électronique. */
  const bubbles = moteField(Math.round(420 * q), 600, {
    shape: 'box', spreadY: 640, spreadZ: 600,
    colorA: 0xffe89a, colorB: 0xd8ff9a, size: 5.5, drift: 10, rate: 0.14,
    intensity: 0.2, twinkle: 0.5, rise: 34, spanY: 640, maxPx: 22, near: 46,
  }, 55);
  group.add(bubbles);

  /* ── brume acide ── */
  const haze = new THREE.Mesh(new THREE.SphereGeometry(R * 0.98, 26, 18),
    glow({ color: 0xc8a83c, intensity: 0.10, core: 0.05, power: 1.8, side: THREE.BackSide }));
  group.add(haze);

  /* ══════════ le champ de puits à acide ══════════
     La mission dit « trouve d'où sort l'acide » et le repère pointait un mur
     nu. L'acide sort de puits creusés dans la paroi, serrés les uns contre
     les autres, et chacun crache un filet plus clair et plus lourd que le
     reste. Voici ce champ, planté à un endroit précis pour qu'on puisse
     vraiment le trouver.  */
  const PITS = new THREE.Vector3(228, -46, 162);   // centre du champ
  const pitsN = PITS.clone().normalize();
  const pitUp = new THREE.Vector3(0, 1, 0).cross(pitsN).normalize();
  const pitRt = pitsN.clone().cross(pitUp).normalize();

  /* Le champ est une pièce de paroi à part, très finement maillée, dans
     laquelle les puits sont réellement creusés. Poser des cônes séparés
     devant le mur donnait des anneaux qui flottaient. */
  const PATCH_A = 0.30;                    // demi-angle du morceau de paroi
  const pitList = [];
  for (let i = 0; i < 24; i++) {
    const a = rnd() * 6.28, rr = Math.sqrt(rnd()) * 0.82;
    pitList.push({
      u: Math.cos(a) * rr, v: Math.sin(a) * rr,
      w: 0.10 + rnd() * 0.07, d: 34 + rnd() * 28,
    });
  }
  const RINGS = 132, SECT = 132;
  const ppos = [], pidx = [];
  const _n = new THREE.Vector3();
  const pitDepth = (u, v) => {
    let d = 0;
    for (const p of pitList) {
      const q2 = Math.hypot(u - p.u, v - p.v) / p.w;
      d += p.d / (1 + Math.pow(q2, 5));    // puits à fond plat, bord net
    }
    return d;
  };
  for (let i = 0; i <= RINGS; i++) {
    for (let j = 0; j <= SECT; j++) {
      const u = (i / RINGS) * 2 - 1, v = (j / SECT) * 2 - 1;
      _n.copy(pitsN).addScaledVector(pitUp, u * PATCH_A).addScaledVector(pitRt, v * PATCH_A).normalize();
      const r = R + wallDisp(_n) - pitDepth(u, v) - 1.5;
      ppos.push(_n.x * r, _n.y * r, _n.z * r);
    }
  }
  for (let i = 0; i < RINGS; i++) for (let j = 0; j < SECT; j++) {
    const A = i * (SECT + 1) + j, B = A + SECT + 1;
    pidx.push(A, B, A + 1, B, B + 1, A + 1);
  }
  const patchGeo = new THREE.BufferGeometry();
  patchGeo.setAttribute('position', new THREE.Float32BufferAttribute(ppos, 3));
  patchGeo.setIndex(pidx);
  patchGeo.computeVertexNormals();
  patchGeo.computeBoundingSphere();
  const pits = new THREE.Mesh(patchGeo, tissue({
    side: THREE.DoubleSide, deep: 0x1c1204, mid: 0xb08a2c, hot: 0xffe89a,
    noiseScale: 0.05, displace: 1.2, bumpScale: 0.5, bumpAmp: 0.3, normalMix: 0.1,
    rim: 0.6, wet: 0.5, shiny: 30, falloff: 0.000012, ambient: 0.22, light: 1.15, ao: 0.7,
  }));
  group.add(pits);

  // un point par puits, pour accrocher les filets d'acide
  const pitCenters = pitList.map(p => {
    const n = pitsN.clone().addScaledVector(pitUp, p.u * PATCH_A).addScaledVector(pitRt, p.v * PATCH_A).normalize();
    return n.multiplyScalar(R + wallDisp(n) - p.d * 0.5);
  });

  // le filet d'acide qui sort de chaque puits
  const jetGeos = [];
  for (const c of pitCenters) {
    const dir = c.clone().normalize().multiplyScalar(-1);
    const pts = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      pts.push(c.clone().addScaledVector(dir, t * (70 + rnd() * 60))
        .add(new THREE.Vector3((rnd() - 0.5) * 14 * t, -t * t * 40, (rnd() - 0.5) * 14 * t)));
    }
    jetGeos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 18, 2.6, 5, false));
  }
  const jets = new THREE.Mesh(mergeGeometries(jetGeos), membrane({
    inner: 0x6a6414, edge: 0xfffcc8, power: 1.8, base: 0.1, rimAlpha: 0.9, glow: 1.0, irid: 0.18, alpha: 0.62,
  }));
  jetGeos.forEach(g => g.dispose());
  group.add(jets);

  const pitGlow = new THREE.Mesh(new THREE.SphereGeometry(130, 20, 14),
    glow({ color: 0xffe070, intensity: 0.13, core: 0.0, power: 2.6, flicker: 0.1 }));
  pitGlow.position.copy(wallAt(PITS).multiplyScalar(0.9));
  group.add(pitGlow);

  /* ── gouttes d'acide ailleurs sur la paroi ── */
  const dropGeos = [];
  for (let i = 0; i < Math.round(70 * q); i++) {
    const u = rnd() * 2 - 1, a = rnd() * 6.28, s = Math.sqrt(1 - u * u);
    const rr = R * 0.78;
    const g = new THREE.SphereGeometry(5 + rnd() * 12, 10, 8);
    g.translate(rr * s * Math.cos(a), rr * u, rr * s * Math.sin(a));
    dropGeos.push(g);
  }
  const drops = new THREE.Mesh(mergeGeometries(dropGeos), membrane({
    inner: 0x4a4210, edge: 0xfff4c0, power: 2.2, base: 0.07, rimAlpha: 0.85, glow: 0.6, alpha: 0.8,
  }));
  dropGeos.forEach(g => g.dispose());
  group.add(drops);

  /* ══════════ le bouclier de mucus ══════════
     Une nappe translucide décollée de la paroi, avec sa frange visible sur
     la tranche : on voit d'un coup d'œil l'épaisseur de gel qui sépare
     l'acide des cellules vivantes. Même construction que le champ de puits,
     un morceau de sphère et rien de plus. */
  const MUC = new THREE.Vector3(128, 176, -184);
  const mucN = MUC.clone().normalize();
  const mucU = new THREE.Vector3(0, 1, 0).cross(mucN).normalize();
  const mucR = mucN.clone().cross(mucU).normalize();
  const MUC_A = 0.26, MG = 46;
  const mpos = [], midx = [];
  for (let i = 0; i <= MG; i++) for (let j = 0; j <= MG; j++) {
    const u = (i / MG) * 2 - 1, v = (j / MG) * 2 - 1;
    const fade = Math.max(0, 1 - Math.hypot(u, v));      // la nappe s'amincit au bord
    const n = mucN.clone().addScaledVector(mucU, u * MUC_A).addScaledVector(mucR, v * MUC_A).normalize();
    const r = R + wallDisp(n) - 6 - 30 * Math.pow(fade, 0.5);
    mpos.push(n.x * r, n.y * r, n.z * r);
  }
  for (let i = 0; i < MG; i++) for (let j = 0; j < MG; j++) {
    const A = i * (MG + 1) + j, B = A + MG + 1;
    midx.push(A, B, A + 1, B, B + 1, A + 1);
  }
  const mucGeo = new THREE.BufferGeometry();
  mucGeo.setAttribute('position', new THREE.Float32BufferAttribute(mpos, 3));
  mucGeo.setIndex(midx);
  mucGeo.computeVertexNormals();
  mucGeo.computeBoundingSphere();
  const mucus = new THREE.Mesh(mucGeo, membrane({
    inner: 0x5a5a1e, edge: 0xf8fcd0, power: 1.6, base: 0.16, rimAlpha: 0.62, glow: 0.35, irid: 0.35, alpha: 0.55,
  }));
  group.add(mucus);

  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(50, 168, 186),
    new THREE.Vector3(-30, 110, 10),
    new THREE.Vector3(-180, 90, -60),
    new THREE.Vector3(-150, -10, 120),
    new THREE.Vector3(40, 40, 200),
    new THREE.Vector3(180, -20, 90),
    new THREE.Vector3(140, -110, -110),
    new THREE.Vector3(-20, -60, -180),
    new THREE.Vector3(-90, -160, -40),
    new THREE.Vector3(0, -230, 20),
    new THREE.Vector3(0, -300, 0),
  ]);
  path.curveType = 'centripetal';

  const acideP = wallAt(PITS).multiplyScalar(0.94);
  const spots = {
    plis: { p: new THREE.Vector3(-250, 60, -120), r: 78,
            view: new THREE.Vector3(-250, 60, -120).multiplyScalar(0.42) },
    acide: { p: acideP.clone(), r: 92, view: acideP.clone().multiplyScalar(0.42).add(new THREE.Vector3(0, 30, 0)) },
    mucus: { p: MUC.clone().setLength(R * 0.8), r: 96, view: MUC.clone().multiplyScalar(0.4) },
    chyme: { p: new THREE.Vector3(-40, -120, 60), r: 70, view: new THREE.Vector3(-150, -40, 190) },
  };

  let wy = R * 0.7;
  return {
    group, path, spots, spotFar: 520,
    speed: 0.0095, freeSpeed: 100, lookAhead: 0.016, fov: 76, shake: 0.55,
    bounds: { type: 'sphere', center: new THREE.Vector3(0, 0, 0), radius: R * 0.9 },
    // ambre acide, complément vert : ça tourne au vinaigre
    light: {
      key:  { dir: [0.15, 0.9, 0.2], color: 0xffc040, int: 0.34 },
      fill: { dir: [-0.4, -0.85, 0.3], color: 0x3a5a22, int: 0.34 },
      sky:  { top: 0x8a6010, bot: 0x2e2008, int: 0.24 },
    },
    grade: { bloom: 0.38, tint: [1.05, 1.02, 0.9], vig: 0.66, exposure: 0.88 },
    update(t, dt) {
      wy -= dt * 105;
      if (wy < -R * 0.9) wy = R * 0.8;
      wave.position.y = wy;
      const k = Math.max(0.15, 1 - Math.abs(wy) / (R * 0.95));
      wave.scale.setScalar(0.55 + 0.5 * k);
      wave.rotation.z = t * 0.05;
      chunks.rotation.y = t * 0.02;
    },
  };
}
