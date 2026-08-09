import * as THREE from 'three';
import { pulseStrand, glow, moteField, motes, voidDome, membrane } from '../core/mat.js';
import { branchTree, segmentsToMesh, mergeGeometries, blob, rng, lerp } from '../core/build.js';

/**
 * ESCALE 10 — le réseau neuronal.
 * Une forêt d'arbres dendritiques dans le noir, parcourue d'impulsions
 * qui remontent des somas jusqu'aux terminaisons.
 */
export default function cerveau(q = 1) {
  const group = new THREE.Group();
  const rnd = rng(1010);

  group.add(new THREE.Mesh(new THREE.SphereGeometry(3200, 32, 22),
    voidDome({ top: 0x0e0a26, bottom: 0x030209, cloud: 0x241650, clouds: 0.4, scale: 0.5 })));

  /* ── neurones ── */
  const NEURONS = Math.max(8, Math.round(19 * q));
  const allSegs = [];
  const somas = [], tips = [];
  for (let i = 0; i < NEURONS; i++) {
    const o = new THREE.Vector3(
      (rnd() - 0.5) * 1900,
      (rnd() - 0.5) * 1000,
      -300 + (rnd() - 0.5) * 1900);
    const d = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
    const segs = branchTree({
      origin: o, dir: d, length: 165 + rnd() * 120, radius: 13 + rnd() * 6,
      depth: 4, split: 2, lengthDecay: 0.76, radiusDecay: 0.68,
      spread: 0.72, seed: 100 + i * 7, jitter: 0.42,
    });
    allSegs.push(...segs);
    somas.push(o);
    for (const s of segs) if (s.level >= 3) tips.push(s.b);
  }
  const neurons = segmentsToMesh(allSegs, pulseStrand({
    base: 0x4a3f8e, spark: 0xbdefff, speed: 0.30, width: 0.085, density: 3.2,
    rim: 1.1, intensity: 3.4, falloff: 0.0000015,
  }), 8, { uvAlong: true, uvScale: 0.0022, heightSeg: 2, open: true });
  group.add(neurons);

  /* ── somas ── */
  const somaGeos = [];
  for (const s of somas) {
    const g = blob(46 + rnd() * 20, 2, (n) => 7 * Math.sin(n.x * 6) * Math.sin(n.y * 5) * Math.sin(n.z * 6));
    g.translate(s.x, s.y, s.z);
    somaGeos.push(g);
  }
  const somaMesh = new THREE.Mesh(mergeGeometries(somaGeos), membrane({
    inner: 0x2a2060, edge: 0xbdd8ff, power: 1.9, base: 0.30, rimAlpha: 0.8,
    glow: 0.9, irid: 0.12, alpha: 0.95, wobble: 2.2, noiseScale: 0.08,
  }));
  somaGeos.forEach(g => g.dispose());
  group.add(somaMesh);

  const somaCore = new THREE.Mesh(somaMesh.geometry,
    glow({ color: 0x7fc8ff, intensity: 0.4, core: 0.16, power: 2.4, pulseAmp: 0.5, flicker: 0.12 }));
  group.add(somaCore);

  /* ── synapses : chaque terminaison scintille à son propre rythme ── */
  const N = Math.min(tips.length, Math.round(1500 * q));
  const sp = new Float32Array(N * 3), ss = new Float32Array(N), sd = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const p = tips[Math.floor(rnd() * tips.length)];
    sp[i * 3] = p.x + (rnd() - 0.5) * 12; sp[i * 3 + 1] = p.y + (rnd() - 0.5) * 12; sp[i * 3 + 2] = p.z + (rnd() - 0.5) * 12;
    ss[i] = 0.8 + rnd() * 1.6; sd[i] = rnd();
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  sg.setAttribute('aSize', new THREE.BufferAttribute(ss, 1));
  sg.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1));
  sg.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4000);
  const synapses = new THREE.Points(sg, motes({
    colorA: 0xa8e8ff, colorB: 0xffd0ff, size: 17, drift: 0.8, rate: 0.05,
    twinkle: 1.0, intensity: 0.9, soft: 1.3,
  }));
  synapses.frustumCulled = false;
  group.add(synapses);

  /* ── neurotransmetteurs ── */
  const nt = moteField(Math.round(2600 * q), 1400, {
    shape: 'sphere', colorA: 0x8fb0ff, colorB: 0xe8b0ff,
    size: 4.5, drift: 22, rate: 0.14, intensity: 0.45, twinkle: 0.9,
  }, 111);
  group.add(nt);

  /* ── un capillaire cérébral qui traverse la scène ── */
  const vesselCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1500, -420, 600), new THREE.Vector3(-700, -300, 200),
    new THREE.Vector3(0, -380, -100), new THREE.Vector3(700, -250, -400),
    new THREE.Vector3(1500, -400, -900),
  ]);
  const vessel = new THREE.Mesh(new THREE.TubeGeometry(vesselCurve, 160, 26, 12, false),
    pulseStrand({ base: 0x4a1424, spark: 0xff8a90, speed: 0.22, width: 0.06, density: 2.6, rim: 0.9, intensity: 1.8, falloff: 0.0000015 }));
  group.add(vessel);

  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1300, 300, 1300),
    new THREE.Vector3(-820, 150, 820),
    new THREE.Vector3(-420, -60, 420),
    new THREE.Vector3(-60, 90, 40),
    new THREE.Vector3(320, -30, -260),
    new THREE.Vector3(560, 180, -620),
    new THREE.Vector3(220, 60, -980),
    new THREE.Vector3(-260, -80, -1180),
    new THREE.Vector3(-680, 120, -1420),
  ]);
  path.curveType = 'centripetal';

  const spots = {
    neurone: somas[0] ? somas[0].clone() : new THREE.Vector3(0, 0, 0),
    synapse: tips[Math.floor(tips.length * 0.3)] ? tips[Math.floor(tips.length * 0.3)].clone() : new THREE.Vector3(100, 0, 0),
    myeline: (() => { const s = allSegs.find(x => x.level === 1); return s ? s.a.clone().lerp(s.b, 0.5) : new THREE.Vector3(0, 100, 0); })(),
    glie: vesselCurve.getPointAt(0.44).add(new THREE.Vector3(0, 70, 0)),
  };

  return {
    group, path, spots, spotFar: 1500,
    speed: 0.0072, freeSpeed: 170, lookAhead: 0.014, fov: 74, shake: 0.25,
    bounds: { type: 'sphere', center: new THREE.Vector3(-100, 0, -200), radius: 1800 },
    grade: { bloom: 0.95, tint: [0.97, 0.98, 1.1], vig: 0.6, exposure: 1.08 },
    update(t, dt, pulse, breath, cam) { if (cam) nt.position.copy(cam.position); },
  };
}
