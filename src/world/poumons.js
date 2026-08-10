import * as THREE from 'three';
import { tissue, membrane, stalkField, spindle, instanced, moteField, glow, voidDome, driftCells } from '../core/mat.js';
import { makeChannel, channelTube, mergeGeometries, biconcaveGeometry, rng, lerp } from '../core/build.js';

/**
 * ESCALE 4 — la bronchiole puis les sacs alvéolaires.
 * Une mousse de bulles translucides qui se gonflent au rythme de la
 * respiration, prises dans un filet de capillaires.
 */
export default function poumons(q = 1) {
  const group = new THREE.Group();
  const rnd = rng(404);

  const dome = new THREE.Mesh(new THREE.SphereGeometry(2200, 32, 22),
    voidDome({ top: 0x203442, bottom: 0x0a1016, cloud: 0x3d5a6b, clouds: 0.5, scale: 0.7 }));
  group.add(dome);

  /* ── bronchiole d'entrée ── */
  const ch = makeChannel({ ax1: 22, fx1: 0.006, ax2: 8, fx2: 0.019, ay1: 16, fy1: 0.008, ay2: 6, fy2: 0.014 });
  const BZ0 = -900, BZ1 = 40, BR = 54;
  const bronch = new THREE.Mesh(channelTube(ch, BZ0, BZ1, {
    segments: 220, radial: 36,
    radius: (u) => BR * (1 + 0.10 * Math.sin(u * 22) + 0.28 * Math.pow(u, 3)),
    warp: (u, a) => 2.4 * Math.sin(a * 9 + u * 30),
    uRepeat: 16,
  }), tissue({
    side: THREE.DoubleSide,
    deep: 0x35181e, mid: 0xcc868a, hot: 0xffdad4,
    noiseScale: 0.045, displace: 1.6, breathAmp: 0.5,
    bumpScale: 0.55, bumpAmp: 0.4, normalMix: 0.5,
    rim: 0.6, wet: 0.45, shiny: 28, falloff: 0.00016, ambient: 0.24, light: 1.35,
    vein: true, veinAmt: 0.35, veinScale: 0.12,
  }));
  group.add(bronch);

  /* Cils vibratiles. Ils étaient trop longs et trop espacés : de loin, une
     poignée de vers blancs collés au tuyau. Un tapis, c'est court, dense et
     serré, et ça bat toujours dans le même sens. */
  const NC = Math.round(13000 * q);
  const cPos = new Float32Array(NC * 3), cDir = new Float32Array(NC * 3),
        cSc = new Float32Array(NC * 2), cSeed = new Float32Array(NC);
  for (let i = 0; i < NC; i++) {
    const z = lerp(BZ0 + 20, BZ1 - 10, rnd());
    const a = rnd() * 6.28;
    const c = ch.center(z), f = ch.frame(z);
    const r = BR * (1 + 0.10 * Math.sin(((z - BZ0) / (BZ1 - BZ0)) * 22) + 0.28 * Math.pow((z - BZ0) / (BZ1 - BZ0), 3)) - 1;
    const nx = f.n.x * Math.cos(a) + f.b.x * Math.sin(a);
    const ny = f.n.y * Math.cos(a) + f.b.y * Math.sin(a);
    const nz = f.n.z * Math.cos(a) + f.b.z * Math.sin(a);
    cPos[i * 3] = c.x + nx * r; cPos[i * 3 + 1] = c.y + ny * r; cPos[i * 3 + 2] = c.z + nz * r;
    cDir[i * 3] = -nx; cDir[i * 3 + 1] = -ny; cDir[i * 3 + 2] = -nz;
    cSc[i * 2] = 0.4 + rnd() * 0.3; cSc[i * 2 + 1] = 2.6 + rnd() * 1.8;
    cSeed[i] = rnd();
  }
  const cilia = new THREE.Mesh(instanced(spindle(5), NC, {
    aPos: { array: cPos, size: 3 }, aDir: { array: cDir, size: 3 },
    aScale: { array: cSc, size: 2 }, aSeed: { array: cSeed, size: 1 },
  }), stalkField({
    root: 0x6e3038, tip: 0xd89a96, hot: 0xffcac2,
    sway: 0.55, rate: 3.6, rim: 0.6, wet: 0.28, ambient: 0.34, falloff: 0.00012, tipGlow: 0.03,
    rootAO: 0.35,
  }));
  cilia.frustumCulled = false;
  group.add(cilia);

  /* De la lumière au bout du couloir. Sans elle, la bronchiole débouchait sur
     un trou sombre où les membranes translucides des sacs voisins montraient
     leurs arêtes : ça ressemblait à un défaut de rendu. */
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(BR * 2.2, 24, 16),
    glow({ color: 0xffd8e2, intensity: 0.24, core: 0.05, power: 2.2 }));
  mouth.position.copy(ch.center(BZ1 + 40));
  group.add(mouth);

  /* ── mousse alvéolaire ── */
  const alv = [], centers = [];
  const NA = Math.round(220 * q);
  const corridor = (z) => new THREE.Vector3(Math.sin(z * 0.0035) * 90, Math.cos(z * 0.0027) * 60, z);
  for (let i = 0; i < NA; i++) {
    const z = lerp(60, 1500, Math.pow(rnd(), 0.9));
    const a = rnd() * 6.28;
    const rad = 120 + Math.pow(rnd(), 0.6) * 300;
    const c = corridor(z);
    const p = new THREE.Vector3(c.x + Math.cos(a) * rad, c.y + Math.sin(a) * rad * 0.85, z + (rnd() - 0.5) * 130);
    const r = 46 + rnd() * 82;
    const g = new THREE.SphereGeometry(r, 26, 18);
    g.translate(p.x, p.y, p.z);
    alv.push(g); centers.push({ p, n: g.attributes.position.count, r });
  }
  const alvGeo = mergeGeometries(alv);
  const aCenter = new Float32Array(alvGeo.attributes.position.count * 3);
  let off = 0;
  for (const c of centers) {
    for (let i = 0; i < c.n; i++) { aCenter[(off + i) * 3] = c.p.x; aCenter[(off + i) * 3 + 1] = c.p.y; aCenter[(off + i) * 3 + 2] = c.p.z; }
    off += c.n;
  }
  alvGeo.setAttribute('aCenter', new THREE.BufferAttribute(aCenter, 3));
  alv.forEach(g => g.dispose());

  const alvMesh = new THREE.Mesh(alvGeo, membrane({
    centers: true, inner: 0x4a6478, edge: 0xffd8e2, power: 2.3, base: 0.06,
    rimAlpha: 0.72, glow: 0.55, irid: 0.16, alpha: 0.95,
    wobble: 1.4, noiseScale: 0.06, breathAmp: 0.085,
  }));
  alvMesh.renderOrder = 2;
  group.add(alvMesh);

  /* halo interne : chaque alvéole capte la lumière */
  const alvCore = new THREE.Mesh(alvGeo, glow({ color: 0xffb8c8, intensity: 0.035, core: 0.0, power: 3.4 }));
  alvCore.renderOrder = 1;
  group.add(alvCore);

  /* ── filet capillaire ── */
  const capGeos = [];
  for (let i = 0; i < centers.length; i += 1) {
    if (rnd() > 0.75 * q + 0.15) continue;
    const c = centers[i];
    for (let k = 0; k < 2; k++) {
      // arcs partiels et non des anneaux entiers : un cercle complet posé
      // autour d'une bulle se lit comme un cerceau, pas comme un vaisseau
      const g = new THREE.TorusGeometry(c.r * (0.96 + rnd() * 0.08), 3.4 + rnd() * 1.8, 6, 24,
        Math.PI * (0.9 + rnd() * 0.9));
      g.rotateX(rnd() * 3.14); g.rotateY(rnd() * 3.14); g.rotateZ(rnd() * 3.14);
      g.translate(c.p.x, c.p.y, c.p.z);
      capGeos.push(g);
    }
  }
  const caps = new THREE.Mesh(mergeGeometries(capGeos), tissue({
    side: THREE.DoubleSide, bump: false,
    deep: 0x7a1420, mid: 0xd84450, hot: 0xffa898,
    noiseScale: 0.08, displace: 0.5, breathAmp: 0.1,
    rim: 0.9, wet: 0.5, shiny: 30, falloff: 0.0000045, ambient: 0.5, light: 1.4, normalMix: 0.28,
  }));
  capGeos.forEach(g => g.dispose());
  group.add(caps);

  /* ══════════ le sac qu'on va visiter ══════════
     Trois des quatre repères de l'escale portent sur la même chose vue de
     trois façons : la bulle, le film qui la tapisse, et le vaisseau qui
     l'enlace. Il fallait donc un sac unique, plus grand que les autres, à
     l'écart de la mousse, dont on puisse faire le tour. */
  const HERO = new THREE.Vector3(-40, 40, 640);
  const HR = 215;

  const sac = new THREE.Mesh(new THREE.SphereGeometry(HR, 60, 40), membrane({
    inner: 0x35505f, edge: 0xffe2ea, power: 2.1, base: 0.045,
    rimAlpha: 0.62, glow: 0.5, irid: 0.14, alpha: 0.94,
    wobble: 2.2, noiseScale: 0.02, breathAmp: 0.0,
  }));
  sac.position.copy(HERO);
  sac.renderOrder = 3;
  group.add(sac);

  // le film savonneux : une pellicule irisée juste sous la paroi
  const film = new THREE.Mesh(new THREE.SphereGeometry(HR * 0.955, 48, 32), membrane({
    inner: 0x203a4a, edge: 0xcfe8ff, power: 3.0, base: 0.02,
    rimAlpha: 0.5, glow: 0.9, irid: 0.85, alpha: 0.7,
    wobble: 1.0, noiseScale: 0.05, additive: true,
  }));
  film.position.copy(HERO);
  film.renderOrder = 4;
  group.add(film);

  /* le capillaire : un fil enroulé autour du sac, où les hématies passent
     à la file indienne. C'est la seule façon de rendre visible « un par un ». */
  const capPts = [];
  const TURNS = 3.1;
  for (let i = 0; i <= 260; i++) {
    const t = i / 260;
    const phi = Math.acos(1 - 2 * (0.08 + 0.84 * t));
    const th = t * TURNS * Math.PI * 2;
    const rr = HR * 1.045;
    capPts.push(new THREE.Vector3(
      HERO.x + Math.sin(phi) * Math.cos(th) * rr,
      HERO.y + Math.cos(phi) * rr,
      HERO.z + Math.sin(phi) * Math.sin(th) * rr));
  }
  const capCurve = new THREE.CatmullRomCurve3(capPts);
  const capTube = new THREE.Mesh(new THREE.TubeGeometry(capCurve, 300, 9.5, 12, false), tissue({
    side: THREE.DoubleSide, bump: false, transparent: true, alpha: 0.5, depthWrite: false,
    deep: 0x5a0a16, mid: 0xc03040, hot: 0xff9a8c,
    noiseScale: 0.06, displace: 0.3, normalMix: 0.2,
    rim: 1.0, wet: 0.5, shiny: 28, falloff: 0.00002, ambient: 0.3,
  }));
  capTube.renderOrder = 5;
  group.add(capTube);

  // les hématies dedans, en file : leurs positions sont relues sur la courbe
  const NRB = 46;
  const rbPos = new Float32Array(NRB * 3), rbSize = new Float32Array(NRB),
        rbSeed = new Float32Array(NRB), rbSpin = new Float32Array(NRB);
  for (let i = 0; i < NRB; i++) { rbSize[i] = 7.4; rbSeed[i] = rnd(); rbSpin[i] = 0.2; }
  const rbSrc = biconcaveGeometry(1, 18, 10);
  const rbGeo = new THREE.InstancedBufferGeometry();
  rbGeo.index = rbSrc.index;
  for (const k in rbSrc.attributes) rbGeo.setAttribute(k, rbSrc.attributes[k]);
  const rbAttr = new THREE.InstancedBufferAttribute(rbPos, 3);
  rbAttr.setUsage(THREE.DynamicDrawUsage);
  rbGeo.setAttribute('aPos', rbAttr);
  rbGeo.setAttribute('aSize', new THREE.InstancedBufferAttribute(rbSize, 1));
  rbGeo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(rbSeed, 1));
  rbGeo.setAttribute('aSpin', new THREE.InstancedBufferAttribute(rbSpin, 1));
  rbGeo.instanceCount = NRB;
  rbGeo.boundingSphere = new THREE.Sphere(HERO.clone(), HR * 1.4);
  const rbc = new THREE.Mesh(rbGeo, driftCells({
    deep: 0x6c0a14, mid: 0xdc3a44, hot: 0xffa896,
    drift: 0, rate: 0, spinRate: 0.35, falloff: 0.00003,
    rim: 0.8, wet: 0.4, ambient: 0.34, clear: 14,
  }));
  rbc.frustumCulled = false;
  rbc.renderOrder = 6;
  group.add(rbc);
  const _rb = new THREE.Vector3();
  function flowRBC(t) {
    for (let i = 0; i < NRB; i++) {
      const u = (i / NRB + t * 0.035) % 1;
      capCurve.getPointAt(u, _rb);
      rbPos[i * 3] = _rb.x; rbPos[i * 3 + 1] = _rb.y; rbPos[i * 3 + 2] = _rb.z;
    }
    rbAttr.needsUpdate = true;
  }
  flowRBC(0);

  /* ── gaz ── */
  const o2 = moteField(Math.round(2200 * q), 900, {
    shape: 'sphere', colorA: 0x9fe4ff, colorB: 0xe4faff,
    size: 6, drift: 26, rate: 0.16, intensity: 0.55, twinkle: 0.9,
  }, 91);
  o2.position.z = 700;
  group.add(o2);

  const co2 = moteField(Math.round(700 * q), 700, {
    shape: 'sphere', colorA: 0x8a7f8f, colorB: 0xb8aec0,
    size: 5, drift: 20, rate: 0.1, intensity: 0.3, twinkle: 0.5,
  }, 92);
  co2.position.z = 620;
  group.add(co2);

  const path = new THREE.CatmullRomCurve3([
    ...Array.from({ length: 10 }, (_, i) => ch.center(lerp(BZ0 + 60, BZ1 - 20, i / 9))),
    corridor(180), corridor(360).add(new THREE.Vector3(40, 20, 0)),
    corridor(560).add(new THREE.Vector3(-60, -10, 0)),
    corridor(760).add(new THREE.Vector3(30, 40, 0)),
    corridor(980).add(new THREE.Vector3(-20, -30, 0)),
    corridor(1220), corridor(1440),
  ]);
  path.curveType = 'centripetal';

  const capMid = capCurve.getPointAt(0.5);
  const spots = {
    alveole: { p: HERO.clone(), r: HR, view: HERO.clone().add(new THREE.Vector3(-330, 150, -400)) },
    capillaire: { p: capMid.clone(), r: 26, view: capMid.clone().sub(HERO).multiplyScalar(1.4).add(HERO).add(new THREE.Vector3(30, 40, 0)) },
    surfactant: { p: HERO.clone().add(new THREE.Vector3(0, -HR * 0.62, 0)), r: 60,
                  view: HERO.clone().add(new THREE.Vector3(20, 30, 30)) },
    bronchiole: { p: ch.center(-320), r: 54, view: ch.center(-500).add(new THREE.Vector3(14, 10, 0)) },
  };

  return {
    group, path, spots, spotFar: 900,
    speed: 0.0095, freeSpeed: 90, lookAhead: 0.014, fov: 72, shake: 0.4,
    bounds: { type: 'sphere', center: new THREE.Vector3(0, 0, 420), radius: 900 },
    // brume matinale : tout est diffus, peu de contraste
    light: {
      key:  { dir: [0.2, 0.95, 0.3], color: 0xffd8dc, int: 0.4 },
      fill: { dir: [-0.3, -0.5, -0.7], color: 0x90b0ff, int: 0.32 },
      sky:  { top: 0xd8e0ff, bot: 0x503038, int: 0.34 },
    },
    grade: { bloom: 0.8, tint: [0.97, 1.0, 1.05], vig: 0.48, exposure: 1.1 },
    update(t, dt, pulse, breath, cam) {
      if (cam) { o2.position.copy(cam.position); co2.position.copy(cam.position); }
      dome.rotation.y = t * 0.004;
      flowRBC(t);
      // le sac respire pour de bon : il se gonfle et se dégonfle avec le cycle
      const s = 1 + breath * 0.055;
      sac.scale.setScalar(s); film.scale.setScalar(s);
    },
  };
}
