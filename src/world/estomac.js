import * as THREE from 'three';
import { tissue, driftCells, moteField, glow, membrane } from '../core/mat.js';
import { blob, rng, mergeGeometries, lerp } from '../core/build.js';

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
  const wallGeo = blob(R, 6, (n) => {
    const ang = Math.atan2(n.z, n.x);
    const ridge = Math.sin(ang * 9 + n.y * 3.2) * 0.5 + 0.5;
    const ridge2 = Math.sin(ang * 17 - n.y * 5) * 0.5 + 0.5;
    const band = 0.55 + 0.45 * Math.sin(n.y * 6.5);
    return (ridge * 46 + ridge2 * 16) * band - Math.abs(n.y) * 26;
  });
  const wallMat = tissue({
    side: THREE.BackSide,
    deep: 0x33230a, mid: 0xc09a3e, hot: 0xffe49c,
    noiseScale: 0.018, displace: 10, pulseAmp: 0.35,
    bumpScale: 0.14, bumpAmp: 0.3, normalMix: 0.4,
    key: 0.32, keyDir: new THREE.Vector3(0.15, 1, 0.2), keyColor: 0xffcf7a,
    rim: 0.62, wet: 0.3, shiny: 15, falloff: 0.000008, ambient: 0.3, light: 1.5,
    vein: true, veinAmt: 0.45, veinScale: 0.045,
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  group.add(wall);

  /* ── onde de brassage : un bourrelet qui descend ── */
  const wave = new THREE.Mesh(new THREE.TorusGeometry(R * 0.86, 46, 14, 64), tissue({
    side: THREE.DoubleSide, deep: 0x33210a, mid: 0xc79a3e, hot: 0xffe49a,
    noiseScale: 0.02, displace: 12, pulseAmp: 0.2, bumpScale: 0.3, bumpAmp: 0.4,
    normalMix: 0.55, rim: 0.7, wet: 0.4, shiny: 18, falloff: 0.00001, ambient: 0.26,
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
  const NF = Math.round(160 * q);
  const fPos = new Float32Array(NF * 3), fSize = new Float32Array(NF),
        fSeed = new Float32Array(NF), fSpin = new Float32Array(NF);
  for (let i = 0; i < NF; i++) {
    const u = rnd() * 2 - 1, a = rnd() * 6.28, rr = 250 * Math.cbrt(rnd());
    const s = Math.sqrt(1 - u * u);
    fPos[i * 3] = rr * s * Math.cos(a); fPos[i * 3 + 1] = rr * u * 0.8 - 40; fPos[i * 3 + 2] = rr * s * Math.sin(a);
    fSize[i] = 6 + rnd() * 22; fSeed[i] = rnd(); fSpin[i] = (rnd() - 0.5) * 1.5;
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
    drift: 22, rate: 0.09, spinRate: 0.5, falloff: 0.00008,
    rim: 0.7, wet: 0.35, ambient: 0.24, clear: 70,
  }));
  chunks.frustumCulled = false;
  group.add(chunks);

  /* ── bulles qui remontent ── */
  const bubbles = moteField(Math.round(1400 * q), 600, {
    shape: 'box', spreadY: 640, spreadZ: 600,
    colorA: 0xfff0b0, colorB: 0xd8ff9a, size: 4.4, drift: 10, rate: 0.14,
    intensity: 0.34, twinkle: 0.85, rise: 34, spanY: 640, maxPx: 26, near: 34,
  }, 55);
  group.add(bubbles);

  /* ── brume acide ── */
  const haze = new THREE.Mesh(new THREE.SphereGeometry(R * 0.98, 26, 18),
    glow({ color: 0xb8a03a, intensity: 0.05, core: 0.02, power: 2.0, side: THREE.BackSide }));
  group.add(haze);

  /* ── gouttes d'acide sur la paroi ── */
  const dropGeos = [];
  for (let i = 0; i < Math.round(90 * q); i++) {
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

  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 280, 0),
    new THREE.Vector3(-60, 190, -110),
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

  const spots = {
    plis: new THREE.Vector3(-250, 60, -120),
    acide: new THREE.Vector3(210, -40, 150),
    mucus: new THREE.Vector3(120, 180, -180),
    chyme: new THREE.Vector3(-40, -120, 60),
  };

  let wy = R * 0.7;
  return {
    group, path, spots, spotFar: 520,
    speed: 0.0095, freeSpeed: 100, lookAhead: 0.016, fov: 76, shake: 0.55,
    bounds: { type: 'sphere', center: new THREE.Vector3(0, 0, 0), radius: R * 0.9 },
    grade: { bloom: 0.55, tint: [1.05, 1.02, 0.9], vig: 0.62, exposure: 0.98 },
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
