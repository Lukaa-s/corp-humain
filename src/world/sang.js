import * as THREE from 'three';
import { tissue, flowCells, flowPoints, flowAttributes, instanced, glow } from '../core/mat.js';
import { makeChannel, channelTube, biconcaveGeometry, blob, rng, mergeGeometries } from '../core/build.js';

/**
 * ESCALE 2 — la lumière d'une artère.
 * Un tunnel qui bat, l'endothélium en relief, et le trafic :
 * hématies par milliers, leucocytes, plaquettes, plasma.
 */
export default function sang() {
  const group = new THREE.Group();
  const rnd = rng(202);
  const Z0 = -140, Z1 = 1700, R = 26;

  const ch = makeChannel({ ax1: 26, fx1: 0.0042, ax2: 9, fx2: 0.0125, ay1: 18, fy1: 0.0056, ay2: 7, fy2: 0.0098 });

  /* ── paroi ── */
  const wallGeo = channelTube(ch, Z0, Z1, {
    segments: 420, radial: 44,
    radius: (u) => R * (1 + 0.10 * Math.sin(u * 26) + 0.05 * Math.sin(u * 61 + 1.2)),
    warp: (u, a) => 1.6 * Math.sin(a * 7 + u * 40) + 1.1 * Math.sin(a * 3 - u * 22),
    uRepeat: 26, vRepeat: 3,
  });
  const wallMat = tissue({
    side: THREE.DoubleSide,         // normales déjà retournées vers l'intérieur
    deep: 0x2a0208, mid: 0xa02033, hot: 0xff8a86,
    noiseScale: 0.055, displace: 1.7, pulseAmp: 0.55, flow: 0.0,
    bumpScale: 0.6, bumpAmp: 0.42, normalMix: 0.6,
    rim: 0.62, wet: 0.45, shiny: 30, falloff: 0.00035, ambient: 0.2, light: 1.3,
    vein: true, veinAmt: 0.55, veinScale: 0.09,
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  group.add(wall);

  /* ── anneaux élastiques ── */
  const ringGeos = [];
  for (let i = 0; i < 26; i++) {
    const z = Z0 + 60 + (i / 26) * (Z1 - Z0 - 120);
    const c = ch.center(z);
    const f = ch.frame(z);
    const g = new THREE.TorusGeometry(R * 1.02, 1.6, 7, 48);
    // l'axe du tore est déjà +Z : makeBasis l'aligne sur la tangente du conduit
    const m = new THREE.Matrix4().makeBasis(f.n, f.b, f.t).setPosition(c);
    g.applyMatrix4(m);
    ringGeos.push(g);
  }
  const rings = new THREE.Mesh(mergeGeometries(ringGeos), tissue({
    side: THREE.DoubleSide, bump: false, flat: false,
    deep: 0x3a0810, mid: 0xc25060, hot: 0xffb0a4,
    noiseScale: 0.1, displace: 0.4, rim: 0.9, wet: 0.5, shiny: 34,
    falloff: 0.0004, ambient: 0.22, normalMix: 0.3,
  }));
  ringGeos.forEach(g => g.dispose());
  group.add(rings);

  /* ── hématies ── */
  const N_RBC = 2400;
  const rbcAttrs = flowAttributes(N_RBC, rnd, { radiusBias: 0.42, sizeMin: 2.6, sizeMax: 4.2, spin: 1.8 });
  const rbcGeo = instanced(biconcaveGeometry(1, 22, 12), N_RBC, {
    aU: { array: rbcAttrs.aU, size: 1 }, aRad: { array: rbcAttrs.aRad, size: 1 },
    aAng: { array: rbcAttrs.aAng, size: 1 }, aSize: { array: rbcAttrs.aSize, size: 1 },
    aSeed: { array: rbcAttrs.aSeed, size: 1 }, aSpin: { array: rbcAttrs.aSpin, size: 1 },
  });
  const rbcMat = flowCells(ch, {
    deep: 0x59060f, mid: 0xd8303c, hot: 0xff9c86,
    z0: Z0, z1: Z1, radius: R * 0.9, speed: 0.011, swirl: 0.05, wobble: 0.7,
    spinRate: 0.8, falloff: 0.0004, rim: 0.85, wet: 0.4, ambient: 0.24, pulseAmp: 0.85, clear: 26,
  });
  const rbc = new THREE.Mesh(rbcGeo, rbcMat);
  rbc.frustumCulled = false;
  group.add(rbc);

  /* ── leucocytes ── */
  const N_WBC = 26;
  const wbcAttrs = flowAttributes(N_WBC, rnd, { radiusBias: 0.8, sizeMin: 5.0, sizeMax: 7.2, spin: 0.7 });
  const wbcSrc = blob(1, 3, (n) => 0.10 * Math.sin(n.x * 9) * Math.sin(n.y * 8) * Math.sin(n.z * 9) + 0.05);
  const wbcGeo = instanced(wbcSrc, N_WBC, {
    aU: { array: wbcAttrs.aU, size: 1 }, aRad: { array: wbcAttrs.aRad, size: 1 },
    aAng: { array: wbcAttrs.aAng, size: 1 }, aSize: { array: wbcAttrs.aSize, size: 1 },
    aSeed: { array: wbcAttrs.aSeed, size: 1 }, aSpin: { array: wbcAttrs.aSpin, size: 1 },
  });
  const wbc = new THREE.Mesh(wbcGeo, flowCells(ch, {
    deep: 0x5a5670, mid: 0xdcd8ee, hot: 0xffffff,
    z0: Z0, z1: Z1, radius: R * 0.72, speed: 0.0082, swirl: 0.12, wobble: 1.4,
    spinRate: 0.5, falloff: 0.0004, rim: 1.0, wet: 0.5, ambient: 0.32, pulseAmp: 0.5, clear: 48,
  }));
  wbc.frustumCulled = false;
  group.add(wbc);

  /* ── plaquettes ── */
  const N_PLT = 420;
  const pltAttrs = flowAttributes(N_PLT, rnd, { radiusBias: 0.5, sizeMin: 0.9, sizeMax: 1.7, spin: 2.6 });
  const pltSrc = new THREE.IcosahedronGeometry(1, 0);
  pltSrc.scale(1, 0.45, 1.2);
  const plt = new THREE.Mesh(instanced(pltSrc, N_PLT, {
    aU: { array: pltAttrs.aU, size: 1 }, aRad: { array: pltAttrs.aRad, size: 1 },
    aAng: { array: pltAttrs.aAng, size: 1 }, aSize: { array: pltAttrs.aSize, size: 1 },
    aSeed: { array: pltAttrs.aSeed, size: 1 }, aSpin: { array: pltAttrs.aSpin, size: 1 },
  }), flowCells(ch, {
    deep: 0x6a4a3a, mid: 0xe0b08c, hot: 0xffe0c0,
    z0: Z0, z1: Z1, radius: R * 0.86, speed: 0.014, swirl: 0.2, wobble: 1.1,
    spinRate: 1.6, falloff: 0.0004, rim: 0.9, wet: 0.45, ambient: 0.28, pulseAmp: 0.9, clear: 13,
  }));
  plt.frustumCulled = false;
  group.add(plt);

  /* ── plasma ── */
  const N_P = 2600;
  const pAttrs = flowAttributes(N_P, rnd, { radiusBias: 0.55, sizeMin: 0.4, sizeMax: 1.3 });
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N_P * 3), 3));
  pGeo.setAttribute('aU', new THREE.BufferAttribute(pAttrs.aU, 1));
  pGeo.setAttribute('aRad', new THREE.BufferAttribute(pAttrs.aRad, 1));
  pGeo.setAttribute('aAng', new THREE.BufferAttribute(pAttrs.aAng, 1));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(pAttrs.aSize, 1));
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(pAttrs.aSeed, 1));
  pGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, (Z0 + Z1) / 2), (Z1 - Z0));
  const plasma = new THREE.Points(pGeo, flowPoints(ch, {
    colorA: 0xff9a86, colorB: 0xffe6d0, z0: Z0, z1: Z1, radius: R * 0.95,
    speed: 0.016, swirl: 0.28, size: 5.5, soft: 1.7, intensity: 0.34, pulseAmp: 0.9, maxPx: 26, near: 16,
  }));
  plasma.frustumCulled = false;
  group.add(plasma);

  /* ── halo d'avant : la lampe de la sonde accroche la brume ── */
  const halo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.6, 20, 14),
    glow({ color: 0xff5a52, intensity: 0.10, core: 0.0, power: 3.0, pulseAmp: 0.9 }));
  group.add(halo);

  const spots = {
    hematie: null, leuco: null, plaquette: null,
    paroi: (() => { const c = ch.center(560); const f = ch.frame(560); return c.clone().addScaledVector(f.n, R * 0.9); })(),
  };
  /* trois repères posés dans le courant, recalés à chaque image */
  const anchors = [
    { key: 'hematie', z: 300, r: 0.55, a: 1.1 },
    { key: 'leuco', z: 820, r: 0.42, a: 4.0 },
    { key: 'plaquette', z: 1240, r: 0.6, a: 2.4 },
  ];
  for (const an of anchors) {
    const c = ch.center(an.z), f = ch.frame(an.z);
    spots[an.key] = c.clone().addScaledVector(f.n, Math.cos(an.a) * R * an.r).addScaledVector(f.b, Math.sin(an.a) * R * an.r);
  }

  const path = ch.curve(Z0 + 90, Z1 - 120, 180);

  return {
    group, path, spots, spotFar: 330,
    speed: 0.0125, freeSpeed: 60, lookAhead: 0.014, fov: 74, shake: 0.75,
    bounds: { type: 'tube', channel: ch, z0: Z0 + 40, z1: Z1 - 40, radius: R },
    grade: { bloom: 0.62, tint: [1.06, 0.96, 0.96], vig: 0.6, exposure: 1.05 },
    update(t, dt, pulse, breath, cam) {
      if (cam) halo.position.copy(cam.position);
    },
  };
}
