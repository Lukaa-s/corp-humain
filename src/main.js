import * as THREE from 'three';
import { createRenderer, createComposer } from './core/post.js';
import { U } from './core/mat.js';
import { Rig } from './core/rig.js';
import { Sound } from './core/audio.js';
import { UI } from './core/ui.js';
import { Game } from './core/game.js';
import { STATIONS, t } from './content/stations.js';
import { MISSIONS } from './content/missions.js';
import { WORLDS } from './world/index.js';
import { disposeTree, clamp } from './core/build.js';

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
  age: 'adulte', index: -1, world: null,
  running: false, uiHidden: false,
  time: 0, beat: 0, pulse: 0, breath: 0, scale: 1,
};
const BEAT_PERIOD = 0.86;

const game = new Game({
  onScore: (n) => ui.setScore(n),
  onPick: (n, total) => {
    sound.pick(n, total);
    ui.updateQuests(game.done, n);
  },
  onMission: (m, all) => {
    ui.updateQuests(game.done, game.picked);
    ui.toast(`<b>Mission accomplie</b><span>${t(m.label, state.age)}</span>`, 'mission');
    sound.chime(true);
    if (all) {
      ui.setBadges(game.badges());
      setTimeout(() => {
        ui.toast(`<b>Escale bouclée</b><span>${t(STATIONS[state.index].name, state.age)} — les trois missions sont faites.</span>`, 'badge');
        sound.fanfare();
      }, 1400);
    }
  },
  onRelic: () => {
    sound.fanfare();
    ui.toast('<b>Relique trouvée</b><span>Une chose que personne ne voit en passant.</span>', 'relic');
    setTimeout(() => ui.openCard('relique'), 900);
  },
});

const ui = new UI({
  onStart: (age) => start(age),
  onStation: (i) => goto(i),
  onAge: (a) => setAge(a),
  onSound: () => { const on = !sound.on; sound.setEnabled(on); ui.setSound(on); if (on) sound.setStation(STATIONS[state.index]?.id); },
  onSpot: () => sound.tick(980, 0.05),
  onAnswer: (ok) => sound.chime(ok),
  onQuiz: () => game.notify('quiz'),
  onSpotRead: (key) => game.notify('read', key),
  onGuide: () => guideToMission(),
  onTravel: (point, done) => travelTo(point, done),
  onRead: (on) => { rig.frozen = on; if (on) rig.releaseLock(); },
  onStick: (x, y, active) => { rig.stick.x = x; rig.stick.y = y; rig.stick.active = active; },
});
scene.add(game.group);

/** Emmène la sonde devant un point, puis exécute la suite. */
function travelTo(point, done, stopAt) {
  const d = camera.position.distanceTo(point);
  const dist = Math.max(stopAt ?? (state.world?.spotFar ?? 600) * 0.22, 12);
  if (d < dist * 1.15) { done?.(); return; }
  rig.travelTo(point, { dist, ms: clamp(d / (state.world?.freeSpeed ?? 60) * 260, 700, 2600), onArrive: done });
  sound.whoosh(0.6);
}

function guideToMission() {
  const g = game.guideTarget();
  if (!g) { ui.narrate(state.age === 'enfant'
    ? 'Tout est fait ici ! Va voir l’escale suivante.'
    : 'Les trois missions de cette escale sont accomplies.', 4000); return; }
  // on s'arrête franchement à l'intérieur du rayon de la mission, sinon on
  // arrive « presque » et l'objectif ne se valide jamais
  const m = g.mission;
  const stop = m.type === 'reach' ? (m.r ?? 150) * 0.5
    : m.type === 'collect' ? (MISSIONS[STATIONS[state.index].id]?.pickRadius ?? 46) * 0.6
      : undefined;
  travelTo(g.point, () => {
    if (m.type === 'read') ui.openCard(m.spot);
  }, stop);
}

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
  applyLight(state.world?.light);
  applyGrade();
  if (!silent) {
    sound.tick(age === 'enfant' ? 880 : 520, 0.05);
    if (state.world) ui.narrate(t(STATIONS[state.index].intro, age), 9000);
  }
}

