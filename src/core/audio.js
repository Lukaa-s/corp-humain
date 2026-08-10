/**
 * Ambiance entièrement synthétisée — aucun fichier son.
 *
 * Chaque escale a sa voix : une nappe (deux oscillateurs et une sous-basse),
 * un lit de bruit filtré, et surtout un ordonnanceur qui déclenche des
 * évènements propres au lieu — bulles dans l'estomac, gouttes dans le rein,
 * crépitements dans le cerveau, craquements dans l'os. C'est ce dernier point
 * qui distingue vraiment un organe d'un autre : une nappe transposée, à
 * l'oreille, reste la même nappe.
 */

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

/* Profil sonore de chaque escale. `beat` = présence du cœur. */
const VOICES = {
  peau: {
    drone: { base: 66, typeA: 'sine', typeB: 'triangle', fifth: 1.5, gain: 0.07, cutoff: 420 },
    noise: { kind: 'white', type: 'bandpass', freq: 900, q: 0.5, gain: 0.10, lfo: { rate: 0.06, depth: 600 } },
    beat: 0.05,
    events: [{ k: 'gust', every: [2.5, 6], gain: 0.9 }],
  },
  sang: {
    drone: { base: 48, typeA: 'sawtooth', typeB: 'sine', fifth: 1.5, gain: 0.16, cutoff: 260 },
    noise: { kind: 'brown', type: 'lowpass', freq: 620, q: 0.9, gain: 0.30, lfo: { rate: 0.5, depth: 260 } },
    beat: 0.85, valve: 0.25,
    // le battement enfle quand on remonte vers le cœur (z faible)
    beatFrom: (cam) => 0.30 + 0.85 * (1 - clamp01((cam.position.z + 140) / 1840)),
    events: [{ k: 'surge', every: [1.4, 2.6], gain: 0.5 }],
  },
  coeur: {
    drone: { base: 40, typeA: 'sawtooth', typeB: 'sine', fifth: 1.5, gain: 0.20, cutoff: 200 },
    noise: { kind: 'brown', type: 'lowpass', freq: 400, q: 1.0, gain: 0.26, lfo: { rate: 0.35, depth: 200 } },
    beat: 1.6, valve: 1.0, chamber: true,
    events: [{ k: 'surge', every: [0.9, 1.6], gain: 0.8 }],
  },
  poumons: {
    drone: { base: 74, typeA: 'sine', typeB: 'sine', fifth: 1.335, gain: 0.07, cutoff: 700 },
    noise: { kind: 'white', type: 'lowpass', freq: 900, q: 0.5, gain: 0.06, lfo: { rate: 0.05, depth: 300 } },
    beat: 0.18, breath: 0.42,
    events: [],
  },
  estomac: {
    drone: { base: 52, typeA: 'triangle', typeB: 'sine', fifth: 1.19, gain: 0.13, cutoff: 240 },
    noise: { kind: 'brown', type: 'lowpass', freq: 340, q: 1.4, gain: 0.20, lfo: { rate: 0.13, depth: 180 } },
    beat: 0.12,
    events: [
      { k: 'bubble', every: [0.5, 2.2], gain: 1.0 },
      { k: 'squelch', every: [3, 7], gain: 0.7 },
    ],
  },
  intestin: {
    drone: { base: 44, typeA: 'sine', typeB: 'triangle', fifth: 1.5, gain: 0.12, cutoff: 220 },
    noise: { kind: 'brown', type: 'lowpass', freq: 300, q: 1.1, gain: 0.22, lfo: { rate: 0.09, depth: 150 } },
    beat: 0.12,
    events: [
      { k: 'squelch', every: [1.2, 3.4], gain: 1.0 },
      { k: 'bubble', every: [2.5, 6], gain: 0.5 },
    ],
  },
  foie: {
    drone: { base: 46, typeA: 'sawtooth', typeB: 'sine', fifth: 1.26, gain: 0.15, cutoff: 230 },
    noise: { kind: 'brown', type: 'lowpass', freq: 380, q: 0.8, gain: 0.20, lfo: { rate: 0.07, depth: 120 } },
    beat: 0.22,
    events: [{ k: 'drip', every: [2, 5], gain: 0.5 }, { k: 'squelch', every: [4, 9], gain: 0.4 }],
  },
  rein: {
    drone: { base: 58, typeA: 'sine', typeB: 'sine', fifth: 1.5, gain: 0.09, cutoff: 520 },
    noise: { kind: 'white', type: 'bandpass', freq: 2200, q: 1.6, gain: 0.07, lfo: { rate: 0.11, depth: 900 } },
    beat: 0.20,
    events: [{ k: 'drip', every: [0.7, 2.4], gain: 1.0 }],
  },
  charpente: {
    drone: { base: 36, typeA: 'sawtooth', typeB: 'sine', fifth: 1.5, gain: 0.16, cutoff: 170 },
    noise: { kind: 'brown', type: 'lowpass', freq: 200, q: 0.7, gain: 0.12, lfo: { rate: 0.04, depth: 80 } },
    beat: 0.10,
    events: [{ k: 'creak', every: [2.5, 7], gain: 1.0 }],
  },
  cerveau: {
    drone: { base: 55, typeA: 'sine', typeB: 'sine', fifth: 1.498, gain: 0.10, cutoff: 900 },
    noise: { kind: 'white', type: 'highpass', freq: 2600, q: 0.7, gain: 0.035, lfo: { rate: 0.19, depth: 800 } },
    beat: 0.08,
    events: [
      { k: 'crackle', every: [0.18, 0.7], gain: 1.0 },
      { k: 'ping', every: [2.5, 6], gain: 0.5 },
    ],
  },
  cellule: {
    drone: { base: 69, typeA: 'sine', typeB: 'triangle', fifth: 1.5, gain: 0.08, cutoff: 1100 },
    noise: { kind: 'white', type: 'bandpass', freq: 3400, q: 2.2, gain: 0.04, lfo: { rate: 0.23, depth: 1200 } },
    beat: 0.05,
    events: [{ k: 'ping', every: [0.9, 3], gain: 0.8 }, { k: 'crackle', every: [1.5, 4], gain: 0.35 }],
  },
};

