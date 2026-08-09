import * as THREE from 'three';
import { createRenderer, createComposer } from './core/post.js';
import { U } from './core/mat.js';
import { Rig } from './core/rig.js';
import { Sound } from './core/audio.js';
import { UI } from './core/ui.js';
import { STATIONS, t } from './content/stations.js';
import { WORLDS } from './world/index.js';
import { disposeTree, clamp, lerp } from './core/build.js';

/* ─────────────── contexte ─────────────── */
const canvas = document.getElementById('scene');
const gl2 = !!document.createElement('canvas').getContext('webgl2');
if (!gl2) {
  document.getElementById('intro').innerHTML =
    '<div class="intro-inner"><h1 class="title">INTÉRIEUR</h1><p class="subtitle">Ce voyage a besoin de WebGL&nbsp;2. Essayez un navigateur récent (Chrome, Firefox, Safari 15+) ou activez l’accélération matérielle.</p></div>';
  throw new Error('WebGL2 requis');
}

/* Réglages surchargeables par l'URL : ?q=0.5&dpr=1&age=enfant&station=3 */
const PARAMS = new URLSearchParams(location.search);
const num = (k, d) => (PARAMS.has(k) ? Number(PARAMS.get(k)) : d);
const coarse = matchMedia('(pointer: coarse)').matches;
const cores = navigator.hardwareConcurrency || 4;
const QUALITY = clamp(num('q', coarse || innerWidth < 760 ? 0.4 : (cores >= 8 ? 1 : 0.65)), 0.12, 1);
const BASE_DPR = clamp(num('dpr', Math.min(devicePixelRatio || 1, coarse ? 1.6 : 2)), 0.4, 3);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x07060a);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.6, 7000);
const renderer = createRenderer(canvas);
renderer.setPixelRatio(BASE_DPR);
const post = createComposer(renderer, scene, camera);

const rig = new Rig(camera, canvas);
const sound = new Sound();

/* ─────────────── état ─────────────── */
const state = {
  age: 'adulte', index: -1, world: null, mode: 'guide',
  playing: true, running: false, uiHidden: false, ended: false,
  time: 0, beat: 0, pulse: 0, breath: 0, scale: 1,
};
const BEAT_PERIOD = 0.86;

const ui = new UI({
  onStart: (age) => start(age),
  onStation: (i) => goto(i),
  onMode: (m) => setMode(m),
  onAge: (a) => setAge(a),
  onPlay: () => { state.playing = !state.playing; rig.paused = !state.playing; ui.setPlaying(state.playing); sound.tick(660); },
  onSound: () => { const on = !sound.on; sound.setEnabled(on); ui.setSound(on); if (on) sound.setAmbience(STATIONS[state.index]?.ambience); },
  onSpot: () => sound.tick(980, 0.05),
  onAnswer: (ok) => sound.chime(ok),
  onStick: (x, y, active) => { rig.stick.x = x; rig.stick.y = y; rig.stick.active = active; },
});

/* ─────────────── démarrage ─────────────── */
async function start(age) {
  document.getElementById('intro').hidden = true;
  document.getElementById('hud').hidden = false;
  setAge(age, true);
  sound.setEnabled(true);
  ui.setSound(true);
  await goto(clamp(num('station', 1) - 1, 0, STATIONS.length - 1), true);
  state.running = true;
  requestAnimationFrame(loop);
}

if (PARAMS.has('age') || PARAMS.has('station')) {
  const a = PARAMS.get('age') === 'enfant' ? 'enfant' : 'adulte';
  addEventListener('load', () => start(a), { once: true });
}

function setAge(age, silent) {
  state.age = age;
  ui.setAge(age);
  U.uVivid.value = age === 'enfant' ? 1.3 : 1.0;
  applyGrade();
  if (!silent) {
    sound.tick(age === 'enfant' ? 880 : 520, 0.05);
    if (state.world) ui.narrate(t(STATIONS[state.index].intro, age), 9000);
  }
}

