import * as THREE from 'three';
import { tissue, flowCells, flowAttributes, instanced, moteField, glow, strands, U } from '../core/mat.js';
import { makeChannel, biconcaveGeometry, revolveZ, piercedCap, rng, mergeGeometries, clamp, lerp } from '../core/build.js';

/**
 * ESCALE 3 — le ventricule gauche.
 *
 * Ce qui rend une pompe lisible, c'est de voir ses deux portes. Au plafond de
 * la chambre : à gauche la grande valve d'entrée et ses deux voiles retenus
 * par des cordages, à droite la petite valve de sortie et ses trois nids
 * d'hirondelle. Elles jouent en alternance — l'une se ferme quand l'autre
 * s'ouvre — et c'est ça, un battement.
 *
 * Repère de construction : l'apex est en Z négatif, le plafond des valves en
 * Z = +150. On entre par le bas et on regarde vers le haut.
 */
export default function coeur(q = 1) {
  const group = new THREE.Group();
  // tout ce qui est muscle vit ici : ce sous-groupe se resserre pour de bon à
  // chaque battement, sinon on voit une grotte qui frémit, pas une pompe
  const muscle = new THREE.Group();
  group.add(muscle);
  const rnd = rng(303);

  const APEX = -330, BASE = 150, R = 190;
  const MIT = new THREE.Vector2(-72, -8), MIT_R = 94;      // valve d'entrée
  const AOR = new THREE.Vector2(88, 40), AOR_R = 58;       // valve de sortie

  /* profil du ventricule : ogive, ventre au tiers, léger resserrement au col */
  const KEY = [[0, 0], [0.06, 62], [0.16, 118], [0.32, 168], [0.5, 190], [0.7, 191], [0.86, 184], [1, 178]];
  const radiusAt = (t) => {
    for (let i = 1; i < KEY.length; i++) {
      if (t <= KEY[i][0]) {
        const a = KEY[i - 1], b = KEY[i];
        const u = (t - a[0]) / (b[0] - a[0]);
        return lerp(a[1], b[1], u * u * (3 - 2 * u));
      }
    }
    return KEY[KEY.length - 1][1];
  };

  /* ── paroi : trabécules sculptées dans le maillage ──
     Le relief est dans la géométrie, pas seulement dans la normale : c'est ce
     qui donne au myocarde son aspect de corde tressée quand on le rase. */
  const wallGeo = revolveZ((t) => [lerp(APEX, BASE, t), radiusAt(t)], {
    segments: Math.round(190 * clamp(q * 1.4, 0.45, 1)),
    radial: Math.round(150 * clamp(q * 1.4, 0.45, 1)),
    uRepeat: 7, vRepeat: 3,
    warp: (t, a) => {
      const grain = Math.sin(a * 13 + t * 26) * Math.sin(a * 5 - t * 17);
      const band = Math.sin(t * Math.PI) ** 0.5;
      return (grain * 9 + Math.sin(a * 27 + t * 9) * 3) * band;
    },
  });
  const wall = new THREE.Mesh(wallGeo, tissue({
    side: THREE.DoubleSide,
    deep: 0x3a0a12, mid: 0xb8303a, hot: 0xff8a76,
    noiseScale: 0.016, displace: 5, pulseAmp: 0.7,
    bumpScale: 0.22, bumpAmp: 0.42, normalMix: 0.14,
    rim: 0.42, wet: 0.38, shiny: 24, falloff: 0.0000135, ambient: 0.2, light: 1.35,
    vein: true, veinAmt: 0.22, veinScale: 0.028, ao: 0.62,
    // l'onde de dépolarisation descend du plafond vers la pointe à chaque coup
    wave: true, waveWidth: 130, waveAmp: 2.4, waveGlow: 0.55,
  }));
  muscle.add(wall);

  /* ── plafond percé : le plancher des deux valves ──
     Les trous sont un peu plus petits que les bourrelets qui viendront se
     poser dessus : c'est ce qui enterre la découpe en dents de scie. */
  const capGeo = piercedCap(R - 4, [
    { x: MIT.x, y: MIT.y, r: MIT_R - 5 }, { x: AOR.x, y: AOR.y, r: AOR_R - 4 },
  ], {
    rings: 40, sectors: 148, z: BASE,
    height: (rn) => 46 * (1 - rn * rn), flip: 1,
  });
  // Ce plafond regarde vers le bas : la lumière de l'escale vient d'en haut et
  // ne l'atteint donc jamais. Sans un diffus très enveloppant et un fort
  // appoint, il tombait au noir et on croyait à un trou dans le décor.
  const capMat = tissue({
    side: THREE.DoubleSide,
    deep: 0x4e1018, mid: 0xb44048, hot: 0xff9c86,
    noiseScale: 0.024, displace: 4, pulseAmp: 0.4,
    bumpScale: 0.36, bumpAmp: 0.4, normalMix: 0.16,
    rim: 0.45, wet: 0.34, shiny: 26, falloff: 0.0000105, ambient: 0.34, light: 1.28,
    wrap: 1.0, ao: 0.55, litFill: 1.9, litSky: 1.35,
    vein: true, veinAmt: 0.22, veinScale: 0.03,
    wave: true, waveWidth: 130, waveAmp: 1.6, waveGlow: 0.5,
  });
  muscle.add(new THREE.Mesh(capGeo, capMat));

  const capZ = (x, y) => BASE + 46 * (1 - (Math.hypot(x, y) / (R - 4)) ** 2);
  const MIT_Z = capZ(MIT.x, MIT.y), AOR_Z = capZ(AOR.x, AOR.y);

  /* ── bourrelet des deux orifices ──
     Il suit la courbure du plafond point par point. Un tore posé à plat
     laissait paraître, sur un demi-tour, la découpe en dents de scie du
     plafond percé : une couronne noire tout autour de la porte. */
  const ringMat = tissue({
    side: THREE.DoubleSide, deep: 0x4a1218, mid: 0xd8a08c, hot: 0xffe0cc,
    noiseScale: 0.06, displace: 0.8, pulseAmp: 0.2, bumpScale: 0.5, bumpAmp: 0.22,
    normalMix: 0.2, rim: 0.6, wet: 0.55, shiny: 34, falloff: 0.00002, ambient: 0.3, light: 1.2,
  });
  function collar(c, r, tube = 11) {
    const AR = 84, TR = 14;
    const pos = [], nor = [], uvs = [], idx = [];
    for (let i = 0; i <= AR; i++) {
      const a = (i / AR) * Math.PI * 2;
      const cx = c.x + Math.cos(a) * r, cy = c.y + Math.sin(a) * r;
      const cz = capZ(cx, cy);
      // repère local : radial dans le plan, et Z
      const ux = Math.cos(a), uy = Math.sin(a);
      for (let j = 0; j <= TR; j++) {
        const b = (j / TR) * Math.PI * 2;
        const cb = Math.cos(b), sb = Math.sin(b);
        pos.push(cx + ux * cb * tube, cy + uy * cb * tube, cz + sb * tube);
        nor.push(ux * cb, uy * cb, sb);
        uvs.push(i / AR, j / TR);
      }
    }
    for (let i = 0; i < AR; i++) for (let j = 0; j < TR; j++) {
      const A = i * (TR + 1) + j, B = A + TR + 1;
      idx.push(A, B, A + 1, B, B + 1, A + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx); g.computeBoundingSphere();
    return g;
  }
  const rings = [collar(MIT, MIT_R + 2, 12), collar(AOR, AOR_R + 2, 10)];
  muscle.add(new THREE.Mesh(mergeGeometries(rings), ringMat));
  rings.forEach(g => g.dispose());

  /* ── au-delà des portes : l'oreillette et l'aorte ──
     Deux courts conduits sombres. Sans eux, une porte ouverte donne sur le
     néant et on ne comprend pas d'où vient ni où va le sang. */
  const beyond = [];
  beyond.push(revolveZ((t) => [lerp(MIT_Z - 4, MIT_Z + 250, t), MIT_R * (1 + t * 0.55)],
    { segments: 24, radial: 56 }));
  beyond[0].translate(MIT.x, MIT.y, 0);
  beyond.push(revolveZ((t) => [lerp(AOR_Z - 4, AOR_Z + 300, t), AOR_R * (1 + 0.4 * Math.sin(t * 2.2))],
    { segments: 26, radial: 48 }));
  beyond[1].translate(AOR.x, AOR.y, 0);
  muscle.add(new THREE.Mesh(mergeGeometries(beyond), tissue({
    side: THREE.DoubleSide, deep: 0x1e050b, mid: 0x8a2230, hot: 0xd86a60,
    noiseScale: 0.03, displace: 3, pulseAmp: 0.3, bumpScale: 0.3, bumpAmp: 0.3,
    normalMix: 0.16, rim: 0.5, wet: 0.35, shiny: 22, falloff: 0.00004, ambient: 0.14,
  })));
  beyond.forEach(g => g.dispose());

  /* ── piliers : deux cônes de muscle qui montent du fond ── */
  const papTips = [
    new THREE.Vector3(MIT.x - 52, MIT.y - 46, -34),
    new THREE.Vector3(MIT.x + 44, MIT.y + 52, -52),
  ];
  const papGeos = papTips.map((tip) => {
    const dir = tip.clone().setZ(0).normalize();
    const base = new THREE.Vector3(dir.x * (R - 6), dir.y * (R - 6), tip.z - 165);
    const g = revolveZ((t) => [lerp(0, 1, t), lerp(38, 9, Math.pow(t, 0.7))], { segments: 22, radial: 22 });
    // on couche le cône le long de base→tip
    const p = g.attributes.position, n = g.attributes.normal;
    const ax = new THREE.Vector3().subVectors(tip, base);
    const len = ax.length();
    const qz = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), ax.clone().normalize());
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i); v.z *= len; v.applyQuaternion(qz).add(base);
      p.setXYZ(i, v.x, v.y, v.z);
      v.fromBufferAttribute(n, i); v.applyQuaternion(qz);
      n.setXYZ(i, v.x, v.y, v.z);
    }
    return g;
  });
  muscle.add(new THREE.Mesh(mergeGeometries(papGeos), tissue({
    side: THREE.DoubleSide, deep: 0x3c0a13, mid: 0xb8343e, hot: 0xff9484,
    noiseScale: 0.035, displace: 3.5, pulseAmp: 0.8, bumpScale: 0.34, bumpAmp: 0.42,
    normalMix: 0.16, rim: 0.5, wet: 0.4, shiny: 24, falloff: 0.00003, ambient: 0.2,
  })));
  papGeos.forEach(g => g.dispose());

  /* ── les deux voiles de la valve d'entrée ──
     Grand voile côté aorte, petit voile festonné en face. Ils pendent dans le
     ventricule et se rejoignent au centre quand la chambre pousse. */
  const SS = 46, VV = 15;
  const leafGeos = [], leafPos = [], leafEdge = [[], []];
  for (let li = 0; li < 2; li++) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array((SS + 1) * (VV + 1) * 3);
    const idx = [];
    for (let i = 0; i < SS; i++) for (let j = 0; j < VV; j++) {
      const a = i * (VV + 1) + j, b = a + VV + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(MIT.x, MIT.y, MIT_Z - 60), 320);
    leafGeos.push(g); leafPos.push(pos);
  }
  const leafMat = tissue({
    side: THREE.DoubleSide, bump: false,
    deep: 0x6a2028, mid: 0xe8c0b4, hot: 0xfff2e8,
    noiseScale: 0.05, displace: 0.7, pulseAmp: 0.15,
    normalMix: 0.1, rim: 0.7, wet: 0.62, shiny: 44, falloff: 0.00002, ambient: 0.38, light: 1.5,
  });
  leafGeos.forEach(g => { const m = new THREE.Mesh(g, leafMat); m.frustumCulled = false; group.add(m); });

  // Arc occupé par chaque voile, en demi-tours. Le grand couvre un peu plus
  // que la moitié, et il reste une encoche à chaque jointure : sans elle les
  // deux voiles se referment en un entonnoir lisse où on ne voit plus qu'ils
  // sont deux.
  const ARC = [[-0.575, 1.15], [0.625, 0.80]];
  function shapeLeaflets(open) {
    for (let li = 0; li < 2; li++) {
      const pos = leafPos[li];
      const [a0, span] = ARC[li];
      const edge = leafEdge[li]; edge.length = 0;
      const big = li === 0;
      for (let i = 0; i <= SS; i++) {
        const s = i / SS;
        const th = (a0 + s * span) * Math.PI;
        const ct = Math.cos(th), st = Math.sin(th);
        // festons : le petit voile est découpé en trois lobes
        const scal = big ? 1 : 1 - 0.16 * Math.abs(Math.sin(s * Math.PI * 3));
        const hang = big ? 118 : 84;
        for (let j = 0; j <= VV; j++) {
          const v = j / VV;
          const vs = v * v * (3 - 2 * v);
          // fermée : le bord libre se rapproche du centre. Ouverte : il s'écarte
          // vers la paroi et le voile se plaque presque contre l'anneau.
          const rFree = lerp(big ? 16 : 26, MIT_R * 0.99, open);
          let r = lerp(MIT_R, rFree, vs) * scal;
          r += Math.sin(v * Math.PI) * (13 * open + 5);
          const drop = hang * (0.42 + 0.58 * (1 - open)) * vs * scal;
          const k = (i * (VV + 1) + j) * 3;
          const x = MIT.x + ct * r, y = MIT.y + st * r;
          const z = MIT_Z - drop - Math.sin(s * Math.PI) * 7 * (1 - open);
          pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
          if (j === VV && i % 4 === 0) edge.push(new THREE.Vector3(x, y, z));
        }
      }
      leafGeos[li].attributes.position.needsUpdate = true;
      leafGeos[li].computeVertexNormals();
    }
  }
  shapeLeaflets(0.5);

  /* ── cordages : des filins tendus, pas des cheveux d'un pixel ──
     Chaque pilier porte trois points d'ancrage légèrement écartés : un
     faisceau qui converge en un point unique se lit comme une harpe, pas
     comme un cordage. */
  const anchors = papTips.map((tip, i) => {
    const side = new THREE.Vector3(-tip.y, tip.x, 0).normalize();
    return [-1, 0, 1].map(k => tip.clone().addScaledVector(side, k * 13).add(new THREE.Vector3(0, 0, i ? -4 : 4)));
  });
  const CORDS = leafEdge[0].length + leafEdge[1].length;
  const cord = strands(CORDS, 6, {
    root: 0xf0d8cc, tip: 0xfff6f0, width: 1.5, minWidth: 0.42, alpha: 0.92, sag: 7, ambient: 0.55,
  });
  group.add(cord.mesh);
  const _cordPairs = [];
  function updateCords() {
    _cordPairs.length = 0;
    // chaque voile est retenu par les DEUX piliers : c'est ce croisement qui
    // l'empêche de basculer, et c'est visible quand on se met dessous
    for (let li = 0; li < 2; li++) {
      const edge = leafEdge[li];
      for (let i = 0; i < edge.length; i++) {
        const pil = (i < edge.length / 2) ? 0 : 1;
        _cordPairs.push([edge[i], anchors[pil][i % 3]]);
      }
    }
    cord.update((i, a, b) => { a.copy(_cordPairs[i][0]); b.copy(_cordPairs[i][1]); }, _cordPairs.length);
  }
  updateCords();

  /* ── valve de sortie : trois nids d'hirondelle ── */
  const CS = 26, CV = 10;
  const cuspGeos = [], cuspPos = [];
  for (let ci = 0; ci < 3; ci++) {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array((CS + 1) * (CV + 1) * 3);
    const idx = [];
    for (let i = 0; i < CS; i++) for (let j = 0; j < CV; j++) {
      const a = i * (CV + 1) + j, b = a + CV + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(AOR.x, AOR.y, AOR_Z + 40), 180);
    cuspGeos.push(g); cuspPos.push(pos);
  }
  const cuspMat = tissue({
    side: THREE.DoubleSide, bump: false,
    deep: 0x6a2830, mid: 0xf0d0c0, hot: 0xfffaf2,
    noiseScale: 0.07, displace: 0.4, pulseAmp: 0.1,
    normalMix: 0.08, rim: 0.75, wet: 0.66, shiny: 48, falloff: 0.00002, ambient: 0.42, light: 1.6,
  });
  cuspGeos.forEach(g => { const m = new THREE.Mesh(g, cuspMat); m.frustumCulled = false; group.add(m); });

  /**
   * Un nid d'hirondelle est attaché le long d'une couronne festonnée (haute
   * aux deux commissures, basse au milieu) et son bord libre est une corde
   * droite entre les deux commissures. Fermée, les trois cordes dessinent le
   * Y qu'on voit sur toutes les planches. Ouverte, elles reculent contre la
   * paroi et laissent un rond franc.
   */
  const SEAT = 14, RISE = 34;
  function shapeCusps(open) {
    for (let ci = 0; ci < 3; ci++) {
      const pos = cuspPos[ci];
      const a0 = (ci / 3) * Math.PI * 2 - Math.PI / 6;
      const a1 = a0 + Math.PI * 2 / 3;
      const P0 = [Math.cos(a0) * AOR_R, Math.sin(a0) * AOR_R];
      const P1 = [Math.cos(a1) * AOR_R, Math.sin(a1) * AOR_R];
      for (let i = 0; i <= CS; i++) {
        const s = i / CS;
        const th = a0 + s * (Math.PI * 2 / 3);
        const ct = Math.cos(th), st = Math.sin(th);
        const dip = Math.sin(s * Math.PI);              // 0 aux commissures, 1 au creux
        // attache : la couronne, plaquée contre la paroi du conduit
        const ax = ct * AOR_R, ay = st * AOR_R;
        const az = AOR_Z + SEAT + RISE * (1 - dip);
        // bord libre : corde fermée → arc ouvert
        const cx = lerp(P0[0], P1[0], s), cy = lerp(P0[1], P1[1], s);
        const ox = ct * AOR_R * 0.93, oy = st * AOR_R * 0.93;
        const fx = lerp(cx, ox, open), fy = lerp(cy, oy, open);
        const fz = AOR_Z + SEAT + RISE * 0.62 + open * 34;
        for (let j = 0; j <= CV; j++) {
          const v = j / CV;
          const vs = v * v * (3 - 2 * v);
          // la poche se creuse vers le ventricule quand la valve est fermée
          const belly = Math.sin(v * Math.PI) * dip * (30 * (1 - open) + 4);
          const k = (i * (CV + 1) + j) * 3;
          pos[k] = lerp(ax, fx, vs);
          pos[k + 1] = lerp(ay, fy, vs);
          pos[k + 2] = lerp(az, fz, vs) - belly;
        }
      }
      // recentrage sur l'orifice
      for (let k = 0; k < pos.length; k += 3) { pos[k] += AOR.x; pos[k + 1] += AOR.y; }
      cuspGeos[ci].attributes.position.needsUpdate = true;
      cuspGeos[ci].computeVertexNormals();
    }
  }
  shapeCusps(0.1);

  /* ── le sang dans la chambre ── */
  const ch = makeChannel({ ax1: 10, fx1: 0.004, ax2: 0, fx2: 0, ay1: 8, fy1: 0.005, ay2: 0, fy2: 0 });
  const N = Math.round(1100 * clamp(q * 1.3, 0.4, 1));
  const at = flowAttributes(N, rnd, { radiusBias: 0.5, sizeMin: 2.4, sizeMax: 3.7, spin: 1.6 });
  const surge = new THREE.Mesh(instanced(biconcaveGeometry(1, 14, 8), N, {
    aU: { array: at.aU, size: 1 }, aRad: { array: at.aRad, size: 1 }, aAng: { array: at.aAng, size: 1 },
    aSize: { array: at.aSize, size: 1 }, aSeed: { array: at.aSeed, size: 1 }, aSpin: { array: at.aSpin, size: 1 },
  }), flowCells(ch, {
    deep: 0x5c060f, mid: 0xd8303c, hot: 0xff9c86,
    z0: APEX + 30, z1: BASE + 320, radius: 132, speed: 0.022, swirl: 0.14, wobble: 2.4,
    spinRate: 1.0, falloff: 0.00003, rim: 0.72, wet: 0.4, ambient: 0.24, pulseAmp: 3.0, clear: 32,
  }));
  surge.frustumCulled = false;
  group.add(surge);

  const mist = moteField(Math.round(700 * q), 400, {
    shape: 'sphere', colorA: 0xff6a5c, colorB: 0xffc2a8,
    size: 3.6, drift: 14, rate: 0.22, intensity: 0.22, twinkle: 0.6,
    maxPx: 22, near: 40,
  }, 71);
  mist.position.z = -70;
  group.add(mist);

  /* Une lueur au fond de chaque conduit : une porte ouverte doit donner sur
     quelque part, pas sur un trou noir. */
  for (const [c, r, z, col] of [[MIT, MIT_R, MIT_Z + 210, 0xff5a66], [AOR, AOR_R, AOR_Z + 250, 0xff8a6a]]) {
    const d = new THREE.Mesh(new THREE.CircleGeometry(r * 1.3, 32),
      glow({ color: col, intensity: 0.5, core: 0.32, power: 1.6 }));
    d.position.set(c.x, c.y, z);
    group.add(d);
  }

  /* ── le donneur de tempo : une braise au plafond ── */
  const nodePos = new THREE.Vector3(-118, 128, BASE + 6);
  const node = new THREE.Mesh(new THREE.SphereGeometry(13, 20, 14),
    glow({ color: 0xffe9a0, intensity: 0.9, core: 0.55, power: 2.0, pulseAmp: 3.2 }));
  node.position.copy(nodePos);
  group.add(node);

  /* On entre par la pointe, nez levé vers les deux portes : dès la première
     image on doit comprendre qu'on est sous le plafond d'une pompe. */
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(6, -14, APEX + 105),
    new THREE.Vector3(-16, 6, APEX + 190),
    new THREE.Vector3(-52, 18, -110),
    new THREE.Vector3(-64, 4, -10),
    new THREE.Vector3(MIT.x, MIT.y, MIT_Z - 150),
    new THREE.Vector3(AOR.x, AOR.y, AOR_Z + 40),
  ]);
  path.curveType = 'centripetal';

  const spots = {
    valve: {
      p: new THREE.Vector3(MIT.x, MIT.y, MIT_Z - 60), r: MIT_R,
      view: new THREE.Vector3(MIT.x + 30, MIT.y - 40, MIT_Z - 260),
    },
    aorte: {
      p: new THREE.Vector3(AOR.x, AOR.y, AOR_Z + 34), r: AOR_R,
      view: new THREE.Vector3(AOR.x + 26, AOR.y - 34, AOR_Z - 175),
    },
    cordage: {
      p: papTips[0].clone().lerp(new THREE.Vector3(MIT.x, MIT.y, MIT_Z - 105), 0.5), r: 56,
      view: papTips[0].clone().add(new THREE.Vector3(-16, -108, -40)),
    },
    myocarde: {
      p: new THREE.Vector3(-radiusAt(0.5), 0, lerp(APEX, BASE, 0.5)), r: 96,
      view: new THREE.Vector3(-radiusAt(0.5) + 145, 12, lerp(APEX, BASE, 0.5) + 24),
    },
    sinusal: {
      p: nodePos.clone(), r: 26,
      view: nodePos.clone().add(new THREE.Vector3(52, -58, -120)),
    },
  };

  let openM = 0.5, openA = 0.1;
  return {
    group, path, spots, spotFar: 620,
    speed: 0.0088, freeSpeed: 82, lookAhead: 0.016, fov: 76, shake: 1.0,
    bounds: { type: 'sphere', center: new THREE.Vector3(0, 0, -60), radius: 268 },
    // une seule source haute, chaude, qui vient du plafond des valves
    light: {
      key:  { dir: [0.18, 0.55, 0.82], color: 0xff8a60, int: 0.66 },
      fill: { dir: [-0.7, -0.35, -0.4], color: 0x4a1224, int: 0.16 },
      sky:  { top: 0x8a1a24, bot: 0x12000a, int: 0.17 },
    },
    grade: { bloom: 0.62, tint: [1.08, 0.95, 0.95], vig: 0.6, exposure: 1.04 },
    update(t, dt, pulse, breath, cam) {
      // Les deux portes jouent en alternance : la valve d'entrée se ferme au
      // moment où la valve de sortie s'ouvre. C'est le cœur du battement, et
      // c'est ce qu'on doit pouvoir constater à l'œil.
      let mit = clamp(1.05 - pulse * 1.9, 0, 1);
      const aor = clamp(pulse * 1.55 - 0.12, 0, 1);
      // courtoisie : la porte s'entrouvre quand la sonde vient s'y coller
      if (cam) {
        const d = Math.hypot(cam.position.x - MIT.x, cam.position.y - MIT.y) < MIT_R * 1.5
          ? Math.abs(cam.position.z - MIT_Z) : 1e9;
        mit = Math.max(mit, clamp(1 - d / 200, 0, 1));
      }
      openM = lerp(openM, mit, 1 - Math.pow(0.0009, dt));
      openA = lerp(openA, aor, 1 - Math.pow(0.0004, dt));
      shapeLeaflets(openM);
      shapeCusps(openA);
      updateCords();

      // l'onde électrique part du plafond et descend vers la pointe
      U.uWaveZ.value = BASE + 70 - (U.uBeat.value / 0.34) * (BASE - APEX + 200);

      // la chambre se resserre franchement à chaque coup
      const k = 1 - pulse * 0.075;
      muscle.scale.set(k, k, 1 - pulse * 0.05);
    },
  };
}