export class Sound {
  constructor() {
    this.ctx = null; this.on = false; this.ready = false;
    this.nodes = {};
    this.voice = VOICES.sang;
    this.station = null;
    this._timers = [];
    this._beatGain = 1;
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 22; comp.ratio.value = 5;
    comp.attack.value = 0.004; comp.release.value = 0.22;
    master.connect(comp).connect(ctx.destination);

    // nappe : deux oscillateurs désaccordés + sous-basse
    const droneGain = ctx.createGain(); droneGain.gain.value = 0.14;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass'; droneFilter.frequency.value = 320; droneFilter.Q.value = 1.2;
    const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 48;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 72;
    const o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = 24;
    const g1 = ctx.createGain(); g1.gain.value = 0.20;
    const g2 = ctx.createGain(); g2.gain.value = 0.14;
    const g3 = ctx.createGain(); g3.gain.value = 0.30;
    o1.connect(g1).connect(droneFilter);
    o2.connect(g2).connect(droneFilter);
    o3.connect(g3).connect(droneFilter);
    droneFilter.connect(droneGain).connect(master);
    o1.start(); o2.start(); o3.start();

    // lit de bruit : la couleur change complètement d'un organe à l'autre
    const noise = this._noiseSource(ctx, 'brown');
    const nf = ctx.createBiquadFilter();
    nf.type = 'lowpass'; nf.frequency.value = 480; nf.Q.value = 0.8;
    const ng = ctx.createGain(); ng.gain.value = 0.20;
    noise.connect(nf).connect(ng).connect(master);
    noise.start();

    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.09;
    const lfoG = ctx.createGain(); lfoG.gain.value = 200;
    lfo.connect(lfoG).connect(nf.frequency); lfo.start();

    // souffle respiratoire, piloté image par image dans les poumons
    const air = this._noiseSource(ctx, 'white');
    const af = ctx.createBiquadFilter(); af.type = 'bandpass'; af.frequency.value = 620; af.Q.value = 0.7;
    const ag = ctx.createGain(); ag.gain.value = 0;
    air.connect(af).connect(ag).connect(master);
    air.start();

    this.nodes = { master, droneGain, droneFilter, o1, o2, o3, ng, nf, lfo, lfoG, ag, af };
    this.ready = true;
    this._schedule();
  }

  _noiseSource(ctx, kind = 'white') {
    const len = ctx.sampleRate * 3;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
      else d[i] = w;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    return src;
  }

  setEnabled(v) {
    this.on = v;
    if (v) { this.init(); this.ctx?.resume(); }
    if (!this.ready) return;
    const t = this.ctx.currentTime;
    this.nodes.master.gain.cancelScheduledValues(t);
    this.nodes.master.gain.setTargetAtTime(v ? 0.55 : 0, t, 0.4);
  }