function setMode(m) {
  if (m === state.mode) return;
  state.mode = m;
  rig.setMode(m);
  ui.setMode(m);
  sound.tick(m === 'libre' ? 740 : 520, 0.05);
  if (m === 'libre') { rig.requestLock(); ui.narrate(state.age === 'enfant'
    ? 'À toi de jouer ! Utilise <b>Z Q S D</b> pour te déplacer et la souris pour regarder.'
    : 'Vol libre : <b>Z Q S D</b> pour translater, <b>Maj/Ctrl</b> pour l’altitude, souris pour l’assiette.', 8000);
  } else {
    ui.narrate(state.age === 'enfant' ? 'Retour dans le tunnel guidé.' : 'Retour sur le rail de la visite.', 4000);
  }
}

/* ─────────────── escales ─────────────── */
let loading = false;
async function goto(i, first = false) {
  i = clamp(i, 0, STATIONS.length - 1);
  if (loading || (i === state.index && !first)) return;
  loading = true;
  state.ended = false;

  if (!first) { ui.transit(true); sound.whoosh(1.0); await wait(430); }
  else ui.loader(true, t(STATIONS[0].name, state.age));

  if (state.world) {
    scene.remove(state.world.group);
    disposeTree(state.world.group);
    state.world = null;
  }

  const st = STATIONS[i];
  await wait(16);
  const world = WORLDS[st.id](QUALITY);
  state.world = world;
  state.index = i;
  scene.add(world.group);

  U.uFogColor.value.setHex(st.fog.color);
  U.uFogDensity.value = st.fog.density;
  scene.background.setHex(st.fog.color);
  sound.setAmbience(st.ambience);

  rig.setStation(world);
  if (PARAMS.has('u')) rig.u = clamp(num('u', 0), 0, 1);
  rig.shake = world.shake ?? 0.5;
  rig.onEnd = onTourEnd;
  rig.paused = !state.playing;
  if (state.mode === 'libre') rig.setMode('libre');

  ui.setStation(i);
  ui.buildHotspots(world);
  applyGrade();

  // une image à blanc pour compiler les shaders avant l'apparition
  renderer.compile(scene, camera);
  rig.update(0.016, 0);
  post.composer.render();

  if (first) { ui.loader(false); }
  else { await wait(120); }
  ui.transit(false);
  loading = false;
}

function onTourEnd() {
  if (state.ended) return;
  state.ended = true;
  if (state.index < STATIONS.length - 1) {
    setTimeout(() => { if (state.mode === 'guide') goto(state.index + 1); }, 1600);
  } else {
    ui.openCard('finale');
    sound.chime(true);
  }
}

function applyGrade() {
  const g = state.world?.grade;
  const kid = state.age === 'enfant';
  const u = post.grade.uniforms;
  if (!g) return;
  post.bloom.strength = g.bloom * (kid ? 1.28 : 1);
  u.uVig.value = g.vig * (kid ? 0.84 : 1);
  u.uTint.value.setRGB(g.tint[0], g.tint[1], g.tint[2]);
  u.uContrast.value = kid ? 1.0 : 1.06;
  u.uGrain.value = kid ? 0.018 : 0.036;
  u.uAber.value = kid ? 0.0016 : 0.0028;
  renderer.toneMappingExposure = (g.exposure ?? 1) * (kid ? 1.1 : 1);
}

const wait = (ms) => new Promise(r => setTimeout(r, ms));

/* ─────────────── boucle ─────────────── */
const clock = new THREE.Clock();
let fpsAcc = 0, fpsN = 0;

