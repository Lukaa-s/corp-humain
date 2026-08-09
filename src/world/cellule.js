import * as THREE from 'three';
import { tissue, membrane, glow, driftCells, moteField, pulseStrand, voidDome } from '../core/mat.js';
import { blob, mergeGeometries, helixRibbon, rng, lerp } from '../core/build.js';

/**
 * ESCALE 11 — l'intérieur d'une cellule, puis le noyau.
 * Mitochondries, réticulum, ribosomes ; et pour finir, l'ADN :
 * deux mètres de code pliés dans quelques microns.
 */
export default function cellule(q = 1) {
  const group = new THREE.Group();
  const rnd = rng(1111);
  const NUC = new THREE.Vector3(0, 0, 900), NR = 300;

  group.add(new THREE.Mesh(new THREE.SphereGeometry(3400, 30, 20),
    voidDome({ top: 0x06222a, bottom: 0x02080c, cloud: 0x0d4a52, clouds: 0.5, scale: 0.5 })));

  /* ── membrane plasmique ── */
  const cellMem = new THREE.Mesh(new THREE.SphereGeometry(1500, 56, 38), membrane({
    inner: 0x062028, edge: 0x8ff0e0, power: 2.6, base: 0.035, rimAlpha: 0.55,
    glow: 0.4, irid: 0.14, alpha: 0.8, wobble: 26, noiseScale: 0.0025,
  }));
  cellMem.position.z = 300;
  group.add(cellMem);

  /* ── cytosquelette ── */
  const fibGeos = [];
  for (let i = 0; i < Math.round(40 * q); i++) {
    const a = new THREE.Vector3((rnd() - 0.5) * 2200, (rnd() - 0.5) * 1600, (rnd() - 0.5) * 2000 + 300);
    const b = a.clone().add(new THREE.Vector3((rnd() - 0.5) * 1400, (rnd() - 0.5) * 1000, (rnd() - 0.5) * 1400));
    const mid = a.clone().lerp(b, 0.5).add(new THREE.Vector3((rnd() - 0.5) * 300, (rnd() - 0.5) * 300, (rnd() - 0.5) * 300));
    fibGeos.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a, mid, b]), 30, 2.6 + rnd() * 2, 5, false));
  }
  const fibers = new THREE.Mesh(mergeGeometries(fibGeos), pulseStrand({
    base: 0x1c4a50, spark: 0x9ff0e0, speed: 0.2, width: 0.04, density: 1.6,
    rim: 0.7, intensity: 0.9, falloff: 0.000012,
  }));
  fibGeos.forEach(g => g.dispose());
  group.add(fibers);

  /* ── mitochondries ── */
  const NM = Math.round(70 * q);
  const mPos = new Float32Array(NM * 3), mSize = new Float32Array(NM),
        mSeed = new Float32Array(NM), mSpin = new Float32Array(NM);
  for (let i = 0; i < NM; i++) {
    const u = rnd() * 2 - 1, a = rnd() * 6.28, rr = 1150 * Math.cbrt(rnd());
    const s = Math.sqrt(1 - u * u);
    const p = new THREE.Vector3(rr * s * Math.cos(a), rr * u * 0.8, rr * s * Math.sin(a) + 300);
    if (p.distanceTo(NUC) < NR + 120) p.multiplyScalar(0.55);
    mPos[i * 3] = p.x; mPos[i * 3 + 1] = p.y; mPos[i * 3 + 2] = p.z;
    mSize[i] = 26 + rnd() * 34; mSeed[i] = rnd(); mSpin[i] = (rnd() - 0.5) * 0.8;
  }
  const mitoSrc = blob(1, 2, (n) => 0.16 * Math.sin(n.y * 22) + 0.05 * Math.sin(n.x * 7));
  mitoSrc.scale(0.55, 1.7, 0.55);
  const mg = new THREE.InstancedBufferGeometry();
  mg.index = mitoSrc.index;
  for (const k in mitoSrc.attributes) mg.setAttribute(k, mitoSrc.attributes[k]);
  mg.setAttribute('aPos', new THREE.InstancedBufferAttribute(mPos, 3));
  mg.setAttribute('aSize', new THREE.InstancedBufferAttribute(mSize, 1));
  mg.setAttribute('aSeed', new THREE.InstancedBufferAttribute(mSeed, 1));
  mg.setAttribute('aSpin', new THREE.InstancedBufferAttribute(mSpin, 1));
  mg.instanceCount = NM;
  mg.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  const mito = new THREE.Mesh(mg, driftCells({
    deep: 0x3a1206, mid: 0xd8762c, hot: 0xffd08a, emissive: 0x2a0c02,
    drift: 26, rate: 0.1, spinRate: 0.35, falloff: 0.00002, rim: 0.9, wet: 0.5, ambient: 0.28, clear: 130,
  }));
  mito.frustumCulled = false;
  group.add(mito);

  /* ── réticulum endoplasmique : des nappes autour du noyau ── */
  const erGeos = [];
  for (let i = 0; i < 7; i++) {
    const r = NR + 120 + i * 78;
    const g = new THREE.TorusGeometry(r, 5 + rnd() * 4, 4, 90, Math.PI * (0.7 + rnd() * 0.9));
    g.rotateX(rnd() * 3.14); g.rotateY(rnd() * 3.14); g.rotateZ(rnd() * 3.14);
    g.translate(NUC.x, NUC.y, NUC.z);
    erGeos.push(g);
    const g2 = new THREE.TorusGeometry(r, 42 + rnd() * 20, 3, 70, Math.PI * (0.5 + rnd() * 0.7));
    g2.rotateX(rnd() * 3.14); g2.rotateY(rnd() * 3.14); g2.rotateZ(rnd() * 3.14);
    g2.translate(NUC.x, NUC.y, NUC.z);
    erGeos.push(g2);
  }
  const er = new THREE.Mesh(mergeGeometries(erGeos), membrane({
    inner: 0x123a44, edge: 0x9fe8d8, power: 2.4, base: 0.10, rimAlpha: 0.6,
    glow: 0.4, irid: 0.06, alpha: 0.7, wobble: 2, noiseScale: 0.02,
  }));
  erGeos.forEach(g => g.dispose());
  group.add(er);

  /* ── ribosomes ── */
  const ribo = moteField(Math.round(3200 * q), 2200, {
    shape: 'sphere', colorA: 0x9ff0d8, colorB: 0xfff0b0,
    size: 3.6, drift: 16, rate: 0.1, intensity: 0.5, twinkle: 0.9,
  }, 121);
  ribo.position.z = 300;
  group.add(ribo);

  /* ── noyau ── */
  const nucMem = new THREE.Mesh(new THREE.SphereGeometry(NR, 60, 40), membrane({
    inner: 0x1c2050, edge: 0xc8d8ff, power: 2.2, base: 0.07, rimAlpha: 0.7,
    glow: 0.6, irid: 0.12, alpha: 0.72, wobble: 5, noiseScale: 0.012,
  }));
  nucMem.position.copy(NUC);
  nucMem.renderOrder = 3;
  group.add(nucMem);

  const poreGeos = [];
  for (let i = 0; i < 90; i++) {
    const u = rnd() * 2 - 1, a = rnd() * 6.28, s = Math.sqrt(1 - u * u);
    const n = new THREE.Vector3(s * Math.cos(a), u, s * Math.sin(a));
    const g = new THREE.TorusGeometry(16, 5, 6, 18);
    const m = new THREE.Matrix4().lookAt(new THREE.Vector3(), n, new THREE.Vector3(0, 1, 0.001));
    g.applyMatrix4(m);
    g.translate(NUC.x + n.x * NR, NUC.y + n.y * NR, NUC.z + n.z * NR);
    poreGeos.push(g);
  }
  const pores = new THREE.Mesh(mergeGeometries(poreGeos), glow({
    color: 0x9fc0ff, intensity: 0.55, core: 0.3, power: 2.0, side: THREE.DoubleSide,
  }));
  poreGeos.forEach(g => g.dispose());
  group.add(pores);

  const nucGlow = new THREE.Mesh(new THREE.SphereGeometry(NR * 0.97, 30, 20),
    glow({ color: 0x6a8cff, intensity: 0.09, core: 0.0, power: 2.6, side: THREE.BackSide }));
  nucGlow.position.copy(NUC);
  group.add(nucGlow);

  /* ── ADN ── */
  const dna = new THREE.Group();
  dna.position.copy(NUC);
  const strandMat = tissue({
    side: THREE.FrontSide, bump: false,
    deep: 0x143a58, mid: 0x58aade, hot: 0xdcf4ff,
    key: 0.32, keyDir: new THREE.Vector3(0.3, 1, 0.4), keyColor: 0x9fe0ff,
    noiseScale: 0.2, displace: 0.5, rim: 1.0, wet: 0.6, shiny: 40,
    falloff: 0.00006, ambient: 0.3, normalMix: 0.3, emissive: 0x061420,
  });
  const s1 = new THREE.Mesh(helixRibbon({ turns: 7, height: 430, radius: 62, phase: 0, tube: 11, seg: 460, radial: 10 }), strandMat);
  const s2 = new THREE.Mesh(helixRibbon({ turns: 7, height: 430, radius: 62, phase: Math.PI * 0.72, tube: 11, seg: 460, radial: 10 }), strandMat);
  dna.add(s1, s2);

  const rungA = [], rungB = [];
  const RUNGS = 130;
  for (let i = 0; i < RUNGS; i++) {
    const t = i / (RUNGS - 1);
    const a = t * 7 * Math.PI * 2;
    const p1 = new THREE.Vector3(Math.cos(a) * 62, (t - 0.5) * 430, Math.sin(a) * 62);
    const a2 = a + Math.PI * 0.72;
    const p2 = new THREE.Vector3(Math.cos(a2) * 62, (t - 0.5) * 430, Math.sin(a2) * 62);
    const mid = p1.clone().lerp(p2, 0.5);
    const mk = (from, to) => {
      const dir = new THREE.Vector3().subVectors(to, from);
      const len = dir.length();
      const g = new THREE.CylinderGeometry(4.6, 3.4, len, 7, 1, false);
      const q2 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
      g.applyMatrix4(new THREE.Matrix4().compose(from.clone().lerp(to, 0.5), q2, new THREE.Vector3(1, 1, 1)));
      return g;
    };
    if (rnd() > 0.5) { rungA.push(mk(p1, mid)); rungB.push(mk(mid, p2)); }
    else { rungB.push(mk(p1, mid)); rungA.push(mk(mid, p2)); }
  }
  const matA = tissue({ side: THREE.FrontSide, bump: false, deep: 0x3a1030, mid: 0xd85a9a, hot: 0xffc0e0, noiseScale: 0.3, displace: 0.2, rim: 0.9, wet: 0.5, shiny: 34, falloff: 0.00006, ambient: 0.34, normalMix: 0.25, emissive: 0x2a0820 });
  const matB = tissue({ side: THREE.FrontSide, bump: false, deep: 0x2a3a08, mid: 0x9ad058, hot: 0xe8ffb0, noiseScale: 0.3, displace: 0.2, rim: 0.9, wet: 0.5, shiny: 34, falloff: 0.00006, ambient: 0.34, normalMix: 0.25, emissive: 0x142a06 });
  const mA = new THREE.Mesh(mergeGeometries(rungA), matA);
  const mB = new THREE.Mesh(mergeGeometries(rungB), matB);
  rungA.forEach(g => g.dispose()); rungB.forEach(g => g.dispose());
  dna.add(mA, mB);
  group.add(dna);

  const chromatin = moteField(Math.round(1400 * q), NR * 1.6, {
    shape: 'sphere', colorA: 0x9fb0ff, colorB: 0xffd8f0,
    size: 4, drift: 8, rate: 0.12, intensity: 0.5, twinkle: 0.8,
  }, 131);
  chromatin.position.copy(NUC);
  group.add(chromatin);

  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1150, 420, -900),
    new THREE.Vector3(-720, 200, -420),
    new THREE.Vector3(-380, -80, 60),
    new THREE.Vector3(80, 120, 300),
    new THREE.Vector3(420, -60, 420),
    new THREE.Vector3(360, 180, 660),
    new THREE.Vector3(60, 60, 640),
    new THREE.Vector3(-40, 20, 760),
    new THREE.Vector3(-20, 8, 900),
    new THREE.Vector3(-6, 0, 1010),
    new THREE.Vector3(0, 0, 1085),
  ]);
  path.curveType = 'centripetal';

  const spots = {
    noyau: NUC.clone().add(new THREE.Vector3(0, NR * 0.86, -NR * 0.5)),
    adn: NUC.clone().add(new THREE.Vector3(0, 120, 0)),
    mito: new THREE.Vector3(mPos[0], mPos[1], mPos[2]),
    ribosome: new THREE.Vector3(-320, 90, 260),
  };

  return {
    group, path, spots, spotFar: 1250,
    speed: 0.0068, freeSpeed: 150, lookAhead: 0.014, fov: 72, shake: 0.25,
    bounds: { type: 'sphere', center: new THREE.Vector3(0, 0, 380), radius: 1450 },
    grade: { bloom: 0.85, tint: [0.96, 1.02, 1.05], vig: 0.55, exposure: 1.06 },
    update(t, dt, pulse, breath, cam) {
      dna.rotation.y = t * 0.11;
      pores.rotation.y = t * 0.01;
      er.rotation.y = -t * 0.014;
      if (cam) ribo.position.copy(cam.position);
    },
  };
}
