import * as THREE from 'three';
import { tissue, pulseStrand, moteField, glow, voidDome, driftCells, U } from '../core/mat.js';
import { segmentsToMesh, mergeGeometries, biconcaveGeometry, rng, lerp, blob } from '../core/build.js';

/**
 * ESCALE 9 — l'os spongieux et le muscle strié.
 * À gauche, la dentelle des travées et l'usine de la moelle ;
 * à droite, un faisceau de fibres qui se contracte.
 */
export default function charpente(q = 1) {
  const group = new THREE.Group();
  const rnd = rng(909);

  group.add(new THREE.Mesh(new THREE.SphereGeometry(3000, 30, 20),
    voidDome({ top: 0x241c14, bottom: 0x080605, cloud: 0x4a3524, clouds: 0.4, scale: 0.5 })));

  /* ── réseau trabéculaire ── */
  const nodes = [];
  const NN = Math.round(240 * q);
  for (let i = 0; i < NN; i++) {
    nodes.push(new THREE.Vector3(
      (rnd() - 0.5) * 1500 - 380,
      (rnd() - 0.5) * 900,
      (rnd() - 0.5) * 1500));
  }
  const segs = [];
  for (let i = 0; i < nodes.length; i++) {
    const d = nodes.map((n, j) => ({ j, d: n.distanceTo(nodes[i]) })).sort((a, b) => a.d - b.d);
    for (let k = 1; k <= 3; k++) {
      const j = d[k]?.j;
      if (j === undefined || j < i) continue;
      if (d[k].d > 400) continue;
      const r = 5 + rnd() * 9;
      segs.push({ a: nodes[i], b: nodes[j], r0: r, r1: r * (0.7 + rnd() * 0.5) });
    }
  }
  const lattice = segmentsToMesh(segs, tissue({
    side: THREE.DoubleSide, deep: 0x3a3026, mid: 0xd8cbb2, hot: 0xfff4e0,
    noiseScale: 0.03, displace: 2.4, bumpScale: 0.45, bumpAmp: 0.4, normalMix: 0.5,
    rim: 0.55, wet: 0.25, shiny: 18, falloff: 0.00002, ambient: 0.3, light: 1.25,
    key: 0.6, keyDir: new THREE.Vector3(0.3, 0.9, 0.2), keyColor: 0xffe8d0,
    vein: true, veinAmt: 0.35, veinScale: 0.06,
  }), 8);
  group.add(lattice);

  /* ── moelle rouge ── */
  const marrow = new THREE.Mesh(new THREE.SphereGeometry(430, 30, 22),
    glow({ color: 0xff3a44, intensity: 0.10, core: 0.0, power: 2.6, side: THREE.BackSide, pulseAmp: 0.5 }));
  marrow.position.set(-380, -40, 0);
  group.add(marrow);

  const born = moteField(Math.round(1800 * q), 720, {
    shape: 'sphere', colorA: 0xff5a52, colorB: 0xffc0a0,
    size: 7, drift: 26, rate: 0.16, intensity: 0.55, twinkle: 0.8,
  }, 93);
  born.position.copy(marrow.position);
  group.add(born);

  /* jeunes hématies qui s'échappent */
  const NR = Math.round(190 * q);
  const rPos = new Float32Array(NR * 3), rSize = new Float32Array(NR),
        rSeed = new Float32Array(NR), rSpin = new Float32Array(NR);
  for (let i = 0; i < NR; i++) {
    const u = rnd() * 2 - 1, a = rnd() * 6.28, rr = 400 * Math.cbrt(rnd());
    const s = Math.sqrt(1 - u * u);
    rPos[i * 3] = -380 + rr * s * Math.cos(a); rPos[i * 3 + 1] = -40 + rr * u; rPos[i * 3 + 2] = rr * s * Math.sin(a);
    rSize[i] = 7 + rnd() * 6; rSeed[i] = rnd(); rSpin[i] = (rnd() - 0.5) * 2;
  }
  const rSrc = biconcaveGeometry(1, 18, 10);
  const rGeo = new THREE.InstancedBufferGeometry();
  rGeo.index = rSrc.index;
  for (const k in rSrc.attributes) rGeo.setAttribute(k, rSrc.attributes[k]);
  rGeo.setAttribute('aPos', new THREE.InstancedBufferAttribute(rPos, 3));
  rGeo.setAttribute('aSize', new THREE.InstancedBufferAttribute(rSize, 1));
  rGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(rSeed, 1));
  rGeo.setAttribute('aSpin', new THREE.InstancedBufferAttribute(rSpin, 1));
  rGeo.instanceCount = NR;
  rGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  const cells = new THREE.Mesh(rGeo, driftCells({
    deep: 0x5c0810, mid: 0xd8303c, hot: 0xff9c86,
    drift: 34, rate: 0.15, spinRate: 0.8, falloff: 0.00008, rim: 0.85, wet: 0.55, ambient: 0.22, clear: 34,
  }));
  cells.frustumCulled = false;
  group.add(cells);

  /* ── faisceau musculaire ── */
  const muscle = new THREE.Group();
  muscle.position.set(760, 0, 0);
  const fibreGeos = [];
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const r = i === 0 ? 0 : 78 + (i % 3) * 34;
    const g = new THREE.CylinderGeometry(30 + rnd() * 8, 30 + rnd() * 8, 1500, 18, 40, false);
    g.rotateZ(Math.PI / 2);
    const uv = g.attributes.uv;
    for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getY(k), uv.getX(k));   // bandes le long de la fibre
    g.translate(0, Math.cos(a) * r, Math.sin(a) * r);
    fibreGeos.push(g);
  }
  const fibres = new THREE.Mesh(mergeGeometries(fibreGeos), pulseStrand({
    base: 0x7a1c22, spark: 0xffb0a0, speed: 0.0, width: 0.18, density: 46,
    rim: 0.75, intensity: 0.5, falloff: 0.00002,
  }));
  fibreGeos.forEach(g => g.dispose());
  muscle.add(fibres);

  const sheath = new THREE.Mesh(new THREE.CylinderGeometry(210, 210, 1500, 34, 1, true), tissue({
    side: THREE.DoubleSide, transparent: true, alpha: 0.34, depthWrite: false, bump: false,
    deep: 0x2a0c0c, mid: 0xa05048, hot: 0xffd0b8,
    noiseScale: 0.02, displace: 6, rim: 1.0, wet: 0.4, shiny: 22, falloff: 0.00003, ambient: 0.2, normalMix: 0.3,
  }));
  sheath.rotation.z = Math.PI / 2;
  muscle.add(sheath);

  /* jonction neuromusculaire */
  const nerve = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(-200, 520, 260), new THREE.Vector3(-120, 330, 190),
    new THREE.Vector3(-60, 180, 120), new THREE.Vector3(-20, 60, 60), new THREE.Vector3(0, 4, 30),
  ]), 60, 9, 8, false), pulseStrand({
    base: 0x2c2c52, spark: 0xa8e8ff, speed: 0.55, width: 0.05, density: 1.2,
    rim: 0.9, intensity: 2.0, falloff: 0.00003,
  }));
  muscle.add(nerve);
  const plaque = new THREE.Mesh(blob(30, 2, (n) => 6 * Math.sin(n.x * 7) * Math.sin(n.z * 7)),
    glow({ color: 0x9fe8ff, intensity: 0.7, core: 0.3, power: 2.0, flicker: 0.25 }));
  plaque.position.set(0, 20, 40);
  muscle.add(plaque);
  group.add(muscle);

  const dust = moteField(Math.round(1200 * q), 1600, {
    shape: 'sphere', colorA: 0xffe8c8, colorB: 0xffb098, size: 4.5,
    drift: 12, rate: 0.08, intensity: 0.35, twinkle: 0.7,
  }, 96);
  group.add(dust);

  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1050, 240, -720),
    new THREE.Vector3(-760, 130, -420),
    new THREE.Vector3(-500, 40, -160),
    new THREE.Vector3(-330, -60, 90),
    new THREE.Vector3(-160, 30, 300),
    new THREE.Vector3(120, 90, 340),
    new THREE.Vector3(400, 40, 230),
    new THREE.Vector3(620, -20, 60),
    new THREE.Vector3(700, 30, -220),
    new THREE.Vector3(760, 120, -560),
    new THREE.Vector3(770, 60, -900),
  ]);
  path.curveType = 'centripetal';

  const spots = {
    travee: nodes[8] ? nodes[8].clone() : new THREE.Vector3(-400, 0, 0),
    moelle: new THREE.Vector3(-380, 120, 60),
    fibre: new THREE.Vector3(760, 120, 120),
    jonction: new THREE.Vector3(760, 20, 40),
  };

  let phase = 0;
  return {
    group, path, spots, spotFar: 1150,
    speed: 0.008, freeSpeed: 150, lookAhead: 0.016, fov: 72, shake: 0.3,
    bounds: { type: 'sphere', center: new THREE.Vector3(0, 0, -100), radius: 1400 },
    grade: { bloom: 0.55, tint: [1.04, 1.0, 0.96], vig: 0.55, exposure: 1.02 },
    update(t, dt, pulse, breath, cam) {
      if (cam) dust.position.copy(cam.position);
      phase += dt * 0.55;
      const k = Math.pow(Math.max(0, Math.sin(phase)), 2.2);        // cycle de contraction
      muscle.scale.set(1 - k * 0.16, 1 + k * 0.13, 1 + k * 0.13);
      fibres.material.uniforms.uDensity.value = 46 / (1 - k * 0.16);
      fibres.material.uniforms.uInt.value = 0.5 + k * 0.8;
      plaque.scale.setScalar(1 + k * 0.35);
      cells.rotation.y = t * 0.015;
    },
  };
}
