import * as THREE from 'three';

/* ══════════ hasard reproductible ══════════ */

export function rng(seed = 1) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const smooth = (t) => t * t * (3 - 2 * t);

/* Bruit de valeur 3D côté CPU — sert au placement, pas au rendu. */
const _h = (x, y, z) => {
  let n = x * 374761393 + y * 668265263 + z * 1274126177;
  n = (n ^ (n >>> 13)) * 1274126177;
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
export function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
  const c = (i, j, k) => _h(xi + i, yi + j, zi + k);
  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), xf), x10 = lerp(c(0, 1, 0), c(1, 1, 0), xf);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), xf), x11 = lerp(c(0, 1, 1), c(1, 1, 1), xf);
  return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf) * 2 - 1;
}
export function fbm3(x, y, z, oct = 3) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += a * noise3(x * f, y * f, z * f); f *= 2.03; a *= 0.5; }
  return s;
}

/* ══════════ conduit analytique ══════════
   Une ligne médiane décrite par deux harmoniques sur X et deux sur Y.
   La même formule vit dans le chunk CURVE (glsl.js) : maillage, caméra et
   particules parcourent donc exactement le même tracé.                     */

export function makeChannel(p = {}) {
  const A = new THREE.Vector4(p.ax1 ?? 6, p.fx1 ?? 0.045, p.ax2 ?? 2.4, p.fx2 ?? 0.13);
  const B = new THREE.Vector4(p.ay1 ?? 4, p.fy1 ?? 0.062, p.ay2 ?? 1.8, p.fy2 ?? 0.105);
  const P = new THREE.Vector4(p.px1 ?? 0.4, p.px2 ?? 2.1, p.py1 ?? 1.2, p.py2 ?? 0.7);

  const center = (z, out = new THREE.Vector3()) => out.set(
    A.x * Math.sin(A.y * z + P.x) + A.z * Math.sin(A.w * z + P.y),
    B.x * Math.cos(B.y * z + P.z) + B.z * Math.sin(B.w * z + P.w),
    z);

  const tangent = (z, out = new THREE.Vector3()) => out.set(
    A.x * A.y * Math.cos(A.y * z + P.x) + A.z * A.w * Math.cos(A.w * z + P.y),
    -B.x * B.y * Math.sin(B.y * z + P.z) + B.z * B.w * Math.cos(B.w * z + P.w),
    1).normalize();

  const _up = new THREE.Vector3(), _t = new THREE.Vector3();
  const frame = (z) => {
    tangent(z, _t);
    _up.set(0, 1, 0);
    if (Math.abs(_t.y) > 0.92) _up.set(1, 0, 0);
    const n = new THREE.Vector3().crossVectors(_up, _t).normalize();
    const b = new THREE.Vector3().crossVectors(_t, n);
    return { t: _t.clone(), n, b };
  };

  const curve = (z0, z1, seg = 140) => {
    const pts = [];
    for (let i = 0; i <= seg; i++) pts.push(center(lerp(z0, z1, i / seg)));
    const c = new THREE.CatmullRomCurve3(pts);
    c.curveType = 'centripetal';
    return c;
  };

  return {
    center, tangent, frame, curve,
    uniforms: { uCurveA: { value: A }, uCurveB: { value: B }, uCurveP: { value: P } },
  };
}

/**
 * Maillage tubulaire suivant un conduit, rayon variable.
 * `radiusFn(u, z)` renvoie le rayon ; `warpFn(u, ang)` ajoute un relief radial.
 */
