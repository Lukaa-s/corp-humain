import * as THREE from 'three';
import { STATIONS, FINALE, t } from '../content/stations.js';
import { MISSIONS } from '../content/missions.js';
import { clamp } from './build.js';

const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

const TIPS = {
  e: [
    '<b>Z Q S D</b> pour voler, la <b>souris</b> pour regarder.',
    'Vise un cercle et appuie sur <b>E</b> : il te raconte ce qu’il montre.',
    'Vole <b>dans</b> les pastilles pour les ramasser.',
    'Bloqué ? Appuie sur <b>G</b> : on t’emmène à ta mission.',
    'Il y a une <b>relique dorée</b> cachée dans chaque escale.',
    '<b>Échap</b> te rend le curseur de la souris.',
    'Touche <b>H</b> pour cacher l’écran et prendre une belle photo.',
  ],
  a: [
    '<b>Espace</b> monte, <b>Ctrl</b> descend.',
    'Le cercle d’un repère a la taille réelle de ce qu’il désigne.',
    'Visez un cercle, puis <b>E</b> : la sonde s’y pose et la fiche s’ouvre.',
    '<b>G</b> : la sonde vous emmène jusqu’à la mission en cours.',
    'Une relique est cachée au large de chaque escale, sans repère.',
    '<b>Échap</b> relâche la souris. Molette : focale.',
    '<b>H</b> masque l’interface : mode contemplation.',
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
      h.node.querySelector('.hs-label').textContent = t(s.spots[h.key].label, age);
    }
    this._rotateTip();
  }

  setStation(index) {
    this.index = index;
    this.station = STATIONS[index];
    this.seen.add(index);
    this.closeCard();
    this._chrome();
  }

  /** Première phrase à l'arrivée, une fois le carton de chapitre retiré. */
  arrive() {
    if (this.station) this.narrate(t(this.station.intro, this.age), 11000);
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
        </span><span class="quest-text">${t(m.label, this.age)}${count}</span><span class="quest-range"></span>`;
      list.appendChild(li);
    }
    $('#quests-count').textContent = `${done.size}/${missions.length}`;
    $('#quests').hidden = missions.length === 0;
  }

  /**
   * Jauge d'approche sur l'objectif en cours. « Il ne se passe rien » venait
   * de là : on ne savait pas si on était à dix mètres ou à mille, ni à partir
   * de quand ça compte. La ligne se remplit à mesure qu'on approche et bascule
   * en « à portée » dès que la validation est acquise.
   */
  setQuestRange(id, dist, radius) {
    const list = $('#quest-list');
    if (!list) return;
    for (const li of list.children) {
      const on = !!id && li.dataset.id === id && !li.classList.contains('done');
      li.classList.toggle('active', on);
      if (!on) { if (li.dataset.range) { li.dataset.range = ''; li.style.removeProperty('--near'); } continue; }
      const near = radius > 0 ? clamp(1 - (dist - radius) / Math.max(radius * 6, 120), 0, 1) : 0;
      li.style.setProperty('--near', near.toFixed(3));
      const txt = dist < radius ? 'à portée' : `${Math.round(dist)} m`;
      if (li.dataset.range !== txt) {
        li.dataset.range = txt;
        const tag = li.querySelector('.quest-range');
        if (tag) tag.textContent = txt;
      }
      li.classList.toggle('inrange', dist < radius);
    }
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

  /* ─────────────── repères ───────────────
     Un repère n'est plus une pastille posée dans le vide : c'est un cercle
     dont le rayon à l'écran est celui de l'objet désigné, projeté. Une
     villosité fait un petit cercle, un ventricule un grand. On voit donc
     tout de suite ce que l'étiquette montre. */
  buildHotspots(world) {
    this.hotspotLayer.innerHTML = '';
    this.spots = [];
    const s = STATIONS[this.index];
    const info = world.spotInfo || {};
    for (const key in info) {
      if (!s.spots || !s.spots[key] || !info[key]) continue;
      const node = el('button', 'hotspot');
      node.dataset.key = key;
      node.innerHTML = `<i class="hs-ring"></i><i class="hs-dot"></i><i class="hs-lead"></i><span class="hs-label"></span>`;
      node.querySelector('.hs-label').textContent = t(s.spots[key].label, this.age);
      node.addEventListener('click', (e) => { e.stopPropagation(); this.goTo(key); });
      this.hotspotLayer.appendChild(node);
      this.spots.push({
        key, node, vis: false, crowded: false,
        pos: info[key].p.clone(),
        radius: info[key].r ?? 24,
        far: info[key].far ?? world.spotFar ?? 900,
      });
    }
    this.aimKey = null;
  }

  /**
   * Projette les repères. Renvoie la clé de celui qui est sous le réticule,
   * pour que « E » et le clic aient exactement la même cible que l'œil.
   */
  updateHotspots(camera, w, h) {
    const cx = w / 2, cy = h / 2;
    // demi-hauteur du plan image à un mètre : sert à projeter un rayon monde
    const kPx = (h * 0.5) / Math.tan(camera.fov * Math.PI / 360);

    for (const s of this.spots) {
      this._v.copy(s.pos).project(camera);
      const d = camera.position.distanceTo(s.pos);
      const inFront = this._v.z < 1;
      const x = (this._v.x * 0.5 + 0.5) * w, y = (-this._v.y * 0.5 + 0.5) * h;
      const rPx = clamp(s.radius * kPx / Math.max(d, 1), 13, h * 0.3);
      const onScreen = inFront && x > -rPx - 40 && x < w + rPx + 40 && y > -rPx - 40 && y < h + rPx + 40;
      // dedans, ou presque : le cercle deviendrait un arc géant traversant
      // l'écran, ce qui se lit comme un trait perdu et non comme une désignation
      const inside = d < s.radius * 0.9;
      const show = onScreen && d < s.far && !inside;
      if (show !== s.vis) { s.node.style.display = show ? '' : 'none'; s.vis = show; }
      if (!show) continue;
      s.node.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      s.node.style.setProperty('--r', `${rPx.toFixed(1)}px`);
      s.node.style.opacity = String(clamp(1.5 - d / (s.far * 1.15), 0.3, 1));
      s.sx = x; s.sy = y; s.d = d; s.rPx = rPx;
      // « visé » = le réticule tombe dans le cercle, ou tout près de son centre
      s.aimed = Math.hypot(x - cx, y - cy) < Math.max(rPx * 0.95, 62);
    }

    // deux cercles l'un sur l'autre : le plus proche garde son étiquette
    const vis = this.spots.filter(s => s.vis).sort((a, b) => a.d - b.d);
    for (let i = 0; i < vis.length; i++) {
      let hide = false;
      for (let j = 0; j < i; j++) {
        if (!vis[j].crowded && Math.hypot(vis[i].sx - vis[j].sx, vis[i].sy - vis[j].sy) < 128) { hide = true; break; }
      }
      vis[i].crowded = hide;
      vis[i].node.classList.toggle('crowded', hide);
    }

    // un seul repère visé à la fois : le plus proche du centre
    let aim = null;
    for (const s of vis) {
      if (!s.aimed) continue;
      const dc = Math.hypot(s.sx - cx, s.sy - cy);
      if (!aim || dc < aim.dc) aim = { s, dc };
    }
    for (const s of this.spots) s.node.classList.toggle('near', !!aim && aim.s === s);
    this.aimKey = aim ? aim.s.key : null;
    this._aimHint(aim ? aim.s : null);
    return this.aimKey;
  }

  _aimHint(spot) {
    const open = !!this.openKey;
    document.body.classList.toggle('aiming', !!spot && !open);
    if (spot && !open) {
      const label = t(STATIONS[this.index].spots[spot.key].label, this.age);
      const txt = `E · ${label}`;
      if (txt !== this._hintTxt) { $('#ret-hint').textContent = txt; this._hintTxt = txt; }
    }
  }

  /** Réticule visible dès qu'on pilote : c'est lui qui désigne, pas le curseur. */
  setReticle(on) { $('#reticle').hidden = !on; }

  /**
   * Boussole d'objectif : une flèche posée sur le bord de l'écran quand la
   * cible de la mission est hors champ, avec la distance qui reste. Sans elle,
   * « atteins le sommet d'un poil » revient à chercher au hasard.
   */
  updateCompass(camera, w, h, target, label) {
    const c = $('#compass');
    if (!target) { if (!c.hidden) c.hidden = true; return; }
    this._v.copy(target).project(camera);
    const behind = this._v.z > 1;
    let x = (this._v.x * 0.5 + 0.5) * w, y = (-this._v.y * 0.5 + 0.5) * h;
    if (behind) { x = w - x; y = h - y; }
    const cx = w / 2, cy = h / 2;
    const m = 76;
    const inside = !behind && x > m && x < w - m && y > m && y < h - m;
    const d = camera.position.distanceTo(target);
    if (inside) { if (!c.hidden) c.hidden = true; return; }

    // on ramène le point sur le cadre intérieur, en gardant sa direction
    let dx = x - cx, dy = y - cy;
    const sc = Math.min((w / 2 - m) / Math.abs(dx || 1e-6), (h / 2 - m) / Math.abs(dy || 1e-6));
    dx *= sc; dy *= sc;
    c.hidden = false;
    c.style.transform = `translate(${(cx + dx).toFixed(0)}px, ${(cy + dy).toFixed(0)}px) translate(-50%, -50%)`;
    c.querySelector('svg').style.transform = `rotate(${(Math.atan2(dy, dx) * 180 / Math.PI + 90).toFixed(0)}deg)`;
    const txt = `${label} · ${Math.round(d)} m`;
    if (txt !== this._compassTxt) { $('#compass-label').textContent = txt; this._compassTxt = txt; }
  }

  /** Clic ou « E » sur un repère : la sonde va se placer devant, puis la fiche s'ouvre. */
  goTo(key) {
    const s = this.spots.find(x => x.key === key);
    if (!s) return;
    this.cb.onSpot();
    this.cb.onTravel(key, () => this.openCard(key));
  }

  /**
   * Ouvre le repère visé. Quand la souris est capturée, ses coordonnées ne
   * bougent plus : c'est le réticule qui désigne, donc on passe par `aimKey`.
   */
  pickAt(x, y, radius = 90) {
    if (x == null) { if (this.aimKey) { this.goTo(this.aimKey); return true; } return false; }
    let best = null, bd = radius;
    for (const s of this.spots) {
      if (!s.vis) continue;
      const d = Math.max(0, Math.hypot(s.sx - x, s.sy - y) - s.rPx * 0.9);
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

  /**
   * Carton de chapitre. On l'affiche AVANT de construire l'escale suivante :
   * la construction bloque le fil principal une seconde ou deux, et sans ce
   * masque opaque on voyait l'image se figer, ce qui passait pour un plantage.
   * `show()` rend la main dès que l'écran est réellement peint.
   */
  async transit(index, dir = 1) {
    const s = STATIONS[index];
    const t2 = $('#transit');
    document.documentElement.style.setProperty('--accent-station', s.accent);
    $('#transit-step').textContent = `Escale ${String(index + 1).padStart(2, '0')} sur ${String(STATIONS.length).padStart(2, '0')}`;
    $('#transit-name').textContent = t(s.name, this.age);
    $('#transit-link').innerHTML = t(dir < 0 ? (s.back || s.link) : s.link, this.age) || '';
    t2.hidden = false;
    // deux images pour que le navigateur peigne l'écran, puis la durée du fondu
    await raf(); await raf();
    t2.classList.add('on');
    await wait(360);
  }

  transitDone() {
    const t2 = $('#transit');
    t2.classList.remove('on');
    clearTimeout(this._tt);
    this._tt = setTimeout(() => { t2.hidden = true; }, 400);
  }
}

const raf = () => new Promise(r => requestAnimationFrame(r));
const wait = (ms) => new Promise(r => setTimeout(r, ms));
