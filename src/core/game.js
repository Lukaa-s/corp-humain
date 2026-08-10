import * as THREE from 'three';
import { orbs } from './mat.js';
import { rng, clamp } from './build.js';

const SAVE = 'interieur.progres.v2';

/**
 * Couche de jeu — c'est elle qui donne une raison de fouiller chaque escale.
 *
 * Trois missions par escale, une poignée d'échantillons dispersés hors de
 * l'axe évident, et une relique cachée près des limites. Les missions sont
 * décrites en données (voir content/missions.js) : « atteindre », « lire »,
 * « récolter », « répondre ». Rien ici ne connaît l'anatomie.
 */
export class Game {
  constructor(cb = {}) {
    this.cb = cb;
    this.group = new THREE.Group();
    this.group.renderOrder = 30;
    this.def = null;
    this.index = -1;
    this.samples = null;
    this.relic = null;
    this.done = new Set();          // clés de missions accomplies dans l'escale
    this._v = new THREE.Vector3();
    this.save = this._load();
  }

  /* ─────────── sauvegarde ─────────── */
  _load() {
    try {
      const raw = localStorage.getItem(SAVE);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.stations) return s;
      }
    } catch { /* stockage refusé : on joue sans mémoire */ }
    return { stations: {}, score: 0 };
  }

  _persist() {
    try { localStorage.setItem(SAVE, JSON.stringify(this.save)); } catch { /* tant pis */ }
  }

  st(i = this.index) {
    return (this.save.stations[i] ||= { missions: [], samples: 0, relic: false });
  }

  reset() {
    this.save = { stations: {}, score: 0 };
    this._persist();
  }

  get score() { return this.save.score; }

  /** Escales dont les trois missions sont accomplies. */
  badges() {
    return Object.entries(this.save.stations)
      .filter(([, s]) => (s.missions || []).length >= 3)
      .map(([i]) => Number(i));
  }

  totalSamples() {
    return Object.values(this.save.stations).reduce((n, s) => n + (s.samples || 0), 0);
  }

  totalRelics() {
    return Object.values(this.save.stations).filter(s => s.relic).length;
  }

  /* ─────────── mise en place d'une escale ─────────── */
  setStation(index, world, def) {
    this.index = index;
    this.def = def || null;
    this.done = new Set(this.st(index).missions || []);
    for (const c of this.group.children) { c.geometry?.dispose(); c.material?.dispose(); }
    this.group.clear();
    this.samples = null;
    this.relic = null;
    if (!def) return;

    const rnd = rng(9000 + index * 31);
    const saved = this.st(index);

    /* échantillons : posés le long du parcours mais franchement décalés,
       pour qu'on soit obligé de quitter l'axe et de regarder autour. */
    const n = def.samples ?? 6;
    const spread = this._spread(world);
    const pos = new Float32Array(n * 3), seed = new Float32Array(n), alive = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      const p = world.path ? world.path.getPointAt(clamp(u, 0, 1)) : new THREE.Vector3();
      const dir = new THREE.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5);
      if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0);
      p.addScaledVector(dir.normalize(), spread * (0.4 + 0.6 * rnd()));
      this._confine(p, world);
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
      seed[i] = rnd();
      alive[i] = i < (saved.samples || 0) ? 0 : 1;
    }
    this.samples = this._points(pos, seed, alive, def.orb ?? 0x6ff0d8, 26);
    this.group.add(this.samples.mesh);
    this.picked = saved.samples || 0;
    this.total = n;

    /* la relique : loin de tout, près de la limite de l'escale */
    const rp = this._relicPoint(world, rnd);
    this.relic = this._points(
      new Float32Array([rp.x, rp.y, rp.z]), new Float32Array([0.5]),
      new Float32Array([saved.relic ? 0 : 1]), def.relicColor ?? 0xffc86a, 44);
    this.relicPos = rp;
    this.group.add(this.relic.mesh);
  }

  _spread(world) {
    const b = world.bounds;
    if (!b) return 60;
    return b.type === 'tube' ? (b.radius ?? 40) * 0.6 : (b.radius ?? 200) * 0.42;
  }

  _confine(p, world) {
    const b = world.bounds;
    if (!b) return p;
    if (b.type === 'tube') {
      p.z = clamp(p.z, b.z0 + 20, b.z1 - 20);
      const c = b.channel.center(p.z);
      const dx = p.x - c.x, dy = p.y - c.y;
      const r = Math.hypot(dx, dy), max = (b.radius ?? 40) * 0.78;
      if (r > max) { p.x = c.x + dx / r * max; p.y = c.y + dy / r * max; }
    } else {
      const c = b.center ?? new THREE.Vector3();
      const d = this._v.subVectors(p, c);
      const r = d.length(), max = (b.radius ?? 200) * 0.82;
      if (r > max) p.copy(c).addScaledVector(d.multiplyScalar(1 / r), max);
      if (b.floor !== undefined) p.y = Math.max(p.y, b.floor + 10);
      if (b.ceiling !== undefined) p.y = Math.min(p.y, b.ceiling - 10);
    }
    return p;
  }

  _relicPoint(world, rnd) {
    const b = world.bounds;
    const a = rnd() * Math.PI * 2;
    if (b && b.type === 'tube') {
      const z = b.z0 + (b.z1 - b.z0) * (0.12 + 0.76 * rnd());
      const c = b.channel.center(z);
      const r = (b.radius ?? 40) * 0.74;
      return new THREE.Vector3(c.x + Math.cos(a) * r, c.y + Math.sin(a) * r, z);
    }
    const c = (b && b.center) ? b.center.clone() : new THREE.Vector3();
    const r = ((b && b.radius) ?? 200) * 0.76;
    const e = (rnd() - 0.5) * 1.4;
    return c.add(new THREE.Vector3(Math.cos(a) * r, e * r * 0.5, Math.sin(a) * r));
  }

  _points(pos, seed, alive, color, size) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    const av = new THREE.BufferAttribute(alive, 1);
    av.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aAlive', av);
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
    const mesh = new THREE.Points(g, orbs({ color, size }));
    mesh.frustumCulled = false;
    mesh.renderOrder = 30;
    return { mesh, alive: av, pos };
  }

  /* ─────────── boucle ─────────── */
  update(dt, cam) {
    if (!this.def) return;
    const p = cam.position;
    this._cam = p;

    if (this.samples) {
      const { alive, pos } = this.samples;
      const r2 = (this.def.pickRadius ?? 46) ** 2;
      for (let i = 0; i < alive.count; i++) {
        if (alive.array[i] < 0.5) continue;
        const dx = pos[i * 3] - p.x, dy = pos[i * 3 + 1] - p.y, dz = pos[i * 3 + 2] - p.z;
        if (dx * dx + dy * dy + dz * dz < r2) {
          alive.array[i] = 0; alive.needsUpdate = true;
          this.picked++;
          const s = this.st(); s.samples = this.picked;
          this._award(20);
          this.cb.onPick?.(this.picked, this.total);
          this._checkMissions(cam);
        }
      }
    }

    if (this.relic && this.relic.alive.array[0] > 0.5) {
      const d2 = p.distanceToSquared(this.relicPos);
      if (d2 < (this.def.pickRadius ?? 46) ** 2 * 1.6) {
        this.relic.alive.array[0] = 0; this.relic.alive.needsUpdate = true;
        this.st().relic = true;
        this._award(250);
        this.cb.onRelic?.();
      }
    }

    this._checkMissions(cam);
  }

  /* ─────────── missions ─────────── */

  /**
   * Rayon de validation d'un objectif « atteindre ». On le dérive de la taille
   * de l'objet quand l'escale la déclare : arriver au sommet d'un poil doit
   * compter dès qu'on est visiblement dessus, pas au centimètre près.
   */
  reachRadius(m) {
    const info = this.spotInfo?.[m.spot];
    return Math.max(m.r ?? 0, info ? info.r * 2.4 : 0, 40);
  }

  _checkMissions(cam) {
    const list = this.def?.missions || [];
    for (const m of list) {
      if (this.done.has(m.id)) continue;
      let ok = false;
      if (m.type === 'reach') {
        const target = this.spotPos?.[m.spot];
        if (target) ok = cam.position.distanceTo(target) < this.reachRadius(m);
      } else if (m.type === 'collect') {
        ok = this.picked >= (m.n ?? this.total);
      }
      if (ok) this.complete(m.id);
    }
  }

  /** Signalé de l'extérieur : fiche ouverte, quiz répondu. */
  notify(kind, key) {
    for (const m of (this.def?.missions || [])) {
      if (this.done.has(m.id)) continue;
      if (kind === 'read' && m.type === 'read' && m.spot === key) this.complete(m.id);
      if (kind === 'quiz' && m.type === 'quiz') this.complete(m.id);
    }
  }

  complete(id) {
    if (this.done.has(id)) return;
    const m = (this.def?.missions || []).find(x => x.id === id);
    if (!m) return;
    this.done.add(id);
    const s = this.st();
    s.missions = [...this.done];
    this._award(m.type === 'quiz' ? 150 : 100);
    const all = this.done.size >= (this.def.missions || []).length;
    this.cb.onMission?.(m, all);
  }

  _award(n) {
    this.save.score += n;
    this._persist();
    this.cb.onScore?.(this.save.score);
  }

  /**
   * Objectif en cours : où il est, d'où on le regarde bien, et à partir de
   * quelle distance il compte comme atteint. Sert au bouton « m'y emmener »,
   * à la boussole et à la jauge d'approche du carnet.
   */
  guideTarget() {
    for (const m of (this.def?.missions || [])) {
      if (this.done.has(m.id)) continue;
      if ((m.type === 'reach' || m.type === 'read') && this.spotPos?.[m.spot]) {
        const info = this.spotInfo?.[m.spot];
        return {
          point: this.spotPos[m.spot], view: info?.view || null, mission: m,
          radius: m.type === 'reach' ? this.reachRadius(m) : 0,
        };
      }
      if (m.type === 'collect' && this.samples) {
        // le plus proche encore en place : la boussole doit pointer celui-là
        const { alive, pos } = this.samples;
        let best = null, bd = Infinity;
        for (let i = 0; i < alive.count; i++) {
          if (alive.array[i] < 0.5) continue;
          const p = this._v.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
          const d = p.distanceToSquared(this._cam || p);
          if (d < bd) { bd = d; best = p.clone(); }
        }
        if (best) return { point: best, view: null, mission: m, radius: this.def.pickRadius ?? 46 };
      }
    }
    return null;
  }
}
