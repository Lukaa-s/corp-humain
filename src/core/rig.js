import * as THREE from 'three';
import { clamp, lerp } from './build.js';

const DEG = Math.PI / 180;
const smoothstep01 = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
/** Ramène un angle cible à moins d'un demi-tour de l'angle courant. */
const near = (target, current) => {
  while (target - current > Math.PI) target -= Math.PI * 2;
  while (target - current < -Math.PI) target += Math.PI * 2;
  return target;
};

/**
 * Pilotage de la sonde — vol libre, six axes, contenu dans les limites de
 * l'escale. Il n'y a plus de rail : le seul déplacement automatique est le
 * « voyage », qui emmène la sonde devant un point précis quand on le demande
 * (clic sur un repère, bouton d'une mission). Toute commande l'interrompt.
 */
export class Rig {
  constructor(camera, dom) {
    this.cam = camera;
    this.dom = dom;

    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.yaw = 0; this.pitch = 0;
    this.tYaw = 0; this.tPitch = 0;

    this.frozen = false;                      // fiche ouverte : on rend la main
    this.bounds = null;
    this.freeSpeed = 26;
    this.fov = 68; this.fovTarget = 68;
    this.shake = 0;
    this.roll = 0; this.rollTarget = 0;
    this.travel = null;
    this.onArrive = null;

    this.keys = new Set();
    this.drag = null;
    this.stick = { x: 0, y: 0, active: false };
    this.locked = false;
    this._boost = 0;
    this.moving = false;
    this.speedScale = 1;

    this._q = new THREE.Quaternion();
    this._p = new THREE.Vector3();
    this._p2 = new THREE.Vector3();
    this._up = new THREE.Vector3(0, 1, 0);
    this._f = new THREE.Vector3();
    this._r = new THREE.Vector3();
    this._acc = new THREE.Vector3();

    this._bind();
  }

