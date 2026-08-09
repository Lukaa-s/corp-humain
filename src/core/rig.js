import * as THREE from 'three';
import { clamp, lerp } from './build.js';

const DEG = Math.PI / 180;
const smoothstep01 = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

/**
 * Pilotage de la sonde.
 *  · mode « guide » : la caméra suit le rail de l'escale, le visiteur garde
 *    la liberté de tourner la tête (l'écart revient doucement à zéro) ;
 *  · mode « libre » : vol six axes, contenu dans les limites de l'escale.
 */
export class Rig {
  constructor(camera, dom) {
    this.cam = camera;
    this.dom = dom;
    this.mode = 'guide';

    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.yaw = 0; this.pitch = 0;
    this.offYaw = 0; this.offPitch = 0;      // écart libre en mode guidé
    this.tYaw = 0; this.tPitch = 0;

    this.u = 0;                               // avancement sur le rail
    this.speed = 0.02;
    this.paused = false;
    this.path = null;
    this.bounds = null;
    this.focus = null;                        // sujet que la sonde garde dans l'axe
    this.freeSpeed = 26;
    this.lookAhead = 0.012;
    this.blend = 1;                           // 1 = collé au rail
    this.fov = 68; this.fovTarget = 68;
    this.shake = 0;
    this.roll = 0; this.rollTarget = 0;

    this.keys = new Set();
    this.drag = null;
    this.stick = { x: 0, y: 0, active: false };
    this.locked = false;
    this._boost = 0;

    this._q = new THREE.Quaternion();
    this._qRail = new THREE.Quaternion();
    this._m = new THREE.Matrix4();
    this._p = new THREE.Vector3();
    this._p2 = new THREE.Vector3();
    this._up = new THREE.Vector3(0, 1, 0);

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
      if (e.button !== 0) return;
      this.drag = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: 0 };
      d.setPointerCapture(e.pointerId);
    });
    d.addEventListener('pointermove', (e) => {
      if (this.locked) { this._look(e.movementX, e.movementY, 0.0022); return; }
      if (!this.drag || e.pointerId !== this.drag.id) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      this.drag.x = e.clientX; this.drag.y = e.clientY;
      this.drag.moved += Math.abs(dx) + Math.abs(dy);
      this._look(dx, dy, 0.0034);
    });
    const end = (e) => {
      if (this.drag && e.pointerId === this.drag.id) {
        if (this.drag.moved < 5 && this.onTap) this.onTap(e);
        this.drag = null;
      }
    };
    d.addEventListener('pointerup', end);
    d.addEventListener('pointercancel', end);

    d.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.fovTarget = clamp(this.fovTarget + Math.sign(e.deltaY) * 3.2, 32, 84);
    }, { passive: false });

    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === d;
      document.body.classList.toggle('locked', this.locked);
    });
  }

  requestLock() { if (!this.locked && this.dom.requestPointerLock) this.dom.requestPointerLock(); }
  releaseLock() { if (this.locked) document.exitPointerLock(); }

  _look(dx, dy, k) {
    if (this.mode === 'libre') {
      this.tYaw -= dx * k;
      this.tPitch = clamp(this.tPitch - dy * k, -85 * DEG, 85 * DEG);
    } else {
      this.offYaw = clamp(this.offYaw - dx * k, -110 * DEG, 110 * DEG);
      this.offPitch = clamp(this.offPitch - dy * k, -68 * DEG, 68 * DEG);
    }
  }

  /* ─────────── escales ─────────── */
  setStation(st, { keepView = false } = {}) {
    this.path = st.path || null;
    this.bounds = st.bounds || null;
    this.focus = st.focus || null;
    this.speed = st.speed ?? 0.018;
    this.freeSpeed = st.freeSpeed ?? 26;
    this.lookAhead = st.lookAhead ?? 0.012;
    this.u = st.startU ?? 0;
    this.blend = 1;
    this.offYaw = this.offPitch = 0;
    this.rollTarget = 0;
    this.fovTarget = st.fov ?? 68;
    if (!keepView && this.path) {
      this.path.getPointAt(clamp(this.u, 0, 1), this.pos);
      const ahead = this.path.getPointAt(clamp(this.u + this.lookAhead, 0, 1), this._p);
      const dir = ahead.clone().sub(this.pos).normalize();
      this.yaw = this.tYaw = Math.atan2(-dir.x, -dir.z);
      this.pitch = this.tPitch = Math.asin(clamp(dir.y, -1, 1));
    }
    this.vel.set(0, 0, 0);
  }

  setMode(m) {
    if (m === this.mode) return;
    if (m === 'libre') {
      this.tYaw = this.yaw; this.tPitch = this.pitch;
      this.vel.set(0, 0, 0);
    } else {
      this.blend = 0;                              // retour progressif sur le rail
      this.offYaw = 0; this.offPitch = 0;
      if (this.path) this.u = this._nearestU(this.pos);
      this.releaseLock();
    }
    this.mode = m;
  }

  _nearestU(p) {
    if (!this.path) return 0;
    let best = 0, bd = Infinity;
    for (let i = 0; i <= 120; i++) {
      const u = i / 120;
      const d = this.path.getPointAt(u, this._p2).distanceToSquared(p);
      if (d < bd) { bd = d; best = u; }
    }
    return best;
  }

  /* ─────────── boucle ─────────── */
  update(dt, pulse = 0) {
    const k = this.keys;
    const fwd = (k.has('KeyW') || k.has('KeyZ') || k.has('ArrowUp')) ? 1 : (k.has('KeyS') || k.has('ArrowDown')) ? -1 : 0;
    const str = (k.has('KeyD') || k.has('ArrowRight')) ? 1 : (k.has('KeyA') || k.has('KeyQ') || k.has('ArrowLeft')) ? -1 : 0;
    const vert = (k.has('ShiftLeft') || k.has('ShiftRight')) ? 1 : (k.has('ControlLeft') || k.has('ControlRight')) ? -1 : 0;
    const sx = this.stick.active ? this.stick.x : 0;
    const sy = this.stick.active ? -this.stick.y : 0;
    const mx = clamp(str + sx, -1, 1), mz = clamp(fwd + sy, -1, 1);
    const moving = Math.abs(mx) > 0.02 || Math.abs(mz) > 0.02 || vert !== 0;

    if (this.mode === 'libre') this._free(dt, mx, mz, vert, moving);
    else this._guided(dt, mz, mx, moving);

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
    const amp = (this.mode === 'guide' ? 1 : 0.45) * (1 + this.shake * 3);
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

  _guided(dt, mz, mx, moving) {
    if (!this.path) return;
    // la molette de déplacement module la vitesse d'avance
    const boost = 1 + Math.max(0, mz) * 1.6 + Math.min(0, mz) * 0.9;
    if (!this.paused) this.u += this.speed * dt * boost;
    if (this.u > 1) { this.u = 1; if (this.onEnd) this.onEnd(); }
    this.u = clamp(this.u, 0, 1);

    this.path.getPointAt(this.u, this._p);
    this.blend = Math.min(1, this.blend + dt * 0.7);
    this.pos.lerp(this._p, this.blend >= 1 ? 1 : 1 - Math.pow(0.02, dt));

    const ahead = this.path.getPointAt(clamp(this.u + this.lookAhead, 0, 1), this._p2);
    const dir = ahead.sub(this._p).normalize();
    let railYaw = Math.atan2(-dir.x, -dir.z);
    let railPitch = Math.asin(clamp(dir.y, -1, 1));

    // fenêtre de contemplation : la caméra se tourne vers un sujet précis
    const f = this.focus;
    if (f) {
      const fade = f.fade ?? 0.14;
      const w = Math.min(smoothstep01((this.u - f.from) / fade), smoothstep01((f.to - this.u) / fade));
      if (w > 0.002) {
        const d = this._p2.subVectors(f.point, this.pos).normalize();
        let fy = Math.atan2(-d.x, -d.z);
        while (fy - railYaw > Math.PI) fy -= Math.PI * 2;
        while (fy - railYaw < -Math.PI) fy += Math.PI * 2;
        railYaw = lerp(railYaw, fy, w);
        railPitch = lerp(railPitch, Math.asin(clamp(d.y, -1, 1)), w);
      }
    }

    // l'écart de regard revient au centre quand on lâche la souris
    if (!this.drag && !this.locked) {
      const back = 1 - Math.pow(0.28, dt);
      this.offYaw = lerp(this.offYaw, 0, back);
      this.offPitch = lerp(this.offPitch, 0, back);
    }
    // on ne cumule pas les tours : recale le lacet cible près du courant
    let ty = railYaw + this.offYaw;
    while (ty - this.tYaw > Math.PI) ty -= Math.PI * 2;
    while (ty - this.tYaw < -Math.PI) ty += Math.PI * 2;
    this.tYaw = ty;
    this.tPitch = clamp(railPitch + this.offPitch, -80 * DEG, 80 * DEG);
    this.rollTarget = -mx * 0.06;
  }

  _free(dt, mx, mz, vert, moving) {
    this._boost = moving ? Math.min(1, this._boost + dt * 0.5) : 0;
    const sp = this.freeSpeed * (1 + this._boost * 0.9);
    const f = new THREE.Vector3(0, 0, -1).applyQuaternion(this.cam.quaternion);
    const r = new THREE.Vector3(1, 0, 0).applyQuaternion(this.cam.quaternion);
    const acc = new THREE.Vector3()
      .addScaledVector(f, mz * sp)
      .addScaledVector(r, mx * sp * 0.8)
      .addScaledVector(this._up, vert * sp * 0.7);
    this.vel.lerp(acc, 1 - Math.pow(0.0009, dt));
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
      const along = d.z; d.z = 0;
      const rad = d.length();
      const maxR = (b.radius ?? 10) * 0.88;
      if (rad > maxR) {
        d.multiplyScalar((rad - maxR) / rad);
        this.pos.x -= d.x * push; this.pos.y -= d.y * push;
        this.vel.multiplyScalar(0.9);
      }
      if (this.pos.z < b.z0) { this.pos.z = lerp(this.pos.z, b.z0, push); this.vel.z *= 0.8; }
      if (this.pos.z > b.z1) { this.pos.z = lerp(this.pos.z, b.z1, push); this.vel.z *= 0.8; }
      void along;
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
