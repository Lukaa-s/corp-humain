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
  const NEURONS = Math.max(10, Math.round(30 * q));
  const allSegs = [];
  const somas = [], tips = [];
  for (let i = 0; i < NEURONS; i++) {
    // resserré : la version précédente éparpillait si large qu'on pouvait
    // se retrouver au milieu du noir, sans un seul neurone en vue
    const o = new THREE.Vector3(
      (rnd() - 0.5) * 1500,
      (rnd() - 0.5) * 900,
      -200 + (rnd() - 0.5) * 1500);
    const d = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
    const segs = branchTree({
      origin: o, dir: d, length: 175 + rnd() * 130, radius: 14 + rnd() * 7,
      depth: 4, split: 2, lengthDecay: 0.76, radiusDecay: 0.68,
      spread: 0.72, seed: 100 + i * 7, jitter: 0.42,
    });
    allSegs.push(...segs);
    somas.push(o);
    for (const s of segs) if (s.level >= 3) tips.push(s.b);
  }
  const neurons = segmentsToMesh(allSegs, pulseStrand({
    base: 0x5a4ca8, spark: 0xd8f4ff, speed: 0.34, width: 0.10, density: 3.2,
    rim: 0.9, intensity: 2.2, falloff: 0.0000015,
  }), 8, { uvAlong: true, uvScale: 0.0022, heightSeg: 2, open: true });
  group.add(neurons);

  /* ── somas ── */
  const somaGeos = [];
  for (const s of somas) {
    const g = blob(46 + rnd() * 20, 3, (n) => 7 * Math.sin(n.x * 6) * Math.sin(n.y * 5) * Math.sin(n.z * 6));
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
    glow({ color: 0x7fc8ff, intensity: 0.22, core: 0.08, power: 2.6, pulseAmp: 0.4, flicker: 0.1 }));
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

  /* ══════════ la synapse qu'on peut vraiment regarder ══════════
     « Les neurones ne se touchent pas » : encore faut-il voir l'espace. Un
     bouton terminal renflé, en face une épine dendritique, et entre les deux
     une fente où des vésicules traversent. */
  const SYN = new THREE.Vector3(-190, 130, 250);
  const synAx = new THREE.Vector3(1, -0.18, -0.5).normalize();
  const GAP = 13;

  const boutonGeo = blob(30, 3, (n) => 3.2 * Math.sin(n.x * 5) * Math.sin(n.y * 6) * Math.sin(n.z * 5));
  boutonGeo.scale(1, 0.92, 0.92);
  boutonGeo.translate(SYN.x - synAx.x * (GAP + 26), SYN.y - synAx.y * (GAP + 26), SYN.z - synAx.z * (GAP + 26));
  const axonTail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    SYN.clone().addScaledVector(synAx, -420), SYN.clone().addScaledVector(synAx, -260),
    SYN.clone().addScaledVector(synAx, -120), SYN.clone().addScaledVector(synAx, -(GAP + 40)),
  ]), 60, 9, 10, false), pulseStrand({
    base: 0x5a4ca8, spark: 0xd8f4ff, speed: 0.5, width: 0.09, density: 2.0,
    rim: 0.8, intensity: 1.9, falloff: 0.0000015,
  }));
  group.add(axonTail);
  const bouton = new THREE.Mesh(boutonGeo, membrane({
    inner: 0x2e2470, edge: 0xc8dcff, power: 1.8, base: 0.26, rimAlpha: 0.85,
    glow: 0.9, irid: 0.14, alpha: 0.95, wobble: 1.2, noiseScale: 0.1,
  }));
  group.add(bouton);

  // l'épine dendritique en face
  const spineGeo = blob(24, 3, (n) => 2.4 * Math.sin(n.x * 7) * Math.sin(n.y * 5) * Math.sin(n.z * 7));
  spineGeo.scale(0.9, 1, 1);
  spineGeo.translate(SYN.x + synAx.x * (GAP + 22), SYN.y + synAx.y * (GAP + 22), SYN.z + synAx.z * (GAP + 22));
  group.add(new THREE.Mesh(spineGeo, membrane({
    inner: 0x3a2060, edge: 0xffd0ee, power: 1.9, base: 0.24, rimAlpha: 0.85,
    glow: 0.8, irid: 0.2, alpha: 0.95, wobble: 1.0, noiseScale: 0.12,
  })));
  const dendTail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    SYN.clone().addScaledVector(synAx, GAP + 36), SYN.clone().addScaledVector(synAx, 150).add(new THREE.Vector3(0, 60, 0)),
    SYN.clone().addScaledVector(synAx, 340).add(new THREE.Vector3(0, 40, 90)),
  ]), 50, 11, 10, false), pulseStrand({
    base: 0x6a3a90, spark: 0xffc0f0, speed: -0.3, width: 0.08, density: 1.6,
    rim: 0.7, intensity: 1.4, falloff: 0.0000015,
  }));
  group.add(dendTail);

  // les vésicules qui traversent la fente
  const NV = 90;
  const vp = new Float32Array(NV * 3), vs = new Float32Array(NV), vd = new Float32Array(NV);
  for (let i = 0; i < NV; i++) {
    const t = rnd();
    const side = new THREE.Vector3(-synAx.z, 0.4, synAx.x).normalize();
    const side2 = synAx.clone().cross(side).normalize();
    const a = rnd() * 6.28, rr = Math.sqrt(rnd()) * 22;
    const p = SYN.clone().addScaledVector(synAx, (t - 0.5) * GAP * 2.1)
      .addScaledVector(side, Math.cos(a) * rr).addScaledVector(side2, Math.sin(a) * rr);
    vp[i * 3] = p.x; vp[i * 3 + 1] = p.y; vp[i * 3 + 2] = p.z;
    vs[i] = 0.5 + rnd() * 0.7; vd[i] = rnd();
  }
  const vg = new THREE.BufferGeometry();
  vg.setAttribute('position', new THREE.BufferAttribute(vp, 3));
  vg.setAttribute('aSize', new THREE.BufferAttribute(vs, 1));
  vg.setAttribute('aSeed', new THREE.BufferAttribute(vd, 1));
  vg.boundingSphere = new THREE.Sphere(SYN.clone(), 90);
  group.add(new THREE.Points(vg, motes({
    colorA: 0xd0f0ff, colorB: 0xffd8ff, size: 13, drift: 4, rate: 0.5,
    twinkle: 1.0, intensity: 0.85, soft: 1.4, near: 6,
  })));

  /* ══════════ la gaine et ses interruptions ══════════
     Un axone isolé, avec ses manchons gras séparés par des étranglements
     réguliers : c'est là que le signal saute au lieu de ramper. */
  const MY0 = new THREE.Vector3(420, -160, 340);
  const myCurve = new THREE.CatmullRomCurve3([
    MY0.clone(), MY0.clone().add(new THREE.Vector3(230, 70, -180)),
    MY0.clone().add(new THREE.Vector3(470, 20, -400)), MY0.clone().add(new THREE.Vector3(720, 110, -640)),
  ]);
  const myAxon = new THREE.Mesh(new THREE.TubeGeometry(myCurve, 200, 7.5, 10, false), pulseStrand({
    base: 0x4a3a90, spark: 0xe8fbff, speed: 0.55, width: 0.035, density: 9,
    rim: 0.8, intensity: 2.6, falloff: 0.0000015,
  }));
  group.add(myAxon);
  const sheathGeos = [];
  const SEG = 9;
  for (let i = 0; i < SEG; i++) {
    const u0 = (i + 0.06) / SEG, u1 = (i + 0.94) / SEG;
    const pts = [];
    for (let k = 0; k <= 8; k++) pts.push(myCurve.getPointAt(lerp(u0, u1, k / 8)));
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 22, 17, 16, false);
    // renflement au milieu de chaque manchon
    const p = g.attributes.position, c = new THREE.Vector3();
    for (let k = 0; k < p.count; k++) {
      const t = (k / p.count);
      c.fromBufferAttribute(p, k);
      const mid = myCurve.getPointAt(lerp(u0, u1, t));
      c.sub(mid).multiplyScalar(0.82 + 0.3 * Math.sin(t * Math.PI)).add(mid);
      p.setXYZ(k, c.x, c.y, c.z);
    }
    g.computeVertexNormals();
    sheathGeos.push(g);
  }
  const sheath = new THREE.Mesh(mergeGeometries(sheathGeos), membrane({
    inner: 0x24204a, edge: 0xe8e0ff, power: 2.0, base: 0.2, rimAlpha: 0.75,
    glow: 0.5, irid: 0.22, alpha: 0.9, wobble: 0.6, noiseScale: 0.05,
  }));
  sheathGeos.forEach(g => g.dispose());
  group.add(sheath);

  /* ── un capillaire cérébral qui traverse la scène ── */
  const vesselCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1500, -420, 600), new THREE.Vector3(-700, -300, 200),
    new THREE.Vector3(0, -380, -100), new THREE.Vector3(700, -250, -400),
    new THREE.Vector3(1500, -400, -900),
  ]);
  const vessel = new THREE.Mesh(new THREE.TubeGeometry(vesselCurve, 160, 26, 12, false),
    pulseStrand({ base: 0x4a1424, spark: 0xff8a90, speed: 0.22, width: 0.06, density: 2.6, rim: 0.7, intensity: 1.1, falloff: 0.0000015 }));
  group.add(vessel);

  // On démarre au ras d'un arbre dendritique : de trop loin, la forêt n'était
  // qu'une poignée de traits perdus dans le noir.
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-420, 120, 640),
    new THREE.Vector3(-330, 60, 480),
    new THREE.Vector3(-300, -40, 380),
    new THREE.Vector3(-60, 90, 40),
    new THREE.Vector3(320, -30, -260),
    new THREE.Vector3(560, 180, -620),
    new THREE.Vector3(220, 60, -980),
    new THREE.Vector3(-260, -80, -1180),
    new THREE.Vector3(-680, 120, -1420),
  ]);
  path.curveType = 'centripetal';

  const soma0 = somas[0] ? somas[0].clone() : new THREE.Vector3(0, 0, 0);
  const glieP = vesselCurve.getPointAt(0.44).add(new THREE.Vector3(0, 70, 0));
  const myMid = myCurve.getPointAt(0.42);
  const spots = {
    neurone: { p: soma0.clone(), r: 66, view: soma0.clone().add(new THREE.Vector3(150, 110, 210)) },
    synapse: { p: SYN.clone(), r: 34, view: SYN.clone().add(new THREE.Vector3(-70, 96, 205)) },
    myeline: { p: myMid.clone(), r: 30, view: myMid.clone().add(new THREE.Vector3(-40, 78, 118)) },
    glie: { p: glieP.clone(), r: 60, view: glieP.clone().add(new THREE.Vector3(60, 150, 230)) },
  };

  return {
    group, path, spots, spotFar: 1500,
    speed: 0.0072, freeSpeed: 170, lookAhead: 0.014, fov: 74, shake: 0.25,
    bounds: { type: 'sphere', center: new THREE.Vector3(-100, 0, -200), radius: 1800 },
    // presque noir : ce sont les neurones qui éclairent
    light: {
      key:  { dir: [0.3, 0.7, -0.6], color: 0x7ea0ff, int: 0.24 },
      fill: { dir: [-0.5, -0.4, 0.6], color: 0x4020a0, int: 0.2 },
      sky:  { top: 0x3a2a80, bot: 0x04020e, int: 0.16 },
    },
    grade: { bloom: 0.62, tint: [0.97, 0.98, 1.1], vig: 0.62, exposure: 0.95 },
    update(t, dt, pulse, breath, cam) { if (cam) nt.position.copy(cam.position); },
  };
}