  /* ─────────── entrées ─────────── */
  _bind() {
    const d = this.dom;

    addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      this.keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    });
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());

    d.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || this.frozen) return;
      this.drag = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: 0 };
      d.setPointerCapture(e.pointerId);
    });
    d.addEventListener('pointermove', (e) => {
      if (this.frozen) return;
      if (this.locked) { this._look(e.movementX, e.movementY, 0.0022); return; }
      if (!this.drag || e.pointerId !== this.drag.id) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      this.drag.x = e.clientX; this.drag.y = e.clientY;
      this.drag.moved += Math.abs(dx) + Math.abs(dy);
      if (this.drag.moved > 6) this.travel = null;
      this._look(dx, dy, 0.0034);
    });
    const end = (e) => {
      if (this.drag && e.pointerId === this.drag.id) {
        const wasTap = this.drag.moved < 5;
        this.drag = null;
        this._release(e.pointerId);
        if (wasTap && this.onTap) this.onTap(e);
      }
    };
    d.addEventListener('pointerup', end);
    d.addEventListener('pointercancel', end);
    d.addEventListener('lostpointercapture', () => { this.drag = null; });

    d.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.fovTarget = clamp(this.fovTarget + Math.sign(e.deltaY) * 3.2, 32, 84);
    }, { passive: false });

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === d;
      document.body.classList.toggle('locked', this.locked);
      // une capture laissée en place après un changement de mode avale tous
      // les clics suivants : plus rien n'est cliquable dans l'interface
      if (this.drag) { this._release(this.drag.id); this.drag = null; }
    });
    document.addEventListener('pointerlockerror', () => {
      this.locked = false;
      document.body.classList.remove('locked');
    });
  }

  _release(id) {
    try { if (this.dom.hasPointerCapture?.(id)) this.dom.releasePointerCapture(id); } catch { /* déjà relâchée */ }
  }

  requestLock() { if (!this.locked && !this.frozen && this.dom.requestPointerLock) this.dom.requestPointerLock(); }
  releaseLock() { if (this.locked && document.exitPointerLock) document.exitPointerLock(); }

  _look(dx, dy, k) {
    this.tYaw -= dx * k;
    this.tPitch = clamp(this.tPitch - dy * k, -85 * DEG, 85 * DEG);
  }

  /* ─────────── escales ─────────── */
  setStation(st) {
    this.bounds = st.bounds || null;
    this.freeSpeed = st.freeSpeed ?? 26;
    this.fovTarget = st.fov ?? 68;
    this.rollTarget = 0;
    this.travel = null;
    this.vel.set(0, 0, 0);

    // point de départ : le début du parcours de l'escale, tourné vers la suite
    const path = st.path;
    if (path) {
      path.getPointAt(0, this.pos);
      const ahead = path.getPointAt(0.03, this._p);
      const dir = ahead.sub(this.pos).normalize();
      this.yaw = this.tYaw = Math.atan2(-dir.x, -dir.z);
      this.pitch = this.tPitch = Math.asin(clamp(dir.y, -1, 1));
    } else {
      this.pos.set(0, 0, 0);
      this.yaw = this.tYaw = 0; this.pitch = this.tPitch = 0;
    }
  }

  /**
   * Emmène la sonde devant un point. Si l'escale a prévu un poste
   * d'observation (`view`), on s'y pose exactement : c'est ce qui garantit
   * qu'on voit l'objet sous le bon angle et à la bonne distance. Sinon on
   * l'approche depuis le côté où la sonde se trouve déjà, ce qui est le
   * trajet qui a le moins de chances de traverser une paroi.
   * Toute commande de vol annule le voyage.
   */
  travelTo(target, { view = null, dist = 90, ms = 1800, onArrive = null } = {}) {
    let dest;
    if (view) {
      dest = view.clone();
    } else {
      const away = this._p.subVectors(this.pos, target);
      const d = away.length();
      if (d < 1e-3) away.set(0, 0.15, 1); else away.multiplyScalar(1 / d);
      dest = target.clone().addScaledVector(away, Math.max(dist, 8));
    }
    this.travel = {
      from: this.pos.clone(), to: dest, look: target.clone(),
      t: 0, dur: Math.max(0.4, ms / 1000),
    };
    this.onArrive = onArrive;
    this.vel.set(0, 0, 0);
  }

  cancelTravel() { this.travel = null; this.onArrive = null; }

  /* ─────────── boucle ─────────── */
  update(dt, pulse = 0) {
    const k = this.frozen ? null : this.keys;
    const has = (c) => !!k && k.has(c);
    const fwd = (has('KeyW') || has('KeyZ') || has('ArrowUp')) ? 1 : (has('KeyS') || has('ArrowDown')) ? -1 : 0;
    const str = (has('KeyD') || has('ArrowRight')) ? 1 : (has('KeyA') || has('KeyQ') || has('ArrowLeft')) ? -1 : 0;
    const vert = (has('ShiftLeft') || has('ShiftRight') || has('Space')) ? 1
      : (has('ControlLeft') || has('ControlRight')) ? -1 : 0;
    const sx = (!this.frozen && this.stick.active) ? this.stick.x : 0;
    const sy = (!this.frozen && this.stick.active) ? -this.stick.y : 0;
    const mx = clamp(str + sx, -1, 1), mz = clamp(fwd + sy, -1, 1);
    const moving = Math.abs(mx) > 0.02 || Math.abs(mz) > 0.02 || vert !== 0;
    this.moving = moving;

    if (moving) this.travel = null;

    if (this.travel) this._travel(dt);
    else this._free(dt, mx, mz, vert, moving);

    // orientation lissée
    const s = 1 - Math.pow(0.0016, dt);
    this.yaw = lerp(this.yaw, this.tYaw, s);
    this.pitch = lerp(this.pitch, this.tPitch, s);
    this.roll = lerp(this.roll, this.rollTarget, 1 - Math.pow(0.02, dt));

    this.cam.position.copy(this.pos);
    this._q.setFromEuler(new THREE.Euler(this.pitch, this.yaw, this.roll, 'YXZ'));
    this.cam.quaternion.copy(this._q);

    // micro-mouvement : respiration du pilote + secousse au battement
    const t = performance.now() * 0.001;
    const amp = 0.5 * (1 + this.shake * 3);
    this.cam.rotateX(Math.sin(t * 0.83) * 0.0028 * amp + pulse * 0.006 * this.shake);
    this.cam.rotateY(Math.sin(t * 0.61 + 1.3) * 0.0034 * amp);
    this.cam.rotateZ(Math.sin(t * 0.47 + 2.1) * 0.0022 * amp);
    this.cam.position.y += Math.sin(t * 1.15) * 0.055 * amp;
    this.cam.position.x += Math.sin(t * 0.79 + 0.7) * 0.045 * amp;

    // champ de vision : zoom molette + petite pompe cardiaque
    const target = this.fovTarget * (1 - pulse * 0.014 * this.shake);
    this.cam.fov = lerp(this.cam.fov, target, 1 - Math.pow(0.006, dt));
    this.cam.updateProjectionMatrix();
  }

  _travel(dt) {
    const tr = this.travel;
    tr.t += dt;
    const k = smoothstep01(tr.t / tr.dur);
    this.pos.lerpVectors(tr.from, tr.to, k);
    const d = this._p.subVectors(tr.look, this.pos);
    if (d.lengthSq() > 1e-4) {
      d.normalize();
      this.tYaw = near(Math.atan2(-d.x, -d.z), this.tYaw);
      this.tPitch = clamp(Math.asin(clamp(d.y, -1, 1)), -85 * DEG, 85 * DEG);
    }
    this.rollTarget = 0;
    if (tr.t >= tr.dur) {
      this.travel = null;
      const cb = this.onArrive; this.onArrive = null;
      if (cb) cb();
    }
  }

  _free(dt, mx, mz, vert, moving) {
    this._boost = moving ? Math.min(1, this._boost + dt * 0.5) : 0;
    const sp = this.freeSpeed * this.speedScale * (1 + this._boost * 0.9);
    this._f.set(0, 0, -1).applyQuaternion(this.cam.quaternion);
    this._r.set(1, 0, 0).applyQuaternion(this.cam.quaternion);
    this._acc.set(0, 0, 0)
      .addScaledVector(this._f, mz * sp)
      .addScaledVector(this._r, mx * sp * 0.8)
      .addScaledVector(this._up, vert * sp * 0.7);
    this.vel.lerp(this._acc, 1 - Math.pow(0.0009, dt));
    this.pos.addScaledVector(this.vel, dt);
    this._contain(dt);
    this.rollTarget = -mx * 0.09;
  }

  /* Rappel élastique vers l'intérieur de l'escale. */
  _contain(dt) {
    const b = this.bounds;
    if (!b) return;
    const push = 1 - Math.pow(0.001, dt);
    if (b.type === 'tube') {
      const z = clamp(this.pos.z, b.z0, b.z1);
      b.channel.center(z, this._p);
      const d = this._p2.subVectors(this.pos, this._p);
      d.z = 0;
      const rad = d.length();
      const maxR = (b.radius ?? 10) * 0.88;
      if (rad > maxR) {
        d.multiplyScalar((rad - maxR) / rad);
        this.pos.x -= d.x * push; this.pos.y -= d.y * push;
        this.vel.multiplyScalar(0.9);
      }
      if (this.pos.z < b.z0) { this.pos.z = lerp(this.pos.z, b.z0, push); this.vel.z *= 0.8; }
      if (this.pos.z > b.z1) { this.pos.z = lerp(this.pos.z, b.z1, push); this.vel.z *= 0.8; }
    } else {
      const c = b.center ?? new THREE.Vector3();
      const d = this._p2.subVectors(this.pos, c);
      const r = d.length(), maxR = b.radius ?? 60;
      if (r > maxR) {
        this.pos.copy(c).addScaledVector(d.multiplyScalar(1 / r), lerp(r, maxR, push));
        this.vel.multiplyScalar(0.88);
      }
      if (b.floor !== undefined && this.pos.y < b.floor) {
        this.pos.y = lerp(this.pos.y, b.floor, push); this.vel.y *= 0.5;
      }
      if (b.ceiling !== undefined && this.pos.y > b.ceiling) {
        this.pos.y = lerp(this.pos.y, b.ceiling, push); this.vel.y *= 0.5;
      }
    }
  }
}