function loop() {
  requestAnimationFrame(loop);
  if (!state.running || document.hidden) { clock.getDelta(); return; }
  const dt = Math.min(clock.getDelta(), 0.05);
  state.time += dt;

  // cycle cardiaque : deux bosses, « toum-ta »
  const prev = state.beat;
  state.beat = (state.beat + dt / BEAT_PERIOD) % 1;
  if (state.beat < prev) sound.beat(0.9);
  const p = state.beat;
  state.pulse = Math.exp(-Math.pow((p - 0.05) / 0.055, 2)) + 0.5 * Math.exp(-Math.pow((p - 0.29) / 0.05, 2));
  state.breath = Math.sin(state.time * (Math.PI * 2) / 4.4);

  U.uTime.value = state.time;
  U.uPulse.value = state.pulse;
  U.uBreath.value = state.breath;

  rig.update(dt, state.pulse);
  state.world?.update(state.time, dt, state.pulse, state.breath, camera);

  post.grade.uniforms.uTime.value = state.time;
  post.grade.uniforms.uPulse.value = state.pulse;
  ui.updateHotspots(camera, innerWidth, innerHeight);
  if (state.mode === 'guide') ui.progress(rig.u);

  post.composer.render();

  // résolution adaptative
  fpsAcc += dt; fpsN++;
  if (fpsN >= 90) {
    const fps = fpsN / fpsAcc;
    if (fps < 40 && state.scale > 0.62) setScale(state.scale - 0.14);
    else if (fps > 57 && state.scale < 1) setScale(Math.min(1, state.scale + 0.1));
    fpsAcc = 0; fpsN = 0;
  }
}

function setScale(s) {
  state.scale = s;
  const r = BASE_DPR * s;
  renderer.setPixelRatio(r);
  post.composer.setPixelRatio(r);
  post.resize(innerWidth, innerHeight);
  U.uPx.value = (innerHeight * r) / (2 * Math.tan(camera.fov * Math.PI / 360));
}

/* ─────────────── évènements ─────────────── */
function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  post.resize(innerWidth, innerHeight);
  U.uPx.value = (innerHeight * renderer.getPixelRatio()) / (2 * Math.tan(camera.fov * Math.PI / 360));
}
addEventListener('resize', resize);
resize();

rig.onTap = (e) => {
  if (ui.pickAt(e.clientX, e.clientY, 80)) return;
  if (state.mode === 'libre' && !rig.locked) rig.requestLock();
};

addEventListener('keydown', (e) => {
  if (!state.running) return;
  const k = e.code;
  if (k === 'Space') { setMode(state.mode === 'guide' ? 'libre' : 'guide'); e.preventDefault(); }
  else if (k === 'Comma' || k === 'BracketLeft' || k === 'PageUp') goto(state.index - 1);
  else if (k === 'Period' || k === 'BracketRight' || k === 'PageDown') goto(state.index + 1);
  else if (k === 'KeyH') { state.uiHidden = !state.uiHidden; document.body.classList.toggle('ui-hidden', state.uiHidden); }
  else if (k === 'KeyM') { const on = !sound.on; sound.setEnabled(on); ui.setSound(on); if (on) sound.setAmbience(STATIONS[state.index]?.ambience); }
  else if (k === 'KeyP') { state.playing = !state.playing; rig.paused = !state.playing; ui.setPlaying(state.playing); }
  else if (k === 'KeyE' || k === 'Enter') { if (!ui.pickAt(innerWidth / 2, innerHeight / 2, 220)) ui.openCard('station'); }
  else if (k === 'Escape') { ui.closeCard(); ui.toggleMenu(false); ui.toggleHelp(false); }
});

document.querySelector('.station-head').addEventListener('click', () => ui.openCard('station'));

document.addEventListener('visibilitychange', () => { if (!document.hidden) clock.getDelta(); });

/* Sonde de mise au point (?debug=1) : luminance moyenne de l'image. */
if (PARAMS.has('debug')) {
  window.__app = {
    scene, camera, renderer, post, rig, ui, state, THREE,
    probe() {
      const c = document.createElement('canvas'); c.width = 160; c.height = 100;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(renderer.domElement, 0, 0, 160, 100);
      const d = g.getImageData(0, 0, 160, 100).data;
      let s = 0, hot = 0;
      for (let i = 0; i < d.length; i += 4) {
        const l = (d[i] + d[i + 1] + d[i + 2]) / 3;
        s += l; if (l > 240) hot++;
      }
      return { mean: +(s / (d.length / 4) / 255).toFixed(3), hot: +(hot / (d.length / 4)).toFixed(3) };
    },
    parts() { return state.world.group.children.map((c, i) => `${i}:${c.type}:${c.material?.type || ''}`); },
  };
}
