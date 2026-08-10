import * as THREE from 'three';
import { STATIONS, FINALE, t } from '../content/stations.js';
import { MISSIONS } from '../content/missions.js';

const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

const TIPS = {
  e: [
    '<b>Z Q S D</b> pour voler, la <b>souris</b> pour regarder.',
    'Vole <b>dans</b> les pastilles vertes pour les ramasser.',
    'Bloqué ? Appuie sur <b>G</b> : on t’emmène à ta mission.',
    'Il y a une <b>relique dorée</b> cachée dans chaque escale.',
    'Clique sur les <b>points bleus</b> : ils racontent quelque chose.',
    'Touche <b>H</b> pour cacher l’écran et prendre une belle photo.',
  ],
  a: [
    '<b>Espace</b> monte, <b>Ctrl</b> descend.',
    '<b>G</b> : la sonde vous emmène jusqu’à la mission en cours.',
    'Les pastilles se ramassent en volant dedans.',
    'Une relique est cachée au large de chaque escale, sans repère.',
    'Molette : <b>focale</b> de la sonde.',
    '<b>H</b> masque l’interface — mode contemplation.',
  ],
};

export class UI {
  constructor(cb) {
    this.cb = cb;
    this.age = 'adulte';
    this.index = 0;
    this.seen = new Set();
    this.spots = [];
    this.openKey = null;
    this.answered = new Set();
    this._tip = 0;
    this._v = new THREE.Vector3();
    this._build();
  }

  /* ─────────────── construction du chrome ─────────────── */
  _build() {
    $('#intro-date').textContent = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    $('#st-total').textContent = String(STATIONS.length).padStart(2, '0');

    document.querySelectorAll('.age-card').forEach(b =>
      b.addEventListener('click', () => this.cb.onStart(b.dataset.age)));

    // rail + carte du corps
    const rail = $('#rail'), dots = $('#bm-dots');
    STATIONS.forEach((s, i) => {
      const li = el('li');
      li.innerHTML = `<i></i><span></span>`;
      li.querySelector('span').textContent = t(s.name, this.age);
      li.addEventListener('click', () => this.cb.onStation(i));
      rail.appendChild(li);

      const ns = 'http://www.w3.org/2000/svg';
      const pulse = document.createElementNS(ns, 'circle');
      pulse.setAttribute('class', 'bm-pulse'); pulse.setAttribute('cx', s.map[0]); pulse.setAttribute('cy', s.map[1]); pulse.setAttribute('r', '4');
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('class', 'bm-dot'); c.setAttribute('cx', s.map[0]); c.setAttribute('cy', s.map[1]); c.setAttribute('r', '2.6');
      c.addEventListener('click', () => this.cb.onStation(i));
      dots.appendChild(pulse); dots.appendChild(c);
    });
    this.railItems = [...rail.children];
    this.dotItems = [...dots.querySelectorAll('.bm-dot')];
    this.pulseItems = [...dots.querySelectorAll('.bm-pulse')];

    // sommaire
    const list = $('#menu-list');
    STATIONS.forEach((s, i) => {
      const li = el('li');
      li.innerHTML = `<button>
        <span class="menu-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="menu-label"><b></b><span></span></span>
        <svg class="menu-tick" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
      </button>`;
      li.querySelector('button').addEventListener('click', () => { this.cb.onStation(i); this.toggleMenu(false); });
      list.appendChild(li);
    });
    this.menuItems = [...list.children];

    // barres et boutons
    $('#btn-menu').addEventListener('click', () => this.toggleMenu());
    $('#menu-close').addEventListener('click', () => this.toggleMenu(false));
    $('#btn-help').addEventListener('click', () => this.toggleHelp());
    $('#help-close').addEventListener('click', () => this.toggleHelp(false));
    $('#help').addEventListener('click', (e) => { if (e.target === $('#help')) this.toggleHelp(false); });
    $('#card-close').addEventListener('click', () => this.closeCard());
    $('#btn-prev').addEventListener('click', () => this.cb.onStation(this.index - 1));
    $('#btn-next').addEventListener('click', () => this.cb.onStation(this.index + 1));
    $('#btn-sound').addEventListener('click', () => this.cb.onSound());
    document.querySelectorAll('.age-switch button').forEach(b =>
      b.addEventListener('click', () => this.cb.onAge(b.dataset.age)));

    $('#quest-guide').addEventListener('click', () => this.cb.onGuide());
    $('#quests-toggle').addEventListener('click', () => {
      const q = $('#quests');
      const open = !q.classList.contains('folded');
      q.classList.toggle('folded', open);
      $('#quests-toggle').setAttribute('aria-expanded', String(!open));
    });

    this.hotspotLayer = $('#hotspots');
    this._stick();
    setInterval(() => this._rotateTip(), 11000);
  }

