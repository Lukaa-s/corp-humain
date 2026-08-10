import * as THREE from 'three';
import { tissue, flowCells, flowPoints, flowAttributes, instanced, glow, U } from '../core/mat.js';
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
  // La paroi n'est pas un tuyau : c'est un carrelage de cellules allongées
  // dans le sens du courant. Le pavage rend ça visible, et c'est exactement
  // ce que raconte la fiche du repère « paroi ».
  const wallMat = tissue({
    side: THREE.DoubleSide,         // normales déjà retournées vers l'intérieur
    deep: 0x2c040c, mid: 0xa8283a, hot: 0xff9a90,
    noiseScale: 0.055, displace: 1.4, pulseAmp: 0.55, flow: 0.0,
    bumpScale: 0.9, bumpAmp: 0.24, normalMix: 0.32,
    rim: 0.4, wet: 0.34, shiny: 34, falloff: 0.0005, ambient: 0.22, light: 1.05,
    vein: true, veinAmt: 0.28, veinScale: 0.09,
    pave: true, paveScale: [5.5, 9], paveDark: 0.5, paveTint: 0.2,
    paveBump: 0.3, paveRound: 0.8, paveGloss: 0.12,
    wave: true, waveWidth: 130, waveAmp: 2.6, waveGlow: 0.32,
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
    wave: true, waveWidth: 130, waveAmp: 2.6, waveGlow: 0.6,
  }));
  ringGeos.forEach(g => g.dispose());
  group.add(rings);

  /* ── hématies ── */
  const N_RBC = 2400;
  const rbcAttrs = flowAttributes(N_RBC, rnd, { radiusBias: 0.42, sizeMin: 2.6, sizeMax: 4.2, spin: 1.8 });
  const rbcGeo = instanced(biconcaveGeometry(1, 16, 9), N_RBC, {
    aU: { array: rbcAttrs.aU, size: 1 }, aRad: { array: rbcAttrs.aRad, size: 1 },
    aAng: { array: rbcAttrs.aAng, size: 1 }, aSize: { array: rbcAttrs.aSize, size: 1 },
    aSeed: { array: rbcAttrs.aSeed, size: 1 }, aSpin: { array: rbcAttrs.aSpin, size: 1 },
  });
  const rbcMat = flowCells(ch, {
    deep: 0x59060f, mid: 0xd8303c, hot: 0xff9c86,
    z0: Z0, z1: Z1, radius: R * 0.9, speed: 0.011, swirl: 0.05, wobble: 0.7,
    spinRate: 0.8, falloff: 0.0004, rim: 0.72, wet: 0.34, ambient: 0.24, pulseAmp: 0.85, clear: 36,
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
    deep: 0x7a5a48, mid: 0xd8ac90, hot: 0xffe4cc,
    z0: Z0, z1: Z1, radius: R * 0.86, speed: 0.014, swirl: 0.2, wobble: 1.1,
    spinRate: 1.6, falloff: 0.0004, rim: 0.7, wet: 0.4, ambient: 0.3, pulseAmp: 0.9, clear: 24,
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

  /* ══════════ les trois pièces à voir ══════════
     Les repères pointaient jusqu'ici un endroit du courant où, par
     construction, il n'y avait rien : les cellules sont calculées sur le GPU
     et ne s'arrêtent jamais. On pose donc trois pièces immobiles, chacune
     dans un renfoncement de la paroi, comme sous une loupe. */

  const at = (z, rr, a) => {
    const c = ch.center(z), f = ch.frame(z);
    return c.clone().addScaledVector(f.n, Math.cos(a) * rr).addScaledVector(f.b, Math.sin(a) * rr);
  };

  const specimens = [];
  function alcove(z, ang, size, color) {
    const p = at(z, R * 0.62, ang);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(size * 2.1, 18, 12),
      glow({ color, intensity: 0.16, core: 0.0, power: 3.4, pulseAmp: 0.5 }));
    halo.position.copy(p);
    group.add(halo);
    return p;
  }

  // une hématie retenue, de face puis de profil : on voit le creux central
  const rbcOne = new THREE.Mesh(biconcaveGeometry(6.4, 30, 18), tissue({
    side: THREE.DoubleSide, bump: false, deep: 0x780c16, mid: 0xe23c46, hot: 0xffb4a0,
    noiseScale: 0.22, displace: 0.1, normalMix: 0.06,
    rim: 0.8, wet: 0.6, shiny: 44, falloff: 0.0004, ambient: 0.36, light: 1.4,
  }));
  rbcOne.position.copy(alcove(300, 1.1, 6.4, 0xff6a6a));
  group.add(rbcOne);
  specimens.push({ m: rbcOne, sp: 0.42, ax: new THREE.Vector3(0.2, 1, 0.35).normalize() });

  // un leucocyte en train de sortir : à moitié engagé entre deux cellules
  const wbcOne = new THREE.Mesh(blob(9.5, 4, (n) => 1.1 * Math.sin(n.x * 6.5) * Math.sin(n.y * 5.5) * Math.sin(n.z * 6.0)), tissue({
    side: THREE.DoubleSide, deep: 0x50506a, mid: 0xd8d8ec, hot: 0xffffff,
    noiseScale: 0.16, displace: 0.5, bumpScale: 1.1, bumpAmp: 0.28, normalMix: 0.18,
    rim: 1.0, wet: 0.6, shiny: 30, falloff: 0.0004, ambient: 0.4, light: 1.4,
  }));
  wbcOne.position.copy(alcove(820, 4.0, 9.5, 0xbfe0ff));
  group.add(wbcOne);
  specimens.push({ m: wbcOne, sp: 0.16, ax: new THREE.Vector3(-0.3, 1, 0.2).normalize() });

  // un bouchon de plaquettes collé sur une déchirure de la paroi
  const plugGeos = [];
  const plugP = at(1240, R * 0.82, 2.4);
  for (let i = 0; i < 9; i++) {
    const g2 = new THREE.IcosahedronGeometry(1.6 + rnd() * 1.5, 1);
    g2.scale(1, 0.5, 1.25);
    g2.rotateX(rnd() * 6.28); g2.rotateY(rnd() * 6.28);
    g2.translate((rnd() - 0.5) * 8, (rnd() - 0.5) * 6, (rnd() - 0.5) * 8);
    plugGeos.push(g2);
  }
  const plug = new THREE.Mesh(mergeGeometries(plugGeos), tissue({
    side: THREE.DoubleSide, deep: 0x6a4432, mid: 0xe8b48c, hot: 0xffe4c4,
    noiseScale: 0.3, displace: 0.3, bumpScale: 1.4, bumpAmp: 0.3, normalMix: 0.3,
    rim: 0.9, wet: 0.5, shiny: 26, falloff: 0.0004, ambient: 0.34, light: 1.3,
  }));
  plugGeos.forEach(g2 => g2.dispose());
  plug.position.copy(plugP);
  group.add(plug);
  alcove(1240, 2.4, 7, 0xffc890);

  const paroiP = at(560, R * 0.94, 0.4);
  const spots = {
    hematie: { p: rbcOne.position.clone(), r: 7, view: at(300, R * 0.1, 1.1).add(new THREE.Vector3(0, 0, -22)) },
    leuco:   { p: wbcOne.position.clone(), r: 11, view: at(820, R * 0.05, 4.0).add(new THREE.Vector3(0, 0, -26)) },
    plaquette: { p: plugP.clone(), r: 9, view: at(1240, R * 0.2, 2.4).add(new THREE.Vector3(0, 0, -24)) },
    paroi:   { p: paroiP.clone(), r: 15, view: at(560, R * 0.35, 0.4).add(new THREE.Vector3(0, 0, 16)) },
  };

  const path = ch.curve(Z0 + 90, Z1 - 120, 180);

  return {
    group, path, spots, spotFar: 330,
    speed: 0.0125, freeSpeed: 60, lookAhead: 0.014, fov: 74, shake: 0.75,
    bounds: { type: 'tube', channel: ch, z0: Z0 + 40, z1: Z1 - 40, radius: R },
    // aucune source extérieure : le sang lui-même rougeoie
    light: {
      key:  { dir: [0.2, 0.9, 0.2], color: 0xff5a5a, int: 0.3 },
      fill: { dir: [-0.4, -0.7, 0.3], color: 0x7a0018, int: 0.3 },
      sky:  { top: 0xb0202c, bot: 0x300006, int: 0.22 },
    },
    grade: { bloom: 0.44, tint: [1.06, 0.96, 0.96], vig: 0.62, exposure: 0.95 },
    update(t, dt, pulse, breath, cam) {
      if (cam) halo.position.copy(cam.position);
      // les pièces retenues tournent lentement : on en fait le tour sans bouger
      for (const s of specimens) s.m.rotateOnAxis(s.ax, dt * s.sp);
      // L'onde de pression part du cœur (en z bas) et remonte le conduit à
      // chaque battement. Elle traverse en un peu plus de la moitié du cycle :
      // on la voit passer, puis la paroi se calme jusqu'au coup suivant.
      const span = Z1 - Z0 + 700;
      U.uWaveZ.value = Z0 - 260 + (U.uBeat.value / 0.62) * span;
    },
  };
}