  /* ─────────── voix de l'escale ─────────── */
  setStation(id) {
    this.station = id;
    this.voice = VOICES[id] || VOICES.sang;
    if (!this.ready) return;
    const t = this.ctx.currentTime, k = 1.2, n = this.nodes, v = this.voice;
    const d = v.drone;
    n.o1.type = d.typeA; n.o2.type = d.typeB;
    n.o1.frequency.setTargetAtTime(d.base, t, k);
    n.o2.frequency.setTargetAtTime(d.base * d.fifth, t, k);
    n.o3.frequency.setTargetAtTime(d.base * 0.5, t, k);
    n.droneFilter.frequency.setTargetAtTime(d.cutoff, t, k);
    n.droneGain.gain.setTargetAtTime(d.gain, t, k);

    const b = v.noise;
    // le type de filtre ne s'interpole pas : on le pose, la fréquence glisse
    n.nf.type = b.type;
    n.nf.Q.setTargetAtTime(b.q, t, k);
    n.nf.frequency.setTargetAtTime(b.freq, t, k);
    n.ng.gain.setTargetAtTime(b.gain, t, k);
    n.lfo.frequency.setTargetAtTime(b.lfo.rate, t, k);
    n.lfoG.gain.setTargetAtTime(b.lfo.depth, t, k);
    this._schedule();
  }

  /** Relance l'ordonnanceur d'évènements propres à l'escale. */
  _schedule() {
    for (const id of this._timers) clearTimeout(id);
    this._timers = [];
    if (!this.ready) return;
    for (const ev of (this.voice.events || [])) {
      const loop = () => {
        const [lo, hi] = ev.every;
        const wait = (lo + Math.random() * (hi - lo)) * 1000;
        const id = setTimeout(() => {
          if (this.on) this._fire(ev.k, ev.gain ?? 1);
          loop();
        }, wait);
        this._timers.push(id);
      };
      loop();
    }
  }

  _fire(kind, gain) {
    const f = this[`_${kind}`];
    if (f) f.call(this, gain);
  }

  /* ─────────── évènements ─────────── */
  _env(node, at, peak, attack, dur) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(peak, at + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    node.connect(g).connect(this.nodes.master);
    return g;
  }

