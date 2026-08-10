import * as THREE from 'three';
import { tissue, stalkField, spindle, instanced, moteField, driftCells, glow, membrane } from '../core/mat.js';
import { makeChannel, channelTube, blob, revolveZ, mergeGeometries, rng, lerp } from '../core/build.js';

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
    rim: 0.6, wet: 0.5, shiny: 24, falloff: 0.00004, ambient: 0.26, light: 1.45,
    vein: true, veinAmt: 0.4, veinScale: 0.1,
  }));
  group.add(wall);

  /* ── villosités ── */
  const NV = Math.round(7000 * q);
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
  const villi = new THREE.Mesh(instanced(spindle(6), NV, {
    aPos: { array: vPos, size: 3 }, aDir: { array: vDir, size: 3 },
    aScale: { array: vSc, size: 2 }, aSeed: { array: vSeed, size: 1 },
  }), stalkField({
    root: 0x2a0803, tip: 0xd8703a, hot: 0xffb070,
    sway: 0.20, rate: 1.4, rim: 0.55, wet: 0.28, ambient: 0.16,
    falloff: 0.00009, tipGlow: 0.08, pulseAmp: 0.3, rootAO: 0.20,
  }));
  villi.frustumCulled = false;
  group.add(villi);

  /* ── nutriments ── */
  const nutri = moteField(Math.round(900 * q), 400, {
    shape: 'sphere', colorA: 0xffb45a, colorB: 0xffe8b0,
    size: 11, drift: 20, rate: 0.2, intensity: 0.3, twinkle: 0.45,
    soft: 2.4, near: 46,
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
  const chunkSrc = blob(1, 3, (n) => 0.24 * Math.sin(n.x * 6) * Math.sin(n.y * 7) * Math.sin(n.z * 5));
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

  /* ══════════ la villosité qu'on va vraiment regarder ══════════
     Trois repères sur quatre parlent d'une seule villosité : le doigt, la
     brosse de micro-doigts qui le couvre, et le vaisseau blanc planté en son
     milieu. Il en fallait donc une, plus grande que la forêt, ouverte sur le
     côté comme une planche d'anatomie. */
  const HZ = 300;
  const hc = ch.center(HZ), hf = ch.frame(HZ);
  const HR = radiusAt((HZ - Z0) / (Z1 - Z0));
  const hOut = hf.n.clone().multiplyScalar(Math.cos(0.7)).addScaledVector(hf.b, Math.sin(0.7)).normalize();
  const HERO_BASE = hc.clone().addScaledVector(hOut, HR - 2);
  const HERO_AX = hOut.clone().negate();                    // vers l'axe du tube
  const HERO_LEN = 118, HERO_RAD = 21;
  const HERO_TIP = HERO_BASE.clone().addScaledVector(HERO_AX, HERO_LEN);

  // corps du doigt : une gousse, ouverte sur un quart de tour
  const heroGeo = revolveZ(
    (t) => [t * HERO_LEN, HERO_RAD * Math.sin(Math.pow(t, 0.62) * Math.PI * 0.92) * (1 - 0.12 * t) + 2.2],
    { segments: 60, radial: 54, uRepeat: 5, vRepeat: 9 });
  {
    const qz = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), HERO_AX);
    heroGeo.applyQuaternion(qz);
    heroGeo.translate(HERO_BASE.x, HERO_BASE.y, HERO_BASE.z);
  }
  const hero = new THREE.Mesh(heroGeo, tissue({
    side: THREE.DoubleSide,
    deep: 0x3a1006, mid: 0xd07a42, hot: 0xffc890,
    noiseScale: 0.06, displace: 1.2, pulseAmp: 0.2,
    bumpScale: 0.8, bumpAmp: 0.3, normalMix: 0.12,
    rim: 0.55, wet: 0.5, shiny: 26, falloff: 0.00006, ambient: 0.3, light: 1.4,
    // le pavage donne les cellules qui tapissent le doigt, une par une
    pave: true, paveScale: [9, 26], paveDark: 0.5, paveTint: 0.22,
    paveBump: 0.4, paveRound: 0.85, paveGloss: 0.5,
  }));
  group.add(hero);

  /* la bordure en brosse : des milliers de micro-doigts sur le doigt.
     C'est l'objet que la fiche « micro-doigts » désigne, et jusqu'ici il
     n'existait tout simplement pas. */
  const NB = Math.round(15000 * Math.max(q, 0.4));
  const bPos = new Float32Array(NB * 3), bDir = new Float32Array(NB * 3),
        bSc = new Float32Array(NB * 2), bSeed = new Float32Array(NB);
  const hu = new THREE.Vector3(0, 1, 0).cross(HERO_AX).normalize();
  const hv = HERO_AX.clone().cross(hu).normalize();
  for (let i = 0; i < NB; i++) {
    const t = Math.pow(rnd(), 0.8);
    const a = rnd() * 6.28;
    const rr = HERO_RAD * Math.sin(Math.pow(t, 0.62) * Math.PI * 0.92) * (1 - 0.12 * t) + 2.2;
    const radial = hu.clone().multiplyScalar(Math.cos(a)).addScaledVector(hv, Math.sin(a));
    const p = HERO_BASE.clone().addScaledVector(HERO_AX, t * HERO_LEN).addScaledVector(radial, rr);
    // normale approchée : radiale, un peu redressée vers la pointe
    const nrm = radial.clone().addScaledVector(HERO_AX, 0.55 * Math.pow(t, 2.2)).normalize();
    bPos[i * 3] = p.x; bPos[i * 3 + 1] = p.y; bPos[i * 3 + 2] = p.z;
    bDir[i * 3] = nrm.x; bDir[i * 3 + 1] = nrm.y; bDir[i * 3 + 2] = nrm.z;
    bSc[i * 2] = 0.24 + rnd() * 0.13;
    bSc[i * 2 + 1] = 2.6 + rnd() * 1.2;
    bSeed[i] = rnd();
  }
  const brush = new THREE.Mesh(instanced(spindle(5), NB, {
    aPos: { array: bPos, size: 3 }, aDir: { array: bDir, size: 3 },
    aScale: { array: bSc, size: 2 }, aSeed: { array: bSeed, size: 1 },
  }), stalkField({
    root: 0x6e2c0c, tip: 0xe8a866, hot: 0xffd8a8,
    sway: 0.10, rate: 2.4, rim: 0.35, wet: 0.16, ambient: 0.3,
    falloff: 0.00008, tipGlow: 0.0, rootAO: 0.42,
  }));
  brush.frustumCulled = false;
  group.add(brush);

  /* le chylifère : le vaisseau blanc planté au cœur du doigt */
  const lact = new THREE.Mesh(
    (() => {
      const g2 = revolveZ((t) => [t * HERO_LEN * 0.86, 6.4 * (1 - 0.3 * t) * (t > 0.94 ? (1 - t) * 12 : 1)],
        { segments: 26, radial: 20 });
      const qz = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), HERO_AX);
      g2.applyQuaternion(qz);
      g2.translate(HERO_BASE.x, HERO_BASE.y, HERO_BASE.z);
      return g2;
    })(),
    membrane({ inner: 0x6a7a6a, edge: 0xf4fff0, power: 1.7, base: 0.24, rimAlpha: 0.8, glow: 0.7, irid: 0.1, alpha: 0.85 }));
  group.add(lact);

  /* et le capillaire rouge qui l'entoure : c'est là que part le reste */
  const netPts = [];
  for (let k = 0; k <= 90; k++) {
    const t = k / 90;
    const a = t * Math.PI * 5.5;
    const rr = (HERO_RAD * 0.62) * Math.sin(Math.pow(t, 0.6) * Math.PI * 0.92) + 2.5;
    netPts.push(HERO_BASE.clone().addScaledVector(HERO_AX, t * HERO_LEN * 0.9)
      .addScaledVector(hu, Math.cos(a) * rr).addScaledVector(hv, Math.sin(a) * rr));
  }
  const net = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(netPts), 160, 2.4, 6, false), tissue({
    side: THREE.DoubleSide, bump: false, deep: 0x6a0c14, mid: 0xd83a44, hot: 0xffa090,
    noiseScale: 0.1, displace: 0.2, normalMix: 0.2,
    rim: 0.9, wet: 0.5, shiny: 28, falloff: 0.00004, ambient: 0.4, light: 1.4,
  }));
  group.add(net);

  /* ══════════ la colonie ══════════
     Des bâtonnets et des billes accrochés au mucus, en tas. Le repère
     « vos bactéries » désignait jusqu'ici un point du vide. */
  const COL = (() => { const c = ch.center(1080), f = ch.frame(1080);
    return c.clone().addScaledVector(f.n, Math.cos(2.0) * R * 0.62).addScaledVector(f.b, Math.sin(2.0) * R * 0.62); })();
  const bactGeos = [];
  for (let i = 0; i < 220; i++) {
    const rod = rnd() < 0.62;
    const g2 = rod
      ? new THREE.CapsuleGeometry(1.5 + rnd() * 0.9, 4 + rnd() * 5, 4, 8)
      : new THREE.IcosahedronGeometry(1.9 + rnd() * 1.2, 1);
    g2.rotateX(rnd() * 6.28); g2.rotateY(rnd() * 6.28); g2.rotateZ(rnd() * 6.28);
    const a = rnd() * 6.28, u2 = rnd() * 2 - 1, s2 = Math.sqrt(1 - u2 * u2);
    const rr = 12 + Math.pow(rnd(), 0.6) * 26;
    g2.translate(COL.x + rr * s2 * Math.cos(a), COL.y + rr * u2 * 0.7, COL.z + rr * s2 * Math.sin(a));
    bactGeos.push(g2);
  }
  const bact = new THREE.Mesh(mergeGeometries(bactGeos), tissue({
    side: THREE.DoubleSide, bump: false, deep: 0x1e3a26, mid: 0x7ad0a0, hot: 0xd8ffe8,
    noiseScale: 0.2, displace: 0.2, normalMix: 0.15,
    rim: 0.9, wet: 0.6, shiny: 34, falloff: 0.00006, ambient: 0.34, light: 1.3,
  }));
  bactGeos.forEach(g2 => g2.dispose());
  group.add(bact);
  const colGlow = new THREE.Mesh(new THREE.SphereGeometry(62, 18, 12),
    glow({ color: 0x7affc0, intensity: 0.1, core: 0.0, power: 2.8, flicker: 0.12 }));
  colGlow.position.copy(COL);
  group.add(colGlow);

  /* lueur ambrée en avant */
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(R * 1.5, 18, 12),
    glow({ color: 0xff8a2c, intensity: 0.035, core: 0.0, power: 3.0 }));
  group.add(lamp);

  const path = ch.curve(Z0 + 70, Z1 - 90, 160);
  const spotAt = (z, rr, a) => {
    const c = ch.center(z), f = ch.frame(z);
    return c.clone()
      .addScaledVector(f.n, Math.cos(a) * rr)
      .addScaledVector(f.b, Math.sin(a) * rr);
  };
  const heroMid = HERO_BASE.clone().addScaledVector(HERO_AX, HERO_LEN * 0.5);
  const heroSide = hu.clone().multiplyScalar(56).addScaledVector(hv, 30).addScaledVector(HERO_AX, 34);
  const microP = spotAt(1080, R * 0.5, 2.0);
  const spots = {
    villosite: { p: heroMid.clone(), r: HERO_RAD + 6, view: heroMid.clone().add(heroSide).addScaledVector(HERO_AX, 22) },
    brosse: { p: HERO_BASE.clone().addScaledVector(HERO_AX, HERO_LEN * 0.72), r: 12,
              view: HERO_BASE.clone().addScaledVector(HERO_AX, HERO_LEN * 0.72).addScaledVector(hu, 34).addScaledVector(hv, 12) },
    chylifere: { p: HERO_BASE.clone().addScaledVector(HERO_AX, HERO_LEN * 0.4), r: 8,
                 view: HERO_BASE.clone().addScaledVector(HERO_AX, HERO_LEN * 0.4).addScaledVector(hu, 44).addScaledVector(hv, -18) },
    microbiote: { p: microP.clone(), r: 30, view: microP.clone().lerp(ch.center(1080), 0.55) },
  };

  return {
    group, path, spots, spotFar: 360,
    speed: 0.0105, freeSpeed: 70, lookAhead: 0.015, fov: 74, shake: 0.45,
    bounds: { type: 'tube', channel: ch, z0: Z0 + 40, z1: Z1 - 40, radius: R * 0.72 },
    // chaleur ambrée, dense
    light: {
      key:  { dir: [0.15, 0.9, 0.35], color: 0xffb066, int: 0.5 },
      fill: { dir: [-0.3, -0.8, -0.5], color: 0x8a2a12, int: 0.22 },
      sky:  { top: 0xb04a20, bot: 0x2a0c04, int: 0.2 },
    },
    grade: { bloom: 0.38, tint: [1.07, 0.99, 0.92], vig: 0.62, exposure: 1.0 },
    update(t, dt, pulse, breath, cam) {
      if (cam) { nutri.position.copy(cam.position); lamp.position.copy(cam.position); }
    },
  };
}
