import * as THREE from 'three';
import { tissue, flowCells, flowAttributes, instanced, moteField, glow, U } from '../core/mat.js';
import { makeChannel, blob, biconcaveGeometry, rng, mergeGeometries, clamp, lerp } from '../core/build.js';

/**
 * ESCALE 3 — le ventricule gauche.
 * Une cathédrale musculaire qui se contracte, deux feuillets valvulaires
 * qui s'ouvrent à chaque systole, leurs cordages tendus vers les piliers.
 */
export default function coeur() {
  const group = new THREE.Group();
  // Tout ce qui est muscle vit dans ce sous-groupe : il se resserre pour de
  // bon à chaque battement. Sans cette contraction d'ensemble, on voyait une
  // grotte qui frémit, pas une pompe qui pousse.
  const muscle = new THREE.Group();
  group.add(muscle);
  const rnd = rng(303);
  const VALVE_Z = 150, Ra = 108;

  /* ── paroi ventriculaire ── */
  const wallGeo = blob(365, 6, (n, v) => {
    const ridge = Math.sin(n.y * 7 + n.x * 4) * Math.sin(n.z * 6 - n.y * 3);
    const cav = Math.max(0, -n.z) * 26;                    // creusé côté apex
    return ridge * 22 + Math.sin(n.x * 13) * Math.sin(n.z * 11) * 8 - cav;
  });
  const wall = new THREE.Mesh(wallGeo, tissue({
    side: THREE.BackSide,
    deep: 0x3c0810, mid: 0xbe2431, hot: 0xff8878,
    noiseScale: 0.02, displace: 9, pulseAmp: 0.9,
    bumpScale: 0.28, bumpAmp: 0.5, normalMix: 0.42,
    rim: 0.6, wet: 0.45, shiny: 26, falloff: 0.000015, ambient: 0.24, light: 1.5, emissive: 0x1a0206,
    vein: true, veinAmt: 0.5, veinScale: 0.05,
  }));
  muscle.add(wall);

  /* ── trabécules charnues ── */
  const trab = [];
  for (let i = 0; i < 22; i++) {
    const a0 = rnd() * 6.28, a1 = a0 + (rnd() - 0.5) * 1.6;
    const z0 = -230 + rnd() * 300, z1 = z0 + 80 + rnd() * 200;
    const r0 = 235 + rnd() * 65, r1 = 225 + rnd() * 75;
    const pts = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6, a = lerp(a0, a1, t), r = lerp(r0, r1, t) * (1 - 0.18 * Math.sin(t * Math.PI));
      pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.9, lerp(z0, z1, t)));
    }
    const c = new THREE.CatmullRomCurve3(pts);
    trab.push(new THREE.TubeGeometry(c, 34, 5 + rnd() * 8, 10, false));
  }
  const trabMesh = new THREE.Mesh(mergeGeometries(trab), tissue({
    side: THREE.DoubleSide, deep: 0x400a16, mid: 0xc23448, hot: 0xffa08e,
    noiseScale: 0.05, displace: 2, pulseAmp: 0.6, bumpScale: 0.4, bumpAmp: 0.3,
    normalMix: 0.28, rim: 0.75, wet: 0.45, shiny: 28, falloff: 0.00004, ambient: 0.2,
  }));
  trab.forEach(g => g.dispose());
  muscle.add(trabMesh);

  /* ── piliers ── */
  const papGeos = [];
  const papTips = [];
  for (const ang of [Math.PI * 0.5, Math.PI * 1.5]) {
    const base = new THREE.Vector3(Math.cos(ang) * 175, Math.sin(ang) * 175, -60);
    const tip = new THREE.Vector3(Math.cos(ang) * 118, Math.sin(ang) * 118, 52);
    papTips.push(tip);
    const c = new THREE.CatmullRomCurve3([
      base.clone().addScaledVector(base.clone().normalize(), 40),
      base, base.clone().lerp(tip, 0.55), tip,
    ]);
    const g = new THREE.TubeGeometry(c, 40, 30, 22, false);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const t = i / p.count;
      p.setXYZ(i, p.getX(i) * (1 - t * 0.35), p.getY(i) * (1 - t * 0.35), p.getZ(i));
    }
    g.computeVertexNormals();
    papGeos.push(g);
  }
  const pap = new THREE.Mesh(mergeGeometries(papGeos), tissue({
    side: THREE.DoubleSide, deep: 0x3c0812, mid: 0xba2a3c, hot: 0xff9080,
    noiseScale: 0.03, displace: 5, pulseAmp: 0.8, bumpScale: 0.3, bumpAmp: 0.45,
    normalMix: 0.24, rim: 0.6, wet: 0.45, shiny: 24, falloff: 0.00004, ambient: 0.2,
  }));
  papGeos.forEach(g => g.dispose());
  muscle.add(pap);

  /* ── feuillets mitraux (géométrie recalculée à chaque image) ── */
  const SS = 34, VV = 13;
  const leafGeos = [], leafPos = [];
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
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, VALVE_Z + 60), 260);
    leafGeos.push(g); leafPos.push(pos);
  }
  const leafMat = tissue({
    side: THREE.DoubleSide, bump: false,
    deep: 0x4a1018, mid: 0xe8b8b0, hot: 0xfff0e4,
    noiseScale: 0.06, displace: 0.8, pulseAmp: 0.2,
    normalMix: 0.15, rim: 0.85, wet: 0.6, shiny: 40, falloff: 0.00005, ambient: 0.34, light: 1.35,
  });
  const leaves = leafGeos.map(g => { const m = new THREE.Mesh(g, leafMat); m.frustumCulled = false; return m; });
  leaves.forEach(m => group.add(m));

  const edgePts = [[], []];
  function shapeLeaflets(open) {
    for (let li = 0; li < 2; li++) {
      const pos = leafPos[li], th0 = li * Math.PI - Math.PI * 0.49;
      edgePts[li].length = 0;
      for (let i = 0; i <= SS; i++) {
        const s = i / SS;
        const th = th0 + s * Math.PI * 0.98;
        const ct = Math.cos(th), st = Math.sin(th);
        for (let j = 0; j <= VV; j++) {
          const v = j / VV;
          const vs = v * v * (3 - 2 * v);
          const rFree = lerp(15, Ra * 0.99, open);
          let r = lerp(Ra, rFree, vs);
          r += Math.sin(v * Math.PI) * (16 * open + 4);
          r += Math.sin(s * Math.PI * 3.0) * 4.5 * (1 - vs) - Math.sin(s * Math.PI) * 6 * (1 - open) * vs;
          const z = VALVE_Z + v * (128 * (0.5 + 0.5 * open)) + Math.sin(s * Math.PI) * 8 * (1 - open);
          const k = (i * (VV + 1) + j) * 3;
          pos[k] = ct * r; pos[k + 1] = st * r * 0.96; pos[k + 2] = z;
          if (j === VV && i % 5 === 0) edgePts[li].push(new THREE.Vector3(ct * r, st * r * 0.96, z));
        }
      }
      leafGeos[li].attributes.position.needsUpdate = true;
      leafGeos[li].computeVertexNormals();
    }
  }
  shapeLeaflets(0.15);

  /* ── cordages ── */
  const CORDS = edgePts[0].length + edgePts[1].length;
  const cordGeo = new THREE.BufferGeometry();
  const cordPos = new Float32Array(CORDS * 2 * 3);
  cordGeo.setAttribute('position', new THREE.BufferAttribute(cordPos, 3));
  cordGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, VALVE_Z), 320);
  const cords = new THREE.LineSegments(cordGeo, new THREE.LineBasicMaterial({
    color: 0xffd8cc, transparent: true, opacity: 0.55, depthWrite: false,
  }));
  cords.frustumCulled = false;
  group.add(cords);

  function updateCords() {
    let k = 0;
    for (let li = 0; li < 2; li++) {
      const tip = papTips[li];
      for (const p of edgePts[li]) {
        cordPos[k++] = p.x; cordPos[k++] = p.y; cordPos[k++] = p.z;
        cordPos[k++] = tip.x; cordPos[k++] = tip.y; cordPos[k++] = tip.z;
      }
    }
    cordGeo.attributes.position.needsUpdate = true;
  }
  updateCords();

  /* ── anneau valvulaire ── */
  const annulus = new THREE.Mesh(new THREE.TorusGeometry(Ra + 6, 13, 12, 64), tissue({
    side: THREE.DoubleSide, deep: 0x40080f, mid: 0xc06068, hot: 0xffc8b8,
    noiseScale: 0.05, displace: 1.5, pulseAmp: 0.3, bumpScale: 0.4, bumpAmp: 0.25,
    normalMix: 0.4, rim: 0.7, wet: 0.5, shiny: 30, falloff: 0.00005, ambient: 0.24,
  }));
  annulus.position.z = VALVE_Z;
  group.add(annulus);

  /* ── le flot qui traverse ── */
  const ch = makeChannel({ ax1: 8, fx1: 0.004, ax2: 0, fx2: 0, ay1: 6, fy1: 0.005, ay2: 0, fy2: 0 });
  const N = 900;
  const at = flowAttributes(N, rnd, { radiusBias: 0.5, sizeMin: 3.4, sizeMax: 5.4, spin: 1.6 });
  const surge = new THREE.Mesh(instanced(biconcaveGeometry(1, 14, 8), N, {
    aU: { array: at.aU, size: 1 }, aRad: { array: at.aRad, size: 1 }, aAng: { array: at.aAng, size: 1 },
    aSize: { array: at.aSize, size: 1 }, aSeed: { array: at.aSeed, size: 1 }, aSpin: { array: at.aSpin, size: 1 },
  }), flowCells(ch, {
    deep: 0x5c060f, mid: 0xd8303c, hot: 0xff9c86,
    z0: -340, z1: 420, radius: 96, speed: 0.02, swirl: 0.12, wobble: 2.2,
    spinRate: 1.0, falloff: 0.00008, rim: 0.9, wet: 0.4, ambient: 0.24, pulseAmp: 2.6, clear: 30,
  }));
  surge.frustumCulled = false;
  group.add(surge);

  const mist = moteField(900, 460, {
    shape: 'sphere', colorA: 0xff6a5c, colorB: 0xffc2a8,
    size: 4.2, drift: 14, rate: 0.22, intensity: 0.3, twinkle: 0.7,
    maxPx: 26, near: 34,
  }, 71);
  group.add(mist);

  /* lueur du nœud sinusal, en haut de la cavité */
  const node = new THREE.Mesh(new THREE.SphereGeometry(16, 20, 14),
    glow({ color: 0xffe9a0, intensity: 0.9, core: 0.6, power: 2.0, pulseAmp: 3.0 }));
  node.position.set(-40, 205, -170);
  group.add(node);

  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-30, -70, -255),
    new THREE.Vector3(-175, 20, -180),
    new THREE.Vector3(-170, 120, -30),
    new THREE.Vector3(15, 160, 35),
    new THREE.Vector3(160, 75, -55),
    new THREE.Vector3(100, -120, -105),
    new THREE.Vector3(-50, -95, 35),
    new THREE.Vector3(0, -6, 96),
    new THREE.Vector3(2, 0, VALVE_Z + 90),
    new THREE.Vector3(0, 0, VALVE_Z + 260),
  ]);
  path.curveType = 'centripetal';

  const spots = {
    valve: new THREE.Vector3(0, -78, VALVE_Z + 40),
    myocarde: new THREE.Vector3(-215, 60, -110),
    cordage: papTips[0].clone().lerp(new THREE.Vector3(0, 90, VALVE_Z + 70), 0.5),
    sinusal: node.position.clone(),
  };

  let openS = 0.15;
  return {
    group, path, spots, spotFar: 430,
    focus: { point: new THREE.Vector3(0, 0, VALVE_Z + 30), from: 0.60, to: 0.90, fade: 0.12 },
    speed: 0.0088, freeSpeed: 90, lookAhead: 0.016, fov: 76, shake: 1.0,
    bounds: { type: 'sphere', center: new THREE.Vector3(0, 0, 0), radius: 265 },
    // nef : une seule source haute, ombres franches
    light: {
      key:  { dir: [0.25, 1, -0.35], color: 0xff7a55, int: 0.62 },
      fill: { dir: [-0.6, -0.4, 0.5], color: 0x401020, int: 0.14 },
      sky:  { top: 0x7a1420, bot: 0x10000a, int: 0.16 },
    },
    grade: { bloom: 0.7, tint: [1.08, 0.95, 0.95], vig: 0.62, exposure: 1.02 },
    update(t, dt, pulse, breath, cam) {
      // ouverture : systole + écartement de courtoisie au passage de la sonde
      let target = clamp(0.10 + pulse * 1.5, 0, 1);
      if (cam) {
        const d = Math.hypot(cam.position.x, cam.position.y) < 150 ? Math.abs(cam.position.z - VALVE_Z) : 1e9;
        target = Math.max(target, clamp(1 - d / 240, 0, 1));
      }
      openS = lerp(openS, target, 1 - Math.pow(0.002, dt));
      shapeLeaflets(openS);
      updateCords();
      cords.material.opacity = 0.35 + 0.3 * (1 - openS);

      // la chambre se resserre franchement de 7 % à chaque coup — c'est ce
      // qu'on ressent quand les parois se rapprochent autour de la sonde
      const k = 1 - pulse * 0.07;
      muscle.scale.set(k, k, 1 - pulse * 0.045);
    },
  };
}