  /** Bulle : une sinusoïde qui monte très vite, comme un gargouillis. */
  _bubble(gain = 1) {
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sine';
    const f0 = 110 + Math.random() * 260;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * (2.2 + Math.random()), t + 0.09);
    this._env(o, t, 0.16 * gain, 0.005, 0.13);
    o.start(t); o.stop(t + 0.2);
  }

  /** Goutte : un ping résonnant, très court. */
  _drip(gain = 1) {
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sine';
    const f0 = 700 + Math.random() * 900;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * 0.55, t + 0.07);
    this._env(o, t, 0.10 * gain, 0.003, 0.10);
    o.start(t); o.stop(t + 0.16);
  }

  /** Crépitement : une décharge, très brève et très haute. */
  _crackle(gain = 1) {
    const ctx = this.ctx, t = ctx.currentTime;
    const n = this._noiseSource(ctx, 'white');
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 2600 + Math.random() * 4200; bp.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.09 * gain, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    n.connect(bp).connect(g).connect(this.nodes.master);
    n.start(t); n.stop(t + 0.08);
  }

  /** Craquement : une charpente qui travaille. */
  _creak(gain = 1) {
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    const f0 = 58 + Math.random() * 40;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.linearRampToValueAtTime(f0 * (0.72 + Math.random() * 0.2), t + 0.55);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 3;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.11 * gain, t + 0.10);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
    o.connect(lp).connect(g).connect(this.nodes.master);
    o.start(t); o.stop(t + 0.7);
  }

  /** Clapotis : le passage d'une matière visqueuse. */
  _squelch(gain = 1) {
    const ctx = this.ctx, t = ctx.currentTime;
    const n = this._noiseSource(ctx, 'brown');
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 2.4;
    const f0 = 300 + Math.random() * 400;
    bp.frequency.setValueAtTime(f0, t);
    bp.frequency.exponentialRampToValueAtTime(90 + Math.random() * 80, t + 0.42);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.20 * gain, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
    n.connect(bp).connect(g).connect(this.nodes.master);
    n.start(t); n.stop(t + 0.55);
  }

  /** Poussée : le sang qui repart d'un coup. */
  _surge(gain = 1) {
    const ctx = this.ctx, t = ctx.currentTime;
    const n = this._noiseSource(ctx, 'brown');
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.2;
    lp.frequency.setValueAtTime(180, t);
    lp.frequency.exponentialRampToValueAtTime(900, t + 0.18);
    lp.frequency.exponentialRampToValueAtTime(160, t + 0.55);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.13 * gain, t + 0.09);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    n.connect(lp).connect(g).connect(this.nodes.master);
    n.start(t); n.stop(t + 0.68);
  }

  /** Note cristalline. */
  _ping(gain = 1) {
    const ctx = this.ctx, t = ctx.currentTime;
    const f = [523.25, 659.25, 783.99, 987.77, 1174.7][Math.floor(Math.random() * 5)];
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
    this._env(o, t, 0.045 * gain, 0.006, 0.9);
    o.start(t); o.stop(t + 1.0);
  }

  /** Rafale d'air. */
  _gust(gain = 1) {
    const ctx = this.ctx, t = ctx.currentTime;
    const n = this._noiseSource(ctx, 'white');
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.8;
    bp.frequency.setValueAtTime(500, t);
    bp.frequency.exponentialRampToValueAtTime(1800, t + 0.9);
    bp.frequency.exponentialRampToValueAtTime(400, t + 2.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.07 * gain, t + 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.3);
    n.connect(bp).connect(g).connect(this.nodes.master);
    n.start(t); n.stop(t + 2.4);
  }

  /* ─────────── battement ─────────── */
  beat() {
    if (!this.on || !this.ready) return;
    const v = this.voice;
    const strength = (v.beat ?? 0.2) * this._beatGain;
    if (strength < 0.02) return;
    const ctx = this.ctx, t = ctx.currentTime;

    const thump = (at, f0, f1, dur, gain) => {
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(f0, at);
      o.frequency.exponentialRampToValueAtTime(f1, at + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(gain * strength, at + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g).connect(this.nodes.master);
      o.start(at); o.stop(at + dur + 0.05);

      const n = this._noiseSource(ctx, 'white');
      const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 220;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, at);
      ng.gain.linearRampToValueAtTime(0.2 * gain * strength, at + 0.008);
      ng.gain.exponentialRampToValueAtTime(0.0001, at + dur * 0.7);
      n.connect(nf).connect(ng).connect(this.nodes.master);
      n.start(at); n.stop(at + dur);
    };

    // « toum » puis « ta » : le premier est la fermeture des grandes valves,
    // le second celle des valves de sortie.
    thump(t, 84, 30, 0.34, 0.62);
    thump(t + 0.235, 70, 28, 0.26, 0.36);

    // le claquement sec du battant, ce qui manquait pour reconnaître un cœur
    const valve = (v.valve ?? 0) * this._beatGain;
    if (valve > 0.02) {
      const click = (at, freq, g0, dur) => {
        const n = this._noiseSource(ctx, 'white');
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 3.2;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(g0 * valve, at + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        n.connect(bp).connect(g).connect(this.nodes.master);
        n.start(at); n.stop(at + dur + 0.02);
      };
      click(t + 0.004, 950, 0.13, 0.09);
      click(t + 0.239, 1350, 0.09, 0.07);
    }
  }

  /** Modulations continues : distance au cœur, respiration. */
  frame(dt, time, cam, breath) {
    if (!this.ready || !this.on) return;
    const v = this.voice;
    this._beatGain = v.beatFrom ? v.beatFrom(cam) : 1;
    if (v.breath) {
      // souffle synchronisé : inspiration aiguë, expiration plus grave
      const t = this.ctx.currentTime;
      const amp = Math.abs(breath);
      this.nodes.ag.gain.setTargetAtTime(v.breath * amp * 0.16, t, 0.08);
      this.nodes.af.frequency.setTargetAtTime(breath > 0 ? 900 : 380, t, 0.25);
    } else if (this.nodes.ag.gain.value > 0.0005) {
      this.nodes.ag.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    }
  }

  /* ─────────── retours du jeu ─────────── */
  whoosh(dur = 1.1) {
    if (!this.on || !this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const n = this._noiseSource(ctx, 'white');
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(160, t);
    bp.frequency.exponentialRampToValueAtTime(2600, t + dur * 0.45);
    bp.frequency.exponentialRampToValueAtTime(120, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.4, t + dur * 0.28);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(bp).connect(g).connect(this.nodes.master);
    n.start(t); n.stop(t + dur + 0.1);
  }

  tick(freq = 880, gain = 0.06) {
    if (!this.on || !this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
    this._env(o, t, gain, 0.005, 0.16);
    o.start(t); o.stop(t + 0.2);
  }

  /** Ramassage : la note monte à mesure que la récolte avance. */
  pick(n, total) {
    if (!this.on || !this.ready) return;
    const scale = [523.25, 587.33, 659.25, 783.99, 880, 987.77, 1046.5, 1174.7];
    const i = Math.min(scale.length - 1, Math.round((n - 1) / Math.max(1, total - 1) * (scale.length - 1)));
    this.tick(scale[i], 0.09);
    setTimeout(() => this.tick(scale[i] * 2, 0.035), 70);
  }

  chime(good = true) {
    const notes = good ? [523.25, 659.25, 783.99, 1046.5] : [392, 329.63];
    notes.forEach((f, i) => setTimeout(() => this.tick(f, 0.075), i * 92));
  }

  fanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => setTimeout(() => this.tick(f, 0.085), i * 105));
  }
}
