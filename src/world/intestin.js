import * as THREE from 'three';
import { tissue, stalkField, spindle, instanced, moteField, driftCells, glow } from '../core/mat.js';
import { makeChannel, channelTube, blob, rng, lerp } from '../core/build.js';

/**
 * ESCALE 6 — la muqueuse du grêle.
 * Une forêt de villosités qui ondulent, des replis circulaires,
 * et des nutriments happés vers la paroi.
 */
export default function intestin(q = 1) {
  const group = new THREE.Group();
  const rnd = rng(606);
  const Z0 = -120, Z1 = 1250, R = 105;

  const ch = makeChannel({ ax1: 30, fx1: 0.0045, ax2: 11, fx2: 0.013, ay1: 22, fy1: 0.0058, ay2: 9, fy2: 0.0104 });
  const radiusAt = (u) => R * (1 - 0.20 * Math.pow(Math.sin(u * Math.PI * 5.5), 2) + 0.05 * Math.sin(u * 31));

  /* ── paroi ── */
  const wall = new THREE.Mesh(channelTube(ch, Z0, Z1, {
    segments: 360, radial: 46,
    radius: (u) => radiusAt(u),
    warp: (u, a) => 3.2 * Math.sin(a * 5 + u * 26) + 1.6 * Math.sin(a * 11 - u * 44),
    uRepeat: 22,
  }), tissue({
    side: THREE.DoubleSide,
    deep: 0x381208, mid: 0xc25a32, hot: 0xffcf94,
    noiseScale: 0.04, displace: 2.4, pulseAmp: 0.2,
    bumpScale: 0.5, bumpAmp: 0.45, normalMix: 0.45,
    key: 0.26, keyDir: new THREE.Vector3(0.1, 1, 0.25), keyColor: 0xff9a5a,
    rim: 0.6, wet: 0.5, shiny: 24, falloff: 0.00009, ambient: 0.22, light: 1.4,
    vein: true, veinAmt: 0.4, veinScale: 0.1,
  }));
  group.add(wall);

  /* ── villosités ── */
  const NV = Math.round(9000 * q);
  const vPos = new Float32Array(NV * 3), vDir = new Float32Array(NV * 3),
        vSc = new Float32Array(NV * 2), vSeed = new Float32Array(NV);
  for (let i = 0; i < NV; i++) {
    const u = rnd();
    const z = lerp(Z0 + 10, Z1 - 10, u);
    const a = rnd() * 6.28;
    const c = ch.center(z), f = ch.frame(z);
    const r = radiusAt(u) - 1.5;
    const nx = f.n.x * Math.cos(a) + f.b.x * Math.sin(a);
    const ny = f.n.y * Math.cos(a) + f.b.y * Math.sin(a);
    const nz = f.n.z * Math.cos(a) + f.b.z * Math.sin(a);
    vPos[i * 3] = c.x + nx * r; vPos[i * 3 + 1] = c.y + ny * r; vPos[i * 3 + 2] = c.z + nz * r;
    const jx = (rnd() - 0.5) * 0.35, jy = (rnd() - 0.5) * 0.35;
    const d = new THREE.Vector3(-nx + f.t.x * jx, -ny + f.t.y * jx, -nz + f.t.z * jx)
      .add(new THREE.Vector3(f.n.x, f.n.y, f.n.z).multiplyScalar(jy)).normalize();
    vDir[i * 3] = d.x; vDir[i * 3 + 1] = d.y; vDir[i * 3 + 2] = d.z;
    vSc[i * 2] = 5.5 + rnd() * 3.4;
    vSc[i * 2 + 1] = 24 + rnd() * 17;
    vSeed[i] = rnd();
  }
  const villi = new THREE.Mesh(instanced(spindle(8, 6), NV, {
    aPos: { array: vPos, size: 3 }, aDir: { array: vDir, size: 3 },
    aScale: { array: vSc, size: 2 }, aSeed: { array: vSeed, size: 1 },
  }), stalkField({
    root: 0x631d0a, tip: 0xf07a34, hot: 0xffb070,
    sway: 0.20, rate: 1.4, rim: 0.7, wet: 0.3, ambient: 0.3,
    falloff: 0.00022, tipGlow: 0.1, pulseAmp: 0.3,
  }));
  villi.frustumCulled = false;
  group.add(villi);

  /* ── nutriments ── */
  const nutri = moteField(Math.round(2600 * q), 400, {
    shape: 'sphere', colorA: 0xffd07a, colorB: 0xfff0d0,
    size: 6.5, drift: 20, rate: 0.2, intensity: 0.6, twinkle: 0.85,
  }, 61);
  group.add(nutri);

  /* ── chyme ── */
  const NC = Math.round(120 * q);
  const cPos = new Float32Array(NC * 3), cSize = new Float32Array(NC),
        cSeed = new Float32Array(NC), cSpin = new Float32Array(NC);
  for (let i = 0; i < NC; i++) {
    const z = lerp(Z0 + 40, Z1 - 40, rnd());
    const a = rnd() * 6.28, rr = Math.pow(rnd(), 0.6) * R * 0.55;
    const c = ch.center(z), f = ch.frame(z);
    cPos[i * 3] = c.x + (f.n.x * Math.cos(a) + f.b.x * Math.sin(a)) * rr;
    cPos[i * 3 + 1] = c.y + (f.n.y * Math.cos(a) + f.b.y * Math.sin(a)) * rr;
    cPos[i * 3 + 2] = c.z + (f.n.z * Math.cos(a) + f.b.z * Math.sin(a)) * rr;
    cSize[i] = 2.5 + rnd() * 5; cSeed[i] = rnd(); cSpin[i] = (rnd() - 0.5) * 1.6;
  }
  const chunkSrc = blob(1, 2, (n) => 0.24 * Math.sin(n.x * 6) * Math.sin(n.y * 7) * Math.sin(n.z * 5));
  const cg = new THREE.InstancedBufferGeometry();
  cg.index = chunkSrc.index;
  for (const k in chunkSrc.attributes) cg.setAttribute(k, chunkSrc.attributes[k]);
  cg.setAttribute('aPos', new THREE.InstancedBufferAttribute(cPos, 3));
  cg.setAttribute('aSize', new THREE.InstancedBufferAttribute(cSize, 1));
  cg.setAttribute('aSeed', new THREE.InstancedBufferAttribute(cSeed, 1));
  cg.setAttribute('aSpin', new THREE.InstancedBufferAttribute(cSpin, 1));
  cg.instanceCount = NC;
  cg.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  const chyme = new THREE.Mesh(cg, driftCells({
    deep: 0x38200c, mid: 0xa87840, hot: 0xf0d0a0,
    drift: 16, rate: 0.13, spinRate: 0.6, falloff: 0.00012, rim: 0.7, wet: 0.4, ambient: 0.26, clear: 55,
  }));
  chyme.frustumCulled = false;
  group.add(chyme);

  /* lueur ambrée en avant */
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(R * 1.5, 18, 12),
    glow({ color: 0xff9a3c, intensity: 0.07, core: 0.0, power: 3.0 }));
  group.add(lamp);

  const path = ch.curve(Z0 + 70, Z1 - 90, 160);
  const spotAt = (z, rr, a) => {
    const c = ch.center(z), f = ch.frame(z);
    return c.clone()
      .addScaledVector(f.n, Math.cos(a) * rr)
      .addScaledVector(f.b, Math.sin(a) * rr);
  };
  const spots = {
    villosite: spotAt(220, R * 0.62, 0.8),
    brosse: spotAt(560, R * 0.66, 3.4),
    chylifere: spotAt(830, R * 0.6, 5.1),
    microbiote: spotAt(1080, R * 0.5, 2.0),
  };

  return {
    group, path, spots, spotFar: 360,
    speed: 0.0105, freeSpeed: 70, lookAhead: 0.015, fov: 74, shake: 0.45,
    bounds: { type: 'tube', channel: ch, z0: Z0 + 40, z1: Z1 - 40, radius: R * 0.72 },
    grade: { bloom: 0.6, tint: [1.07, 0.99, 0.92], vig: 0.58, exposure: 1.04 },
    update(t, dt, pulse, breath, cam) {
      if (cam) { nutri.position.copy(cam.position); lamp.position.copy(cam.position); }
    },
  };
}