export function channelTube(channel, z0, z1, opts = {}) {
  const seg = opts.segments ?? 260;
  const rad = opts.radial ?? 40;
  const radiusFn = opts.radius ?? (() => 10);
  const warpFn = opts.warp ?? null;
  const pos = [], nor = [], uvs = [], idx = [];
  const c = new THREE.Vector3();

  for (let i = 0; i <= seg; i++) {
    const u = i / seg;
    const z = lerp(z0, z1, u);
    channel.center(z, c);
    const f = channel.frame(z);
    const r0 = radiusFn(u, z);
    for (let j = 0; j <= rad; j++) {
      const v = j / rad;
      const a = v * Math.PI * 2;
      const ca = Math.cos(a), sa = Math.sin(a);
      let r = r0;
      if (warpFn) r += warpFn(u, a, z);
      const nx = f.n.x * ca + f.b.x * sa;
      const ny = f.n.y * ca + f.b.y * sa;
      const nz = f.n.z * ca + f.b.z * sa;
      pos.push(c.x + nx * r, c.y + ny * r, c.z + nz * r);
      nor.push(-nx, -ny, -nz);      // orientées vers l'intérieur : on est dedans
      uvs.push(u * (opts.uRepeat ?? 8), v * (opts.vRepeat ?? 2));
    }
  }
  for (let i = 0; i < seg; i++) {
    for (let j = 0; j < rad; j++) {
      const a = i * (rad + 1) + j, b = a + rad + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}

/* Sphère déformée par une fonction de bruit — base de la plupart des organes. */
export function blob(radius, detail, fn, seed = 1) {
  const g = new THREE.IcosahedronGeometry(radius, detail);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = v.clone().normalize();
    const d = fn(n, v, seed);
    v.addScaledVector(n, d);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

/* Disque biconcave : globule rouge. */
export function biconcaveGeometry(r = 1, seg = 26, ring = 14) {
  const g = new THREE.SphereGeometry(r, seg, ring);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const rad = Math.sqrt(v.x * v.x + v.z * v.z) / r;      // 0 au centre, 1 au bord
    const dimple = 0.30 + 0.70 * Math.pow(rad, 2.4);
    v.y *= 0.34 * dimple;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

/* Arbre récursif : bronches, neurones, vaisseaux. Renvoie des segments. */
export function branchTree(opts = {}) {
  const {
    origin = new THREE.Vector3(), dir = new THREE.Vector3(0, -1, 0),
    length = 30, radius = 3, depth = 5, split = 2,
    lengthDecay = 0.72, radiusDecay = 0.66, spread = 0.55, seed = 7, jitter = 0.35,
  } = opts;
  const rnd = rng(seed);
  const segs = [];
  const walk = (o, d, len, rad, lvl, dist = 0) => {
    const end = o.clone().addScaledVector(d, len);
    segs.push({ a: o.clone(), b: end, r0: rad, r1: rad * radiusDecay, level: lvl, d0: dist, d1: dist + len });
    if (lvl >= depth) return;
    const n = (lvl === 0 ? split : (rnd() < 0.18 ? split + 1 : split));
    for (let i = 0; i < n; i++) {
      const axis = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize();
      const nd = d.clone()
        .applyAxisAngle(axis, spread * (0.55 + rnd() * 0.9))
        .addScaledVector(new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5), jitter)
        .normalize();
      walk(end, nd, len * lengthDecay * (0.78 + rnd() * 0.44), rad * radiusDecay, lvl + 1, dist + len);
    }
  };
  walk(origin.clone(), dir.clone().normalize(), length, radius, 0, 0);
  return segs;
}

/**
 * Fusionne des segments en un seul maillage de troncs.
 * `uvAlong` place la distance-à-la-racine dans uv.x : une impulsion lumineuse
 * peut alors parcourir tout l'arbre sans rupture d'une branche à l'autre.
 */
export function segmentsToMesh(segs, material, radialSeg = 7, opts = {}) {
  const geos = [];
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion();
  const dir = new THREE.Vector3();
  const uvScale = opts.uvScale ?? 0.02;
  for (const s of segs) {
    dir.subVectors(s.b, s.a);
    const len = dir.length();
    if (len < 1e-4) continue;
    const g = new THREE.CylinderGeometry(s.r1, s.r0, len, radialSeg, opts.heightSeg ?? 1, true);
    if (opts.uvAlong) {
      const uv = g.attributes.uv;
      const d0 = (s.d0 ?? 0) * uvScale, d1 = (s.d1 ?? len) * uvScale;
      for (let i = 0; i < uv.count; i++) {
        const around = uv.getX(i), along = uv.getY(i);
        uv.setXY(i, d0 + (d1 - d0) * along, around);
      }
    }
    q.setFromUnitVectors(up, dir.clone().normalize());
    const m = new THREE.Matrix4()
      .compose(new THREE.Vector3().addVectors(s.a, s.b).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1));
    g.applyMatrix4(m);
    geos.push(g);
  }
  const merged = mergeGeometries(geos);
  geos.forEach(g => g.dispose());
  return new THREE.Mesh(merged, material);
}

/* Fusion minimale (position/normal/uv) — évite d'embarquer BufferGeometryUtils. */
export function mergeGeometries(geos) {
  let vCount = 0, iCount = 0;
  for (const g of geos) { vCount += g.attributes.position.count; iCount += g.index ? g.index.count : 0; }
  const pos = new Float32Array(vCount * 3);
  const nor = new Float32Array(vCount * 3);
  const uv = new Float32Array(vCount * 2);
  const idx = new Uint32Array(iCount);
  let vo = 0, io = 0;
  for (const g of geos) {
    const p = g.attributes.position, n = g.attributes.normal, t = g.attributes.uv;
    pos.set(p.array.subarray(0, p.count * 3), vo * 3);
    if (n) nor.set(n.array.subarray(0, n.count * 3), vo * 3);
    if (t) uv.set(t.array.subarray(0, t.count * 2), vo * 2);
    if (g.index) { const gi = g.index.array; for (let i = 0; i < gi.length; i++) idx[io + i] = gi[i] + vo; io += gi.length; }
    vo += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  if (iCount) out.setIndex(new THREE.BufferAttribute(idx, 1));
  out.computeBoundingSphere();
  return out;
}

/* Ruban d'hélice (ADN, fibres de collagène). */
export function helixRibbon(opts = {}) {
  const { turns = 6, height = 60, radius = 8, phase = 0, tube = 0.9, seg = 420, radial = 8 } = opts;
  const pts = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const a = t * turns * Math.PI * 2 + phase;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, (t - 0.5) * height, Math.sin(a) * radius));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.TubeGeometry(curve, seg, tube, radial, false);
}

/* Nuage de points sur une sphère (silhouette, poussières). */
export function spherePoints(count, radius, seed = 3) {
  const rnd = rng(seed);
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = radius * Math.cbrt(rnd());
    const s = Math.sqrt(1 - u * u);
    arr[i * 3] = r * s * Math.cos(a); arr[i * 3 + 1] = r * u; arr[i * 3 + 2] = r * s * Math.sin(a);
  }
  return arr;
}

/* Libère récursivement géométries et matériaux. */
export function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    const m = o.material;
    if (Array.isArray(m)) m.forEach(x => x.dispose());
    else if (m) m.dispose();
  });
}