  /* ─────────────── joystick tactile ─────────────── */
  _stick() {
    const s = $('#stick'), knob = $('#stick-knob');
    if (!matchMedia('(pointer: coarse)').matches) return;
    s.hidden = false;
    let id = null;
    const set = (dx, dy) => {
      const r = 30, d = Math.hypot(dx, dy), k = d > r ? r / d : 1;
      knob.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
      this.cb.onStick(dx * k / r, dy * k / r, true);
    };
    s.addEventListener('pointerdown', (e) => { id = e.pointerId; s.setPointerCapture(id); set(0, 0); e.stopPropagation(); });
    s.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      const r = s.getBoundingClientRect();
      set(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      e.stopPropagation();
    });
    const end = () => { id = null; knob.style.transform = ''; this.cb.onStick(0, 0, false); };
    s.addEventListener('pointerup', end);
    s.addEventListener('pointercancel', end);
  }

  /* ─────────────── états ─────────────── */
  setAge(age) {
    this.age = age;
    document.body.dataset.age = age;
    document.querySelectorAll('.age-switch button').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.age === age)));
    STATIONS.forEach((s, i) => {
      this.railItems[i].querySelector('span').textContent = t(s.name, age);
      this.menuItems[i].querySelector('b').textContent = t(s.name, age);
      this.menuItems[i].querySelector('.menu-label span').textContent = t(s.sub, age);
    });
    if (this.station) this._chrome();
    if (this.openKey) this.openCard(this.openKey, true);
    for (const h of this.spots) {
      const s = STATIONS[this.index];
      h.node.querySelector('.hotspot-label').textContent = t(s.spots[h.key].label, age);
    }
    this._rotateTip();
  }

  setStation(index) {
    this.index = index;
    this.station = STATIONS[index];
    this.seen.add(index);
    this.closeCard();
    this._chrome();
    this.narrate(t(this.station.intro, this.age), 11000);
  }

  /* ─────────────── carnet de missions ─────────────── */
  setQuests(def, done, picked, total) {
    this.questDef = def;
    const list = $('#quest-list');
    list.innerHTML = '';
    const missions = def?.missions || [];
    for (const m of missions) {
      const li = el('li', 'quest' + (done.has(m.id) ? ' done' : ''));
      li.dataset.id = m.id;
      const count = m.type === 'collect' ? ` <i>${Math.min(picked, m.n)}/${m.n}</i>` : '';
      li.innerHTML = `<span class="quest-tick" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
        </span><span class="quest-text">${t(m.label, this.age)}${count}</span>`;
      list.appendChild(li);
    }
    $('#quests-count').textContent = `${done.size}/${missions.length}`;
    $('#quests').hidden = missions.length === 0;
  }

  updateQuests(done, picked) {
    const missions = this.questDef?.missions || [];
    for (const li of $('#quest-list').children) {
      const m = missions.find(x => x.id === li.dataset.id);
      if (!m) continue;
      li.classList.toggle('done', done.has(m.id));
      if (m.type === 'collect') {
        const i = li.querySelector('i');
        if (i) i.textContent = `${Math.min(picked, m.n)}/${m.n}`;
      }
    }
    $('#quests-count').textContent = `${done.size}/${missions.length}`;
  }

  setScore(n) {
    $('#score-val').textContent = String(n);
    $('#quest-score').textContent = `${n} pts`;   // relais sur petit écran
  }

  /** Un battement vient de passer : le cœur de l'interface bat avec lui. */
  beat() {
    const c = $('#chip-pulse');
    if (!c) return;
    c.classList.add('beat');
    clearTimeout(this._bt);
    this._bt = setTimeout(() => c.classList.remove('beat'), 90);
  }

  /** Bandeau d'annonce : mission accomplie, relique trouvée. */
  toast(html, kind = '') {
    const box = $('#toasts');
    const node = el('div', `toast ${kind}`, html);
    box.appendChild(node);
    requestAnimationFrame(() => node.classList.add('on'));
    setTimeout(() => {
      node.classList.remove('on');
      setTimeout(() => node.remove(), 500);
    }, kind === 'relic' ? 6000 : 3600);
  }

  _chrome() {
    const s = this.station, i = this.index;
    $('#st-num').textContent = String(i + 1).padStart(2, '0');
    $('#st-name').textContent = t(s.name, this.age);
    $('#st-sub').textContent = t(s.sub, this.age);
    document.documentElement.style.setProperty('--accent-station', s.accent);
    this.railItems.forEach((li, k) => {
      li.classList.toggle('now', k === i);
      li.classList.toggle('seen', this.seen.has(k));
    });
    this.dotItems.forEach((c, k) => {
      c.classList.toggle('now', k === i);
      c.classList.toggle('seen', this.seen.has(k));
    });
    this.pulseItems.forEach((c, k) => c.classList.toggle('now', k === i));
    this.menuItems.forEach((li, k) => {
      li.classList.toggle('now', k === i);
      li.classList.toggle('seen', this.seen.has(k));
    });
    $('#st-pager').textContent = String(i + 1).padStart(2, '0');
    $('#btn-prev').disabled = i === 0;
    $('#btn-next').disabled = i === STATIONS.length - 1;
  }

  /** Escales dont les trois missions sont accomplies. */
  setBadges(badges) {
    const set = new Set(badges);
    this.menuItems.forEach((li, k) => li.classList.toggle('badge', set.has(k)));
    this.dotItems.forEach((c, k) => c.classList.toggle('badge', set.has(k)));
    $('#menu-progress').textContent = set.size === 0
      ? `${this.seen.size} escale${this.seen.size > 1 ? 's' : ''} sur ${STATIONS.length} visitée${this.seen.size > 1 ? 's' : ''}`
      : `${set.size} escale${set.size > 1 ? 's' : ''} bouclée${set.size > 1 ? 's' : ''} sur ${STATIONS.length}`;
  }

  setSound(on) { $('#btn-sound').setAttribute('aria-pressed', String(on)); }

  /* ─────────────── fiches ─────────────── */
  openCard(key, keepScroll = false) {
    const s = this.station;
    const card = $('#card');
    const kid = this.age === 'enfant';
    const isStation = key === 'station';
    const isFinale = key === 'finale';
    const isRelic = key === 'relique';
    const relic = MISSIONS[s.id]?.relic;
    const data = isFinale ? FINALE[kid ? 'e' : 'a']
      : isRelic ? (relic && { title: t(relic.title, this.age), html: t(relic.html, this.age) })
        : isStation ? s.card[kid ? 'e' : 'a']
          : s.spots[key]?.[kid ? 'e' : 'a'];
    if (!data) return;

    this.openKey = key;
    $('#card-kicker').textContent = isFinale ? 'Fin du voyage'
      : isRelic ? 'Relique trouvée'
        : (data.kicker || t(s.spots[key].label, this.age));
    $('#card-title').textContent = data.title;
    $('#card-body').innerHTML = data.html;
    card.classList.toggle('is-relic', isRelic);

    const stats = $('#card-stats');
    stats.innerHTML = '';
    (data.stats || []).forEach(([k, v]) => {
      const li = el('li');
      li.appendChild(el('b', null, k));
      li.appendChild(el('span', null, v));
      stats.appendChild(li);
    });

    const quiz = $('#card-quiz');
    quiz.innerHTML = '';
    quiz.hidden = !isStation;
    if (isStation) this._quiz(quiz);

    card.hidden = false;
    document.body.classList.add('panel-open', 'reading');
    if (!keepScroll) $('.card-scroll').scrollTop = 0;
    this.hotspotLayer.querySelectorAll('.hotspot').forEach(h =>
      h.classList.toggle('open', h.dataset.key === key));
    // la sonde s'immobilise et rend le curseur : sinon on ne peut pas lire
    this.cb.onRead?.(true);
    if (!isStation && !isFinale && !isRelic) this.cb.onSpotRead?.(key);
  }

  _quiz(root) {
    const q = this.station.quiz[this.age === 'enfant' ? 'e' : 'a'];
    if (!q) return;
    const id = `${this.index}:${this.age}`;
    root.appendChild(el('p', 'quiz-q', q.q));
    const opts = el('div', 'quiz-opts');
    q.opts.forEach((o, i) => {
      const b = el('button', 'quiz-opt', o);
      b.addEventListener('click', () => {
        if (this.answered.has(id)) return;
        this.answered.add(id);
        [...opts.children].forEach((c, k) => {
          c.disabled = true;
          if (k === q.ok) c.classList.add('good');
          else if (k === i) c.classList.add('bad');
        });
        root.appendChild(el('p', 'quiz-fb', (i === q.ok ? '' : '<b>Presque !</b> ') + q.fb));
        this.cb.onAnswer(i === q.ok);
        this.cb.onQuiz?.();
      });
      opts.appendChild(b);
    });
    root.appendChild(opts);
    if (this.answered.has(id)) {
      [...opts.children].forEach((c, k) => {
        c.disabled = true;
        if (k === q.ok) c.classList.add('good');
      });
      root.appendChild(el('p', 'quiz-fb', q.fb));
    }
  }

  closeCard() {
    const was = this.openKey;
    $('#card').hidden = true;
    document.body.classList.remove('panel-open', 'reading');
    this.openKey = null;
    this.hotspotLayer.querySelectorAll('.hotspot').forEach(h => h.classList.remove('open'));
    if (was) this.cb.onRead?.(false);
  }

  /* ─────────────── points d'intérêt ─────────────── */
  buildHotspots(world) {
    this.hotspotLayer.innerHTML = '';
    this.spots = [];
    const s = STATIONS[this.index];
    for (const key in (world.spots || {})) {
      if (!s.spots || !s.spots[key] || !world.spots[key]) continue;
      const node = el('button', 'hotspot');
      node.dataset.key = key;
      node.innerHTML = `<span class="hotspot-ring"></span><span class="hotspot-label"></span>`;
      node.querySelector('.hotspot-label').textContent = t(s.spots[key].label, this.age);
      node.addEventListener('click', (e) => { e.stopPropagation(); this.goTo(key); });
      this.hotspotLayer.appendChild(node);
      this.spots.push({ key, pos: world.spots[key].clone(), node, vis: false, far: world.spotFar ?? 900 });
    }
  }

  updateHotspots(camera, w, h) {
    if (!this.spots.length) return;
    const cx = w / 2, cy = h / 2;
    for (const s of this.spots) {
      this._v.copy(s.pos).project(camera);
      const d = camera.position.distanceTo(s.pos);
      const inFront = this._v.z < 1;
      const x = (this._v.x * 0.5 + 0.5) * w, y = (-this._v.y * 0.5 + 0.5) * h;
      const onScreen = inFront && x > -60 && x < w + 60 && y > -40 && y < h + 40;
      const show = onScreen && d < s.far;
      if (show !== s.vis) { s.node.style.display = show ? '' : 'none'; s.vis = show; }
      if (!show) continue;
      s.node.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      s.node.style.opacity = String(Math.min(1, Math.max(0.25, 1.35 - d / 2400)));
      s.sx = x; s.sy = y; s.d = d;
      s.node.classList.toggle('near', Math.hypot(x - cx, y - cy) < 90);
    }
    // deux repères superposés : seul le plus proche garde son libellé
    const vis = this.spots.filter(s => s.vis).sort((a, b) => a.d - b.d);
    for (let i = 0; i < vis.length; i++) {
      let hide = false;
      for (let j = 0; j < i; j++) {
        if (!vis[j].crowded && Math.hypot(vis[i].sx - vis[j].sx, vis[i].sy - vis[j].sy) < 132) { hide = true; break; }
      }
      vis[i].crowded = hide;
      vis[i].node.classList.toggle('crowded', hide);
    }
  }

  /**
   * Clic sur un repère : la sonde va se placer devant, puis la fiche s'ouvre.
   * C'est ce qui remplace l'ancien rail — on demande, on est emmené.
   */
  goTo(key) {
    const s = this.spots.find(x => x.key === key);
    if (!s) return;
    this.cb.onSpot();
    this.cb.onTravel(s.pos, () => this.openCard(key));
  }

  /** Ouvre le repère le plus proche d'un point de l'écran. */
  pickAt(x, y, radius = 90) {
    let best = null, bd = radius;
    for (const s of this.spots) {
      if (!s.vis) continue;
      const d = Math.hypot(s.sx - x, s.sy - y);
      if (d < bd) { bd = d; best = s; }
    }
    if (best) { this.goTo(best.key); return true; }
    return false;
  }

  /* ─────────────── divers ─────────────── */
  narrate(html, ms = 9000) {
    const n = $('#narration');
    if (!html) { n.hidden = true; return; }
    $('#narr-text').innerHTML = html;
    n.hidden = false;
    n.style.animation = 'none'; void n.offsetWidth; n.style.animation = '';
    clearTimeout(this._nt);
    this._nt = setTimeout(() => { n.hidden = true; }, ms);
  }

  _rotateTip() {
    const arr = TIPS[this.age === 'enfant' ? 'e' : 'a'];
    const h = $('#hint');
    h.classList.remove('on');
    setTimeout(() => {
      h.innerHTML = arr[this._tip++ % arr.length];
      h.classList.add('on');
    }, 320);
  }

  toggleMenu(v) {
    const m = $('#menu');
    m.hidden = v === undefined ? !m.hidden : !v;
    this._panels();
  }
  toggleHelp(v) { const m = $('#help'); m.hidden = v === undefined ? !m.hidden : !v; this._panels(); }

  /** Un panneau ouvert immobilise la sonde et rend le curseur. */
  _panels() {
    const open = !$('#menu').hidden || !$('#card').hidden || !$('#help').hidden;
    document.body.classList.toggle('panel-open', open);
    document.body.classList.toggle('reading', open);
    this.cb.onRead?.(open);
  }

  transit(on) { $('#transit').classList.toggle('on', on); }

  loader(on, label) {
    $('#loader').hidden = !on;
    if (label) $('#loader-station').textContent = label;
  }
}