/* ─────────────── escales ─────────────── */
let loading = false;
async function goto(i, first = false) {
  i = clamp(i, 0, STATIONS.length - 1);
  if (loading || (i === state.index && !first)) return;
  loading = true;
  ui.closeCard();

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
  sound.setStation(st.id);

  rig.setStation(world);
  rig.shake = world.shake ?? 0.5;

  const def = MISSIONS[st.id];
  game.setStation(i, world, def);
  game.spotPos = world.spots || {};

  ui.setStation(i);
  ui.buildHotspots(world);
  ui.setQuests(def, game.done, game.picked, game.total);
  ui.setScore(game.score);
  ui.setBadges(game.badges());
  applyLight(world.light);
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

/**
 * Pose le banc de lumières de l'escale. C'est ici que se joue la différence
 * d'ambiance d'un organe à l'autre : direction, couleur et dosage des trois
 * sources. Les valeurs par défaut correspondent à une cavité neutre.
 */
const LIGHT_DEFAULT = {
  key:  { dir: [0.4, 1, 0.3], color: 0xffe6cf, int: 0.45 },
  fill: { dir: [-0.5, -0.3, -0.7], color: 0x3a5cff, int: 0.16 },
  sky:  { top: 0x5a6cff, bot: 0x2a0a10, int: 0.14 },
};

function applyLight(cfg) {
  const kid = state.age === 'enfant';
  const l = cfg || LIGHT_DEFAULT;
  const key = l.key || LIGHT_DEFAULT.key;
  const fill = l.fill || LIGHT_DEFAULT.fill;
  const sky = l.sky || LIGHT_DEFAULT.sky;
  U.uKeyDir.value.set(...key.dir).normalize();
  U.uKeyCol.value.setHex(key.color);
  U.uKeyInt.value = key.int * (kid ? 1.18 : 1);
  U.uFillDir.value.set(...fill.dir).normalize();
  U.uFillCol.value.setHex(fill.color);
  U.uFillInt.value = fill.int * (kid ? 1.25 : 1);
  U.uSkyCol.value.setHex(sky.top);
  U.uGndCol.value.setHex(sky.bot);
  U.uSkyInt.value = sky.int * (kid ? 1.3 : 1);
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
  if (state.beat < prev) { sound.beat(); ui.beat(); }
  const p = state.beat;
  state.pulse = Math.exp(-Math.pow((p - 0.05) / 0.055, 2)) + 0.5 * Math.exp(-Math.pow((p - 0.29) / 0.05, 2));
  state.breath = Math.sin(state.time * (Math.PI * 2) / 4.4);

  U.uTime.value = state.time;
  U.uPulse.value = state.pulse;
  U.uBeat.value = state.beat;
  U.uBreath.value = state.breath;

  rig.update(dt, state.pulse);
  state.world?.update(state.time, dt, state.pulse, state.breath, camera);
  game.update(dt, camera);
  sound.frame(dt, state.time, camera, state.breath);

  post.grade.uniforms.uTime.value = state.time;
  post.grade.uniforms.uPulse.value = state.pulse;
  ui.updateHotspots(camera, innerWidth, innerHeight);

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
  if (!rig.locked && !rig.frozen && !matchMedia('(pointer: coarse)').matches) rig.requestLock();
};

addEventListener('keydown', (e) => {
  if (!state.running) return;
  const k = e.code;
  if (k === 'Comma' || k === 'BracketLeft' || k === 'PageUp') goto(state.index - 1);
  else if (k === 'Period' || k === 'BracketRight' || k === 'PageDown') goto(state.index + 1);
  else if (k === 'KeyG') guideToMission();
  else if (k === 'KeyH') { state.uiHidden = !state.uiHidden; document.body.classList.toggle('ui-hidden', state.uiHidden); }
  else if (k === 'KeyM') { const on = !sound.on; sound.setEnabled(on); ui.setSound(on); if (on) sound.setStation(STATIONS[state.index]?.id); }
  else if (k === 'KeyE' || k === 'Enter') { if (!ui.pickAt(innerWidth / 2, innerHeight / 2, 220)) ui.openCard('station'); }
  else if (k === 'Escape') { ui.closeCard(); ui.toggleMenu(false); ui.toggleHelp(false); }
});

document.querySelector('.station-head').addEventListener('click', () => ui.openCard('station'));

document.addEventListener('visibilitychange', () => { if (!document.hidden) clock.getDelta(); });

/* Sonde de mise au point (?debug=1) : luminance moyenne de l'image. */
if (PARAMS.has('debug')) {
  window.__app = {
    scene, camera, renderer, post, rig, ui, game, sound, state, THREE,
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
