/**
 * Ambiance entièrement synthétisée (aucun fichier son) :
 * bourdon d'organe, souffle liquide, battements, transitions.
 */
export class Sound {
  constructor() {
    this.ctx = null; this.on = false; this.ready = false;
    this.nodes = {};
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // bourdon : deux oscillateurs désaccordés + sous-basse
    const droneGain = ctx.createGain(); droneGain.gain.value = 0.16;
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass'; droneFilter.frequency.value = 320; droneFilter.Q.value = 1.2;
    const o1 = ctx.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 54;
    const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 81.5;
    const o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = 27;
    const g1 = ctx.createGain(); g1.gain.value = 0.20;
    const g2 = ctx.createGain(); g2.gain.value = 0.14;
    const g3 = ctx.createGain(); g3.gain.value = 0.30;
    o1.connect(g1).connect(droneFilter);
    o2.connect(g2).connect(droneFilter);
    o3.connect(g3).connect(droneFilter);
    droneFilter.connect(droneGain).connect(master);
    o1.start(); o2.start(); o3.start();

    // souffle : bruit brun filtré, module lentement
    const noise = this._noiseSource(ctx, 'brown');
    const nf = ctx.createBiquadFilter();
    nf.type = 'lowpass'; nf.frequency.value = 480; nf.Q.value = 0.8;
    const ng = ctx.createGain(); ng.gain.value = 0.20;
    noise.connect(nf).connect(ng).connect(master);
    noise.start();

    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.09;
    const lfoG = ctx.createGain(); lfoG.gain.value = 200;
    lfo.connect(lfoG).connect(nf.frequency); lfo.start();

    this.nodes = { master, droneGain, droneFilter, o1, o2, o3, ng, nf };
    this.ready = true;
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
    this.nodes.master.gain.setTargetAtTime(v ? 0.5 : 0, t, 0.4);
  }

  /* Timbre propre à chaque escale. */
  setAmbience(a = {}) {
    if (!this.ready) return;
    const t = this.ctx.currentTime, k = 1.4;
    const n = this.nodes;
    n.o1.frequency.setTargetAtTime(a.base ?? 54, t, k);
    n.o2.frequency.setTargetAtTime((a.base ?? 54) * (a.fifth ?? 1.5), t, k);
    n.o3.frequency.setTargetAtTime((a.base ?? 54) * 0.5, t, k);
    n.droneFilter.frequency.setTargetAtTime(a.cutoff ?? 320, t, k);
    n.droneGain.gain.setTargetAtTime(a.drone ?? 0.16, t, k);
    n.nf.frequency.setTargetAtTime(a.hiss ?? 480, t, k);
    n.ng.gain.setTargetAtTime(a.noise ?? 0.2, t, k);
  }

  beat(strength = 1) {
    if (!this.on || !this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const thump = (at, f0, f1, dur, gain) => {
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(f0, at);
      o.frequency.exponentialRampToValueAtTime(f1, at + dur);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(gain * strength, at + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g).connect(this.nodes.master);
      o.start(at); o.stop(at + dur + 0.05);

      const n = this._noiseSource(ctx, 'white');
      const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 260;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0, at);
      ng.gain.linearRampToValueAtTime(0.16 * gain * strength, at + 0.008);
      ng.gain.exponentialRampToValueAtTime(0.0001, at + dur * 0.7);
      n.connect(nf).connect(ng).connect(this.nodes.master);
      n.start(at); n.stop(at + dur);
    };
    thump(t, 92, 34, 0.30, 0.62);
    thump(t + 0.235, 74, 30, 0.24, 0.36);
  }

  whoosh(dur = 1.1) {
    if (!this.on || !this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const n = this._noiseSource(ctx, 'white');
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(160, t);
    bp.frequency.exponentialRampToValueAtTime(2600, t + dur * 0.45);
    bp.frequency.exponentialRampToValueAtTime(120, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.5, t + dur * 0.28);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(bp).connect(g).connect(this.nodes.master);
    n.start(t); n.stop(t + dur + 0.1);
  }

  tick(freq = 880, gain = 0.06) {
    if (!this.on || !this.ready) return;
    const ctx = this.ctx, t = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    o.connect(g).connect(this.nodes.master);
    o.start(t); o.stop(t + 0.2);
  }

  chime(good = true) {
    if (!this.on || !this.ready) return;
    const notes = good ? [523.25, 659.25, 783.99, 1046.5] : [392, 329.63];
    notes.forEach((f, i) => setTimeout(() => this.tick(f, 0.075), i * 92));
  }
}
