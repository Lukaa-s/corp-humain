import * as THREE from 'three';
import { NOISE, CURVE, FOG, UTIL } from './glsl.js';

/* ══════════ uniformes partagés par toute la scène ══════════
   Un seul objet par uniforme : le mettre à jour met à jour tous
   les matériaux qui le référencent.                              */
export const U = {
  uTime:       { value: 0 },
  uPulse:      { value: 0 },     // battement cardiaque 0→1
  uBreath:     { value: 0 },     // respiration -1→1
  uFogColor:   { value: new THREE.Color(0x14060b) },
  uFogDensity: { value: 0.018 },
  uVivid:      { value: 1.0 },   // saturation globale (plus haute en version enfant)
  uPx:         { value: 800 },   // facteur de taille des points (dépend du viewport)
};

const g = (extra) => Object.assign({}, U, extra);

const ROT = /* glsl */`
mat3 hbRotAxis(vec3 a, float ang){
  float c = cos(ang), s = sin(ang), t = 1.0 - c;
  return mat3(
    t*a.x*a.x + c,     t*a.x*a.y + s*a.z, t*a.x*a.z - s*a.y,
    t*a.x*a.y - s*a.z, t*a.y*a.y + c,     t*a.y*a.z + s*a.x,
    t*a.x*a.z + s*a.y, t*a.y*a.z - s*a.x, t*a.z*a.z + c);
}`;

/* ═══════════════════════════════════════════════════════════
   TISSU — la surface organique de référence.
   Éclairage : lampe frontale de la sonde (à la position caméra)
   + halo de Fresnel + brillance humide + brouillard exponentiel.
   ═══════════════════════════════════════════════════════════ */
export function tissue(o = {}) {
  const defines = {};
  if (o.bump !== false) defines.HB_BUMP = '';
  if (o.vein) defines.HB_VEIN = '';
  if (o.flat) defines.HB_FLAT = '';
  // Par défaut la surface est toujours éclairée du côté de la sonde : on ne
  // dépend donc jamais du sens d'enroulement des triangles.
  if (o.faceView !== false) defines.HB_FACEVIEW = '';

  const m = new THREE.ShaderMaterial({
    defines,
    side: o.side ?? THREE.BackSide,
    transparent: !!o.transparent,
    depthWrite: o.depthWrite ?? true,
    uniforms: g({
      uDeep:       { value: new THREE.Color(o.deep ?? 0x2a0409) },
      uMid:        { value: new THREE.Color(o.mid ?? 0x8e1d2c) },
      uHot:        { value: new THREE.Color(o.hot ?? 0xff6a72) },
      uEmissive:   { value: new THREE.Color(o.emissive ?? 0x000000) },
      uNoiseScale: { value: o.noiseScale ?? 0.06 },
      uDisplace:   { value: o.displace ?? 1.2 },
      uFlowSpeed:  { value: o.flow ?? 0.0 },
      uPulseAmp:   { value: o.pulseAmp ?? 0.25 },
      uBreathAmp:  { value: o.breathAmp ?? 0.0 },
      uRim:        { value: o.rim ?? 0.55 },
      uWet:        { value: o.wet ?? 0.35 },
      uShiny:      { value: o.shiny ?? 22.0 },
      uFall:       { value: o.falloff ?? 0.0016 },
      uLight:      { value: o.light ?? 1.0 },
      uAmbient:    { value: o.ambient ?? 0.22 },
      uBumpScale:  { value: o.bumpScale ?? 0.55 },
      uBumpAmp:    { value: o.bumpAmp ?? 0.35 },
      uNormalMix:  { value: o.normalMix ?? 0.55 },
      uVein:       { value: o.veinAmt ?? 0.5 },
      uVeinScale:  { value: o.veinScale ?? 0.12 },
      uAlpha:      { value: o.alpha ?? 1.0 },
      uSide:       { value: o.side === THREE.FrontSide ? 1 : -1 },
      uKeyDir:     { value: (o.keyDir ?? new THREE.Vector3(0.4, 1, 0.3)).clone().normalize() },
      uKeyColor:   { value: new THREE.Color(o.keyColor ?? 0xffe6cf) },
      uKeyInt:     { value: o.key ?? 0.0 },
      uCrack:      { value: o.crack ?? 0.0 },
      uCrackScale: { value: o.crackScale ?? 0.09 },
    }),
    vertexShader: /* glsl */`
      ${NOISE}
      uniform float uTime, uPulse, uBreath, uNoiseScale, uDisplace, uFlowSpeed, uPulseAmp, uBreathAmp;
      varying vec3 vWorld; varying vec3 vNrm; varying vec2 vUv; varying float vN;
      void main(){
        vUv = uv;
        vec3 p = position;
        vec3 np = p * uNoiseScale + vec3(0.0, 0.0, -uTime * uFlowSpeed);
        float n = hbFbm(np);
        vN = n;
        float amp = uDisplace * (1.0 + uPulse * uPulseAmp + uBreath * uBreathAmp);
        p += normal * (n * amp);
        vec4 wp = modelMatrix * vec4(p, 1.0);
        vWorld = wp.xyz;
        vNrm = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      ${NOISE}${UTIL}${FOG}
      uniform vec3 uDeep, uMid, uHot, uEmissive, uKeyDir, uKeyColor;
      uniform float uRim, uWet, uShiny, uFall, uLight, uAmbient, uVivid, uKeyInt, uCrack, uCrackScale;
      uniform float uBumpScale, uBumpAmp, uNormalMix, uVein, uVeinScale, uAlpha, uPulse, uTime, uNoiseScale;
      varying vec3 vWorld; varying vec3 vNrm; varying vec2 vUv; varying float vN;
      void main(){
        vec3 V = cameraPosition - vWorld;
        float dist = length(V);
        V /= max(dist, 1e-4);

        vec3 nrm = gl_FrontFacing ? vNrm : -vNrm;
      #ifdef HB_FACEVIEW
        if (dot(nrm, V) < 0.0) nrm = -nrm;
      #endif
        // niveau de détail : sous le pixel, le relief procédural n'est plus
        // que du bruit — on l'estompe au lieu de le faire scintiller.
        float texel = length(fwidth(vWorld));
        float lod = 1.0 - smoothstep(0.16 / max(uBumpScale, 1e-3), 0.75 / max(uBumpScale, 1e-3), texel);
        float lodG = 1.0 - smoothstep(0.30 / max(uNoiseScale, 1e-4), 1.6 / max(uNoiseScale, 1e-4), texel);
      #ifdef HB_FLAT
        vec3 N = nrm;
      #else
        vec3 gRaw = cross(dFdx(vWorld), dFdy(vWorld));
        vec3 gN = (dot(gRaw, gRaw) > 1e-12) ? normalize(gRaw) : nrm;
        gN *= (dot(gN, nrm) < 0.0) ? -1.0 : 1.0;
        vec3 N = normalize(mix(nrm, gN, uNormalMix * mix(0.35, 1.0, lodG)));
      #endif
      #ifdef HB_BUMP
        float e = 0.42;
        vec3 bp = vWorld * uBumpScale;
        float b0 = hbFbm2(bp);
        vec3 grad = vec3(hbFbm2(bp + vec3(e,0.0,0.0)) - b0,
                         hbFbm2(bp + vec3(0.0,e,0.0)) - b0,
                         hbFbm2(bp + vec3(0.0,0.0,e)) - b0);
        N = normalize(N - grad * uBumpAmp * lod);
      #endif

        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float atten = uLight / (1.0 + uFall * dist * dist);

        vec3 base = mix(uDeep, uMid, smoothstep(-0.8, 0.8, vN));
        base = mix(base, uHot, hbSat(vN * 1.5) * 0.5);
      #ifdef HB_VEIN
        float vein = smoothstep(0.58, 1.0, hbRidge(vWorld * uVeinScale));
        base = mix(base, uDeep * 0.4, vein * uVein);
      #endif

        if (uCrack > 0.0){
          float cw = max(0.09, texel * uCrackScale * 2.2);
          float cr = abs(hbFbm(vWorld * uCrackScale));
          base *= 1.0 - uCrack * (1.0 - smoothstep(0.0, cw, cr)) * (0.35 + 0.65 * lod);
        }

        vec3 col = base * (uAmbient + (1.0 - uAmbient) * ndv) * atten;
        if (uKeyInt > 0.0){
          float kd = clamp(dot(N, uKeyDir), 0.0, 1.0);
          vec3 half_ = normalize(uKeyDir + V);
          col += base * uKeyColor * kd * uKeyInt;
          col += uKeyColor * pow(clamp(dot(N, half_), 0.0, 1.0), uShiny * 1.6) * uWet * uKeyInt * 1.4;
        }
        float fres = pow(max(1.0 - ndv, 0.0), 3.2);
        col += uHot * fres * uRim * (0.3 + 0.7 * atten);
        col += vec3(1.0) * pow(ndv, uShiny) * uWet * atten * mix(0.2, 1.0, lod);
        col += uEmissive * (0.7 + 0.6 * uPulse);
        col = hbSaturate(col, uVivid);
        col = hbFog(col, dist);
        gl_FragColor = vec4(col, uAlpha);
      }`,
  });
  return m;
}

/* ═══════════════════════════════════════════════════════════
   MEMBRANE — coque translucide (alvéoles, cellules, capsules).
   ═══════════════════════════════════════════════════════════ */
export function membrane(o = {}) {
  return new THREE.ShaderMaterial({
    defines: o.centers ? { HB_CENTER: '' } : {},
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: o.depthWrite ?? false,
    blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: g({
      uInner:  { value: new THREE.Color(o.inner ?? 0x2b1b33) },
      uEdge:   { value: new THREE.Color(o.edge ?? 0xffd9e6) },
      uPower:  { value: o.power ?? 2.6 },
      uBase:   { value: o.base ?? 0.12 },
      uRimA:   { value: o.rimAlpha ?? 0.85 },
      uGlow:   { value: o.glow ?? 0.5 },
      uIrid:   { value: o.irid ?? 0.0 },
      uAlpha:  { value: o.alpha ?? 1.0 },
      uWobble: { value: o.wobble ?? 0.0 },
      uNoiseScale: { value: o.noiseScale ?? 0.2 },
      uBreathAmp:  { value: o.breathAmp ?? 0.0 },
    }),
    vertexShader: /* glsl */`
      ${NOISE}
      uniform float uTime, uWobble, uNoiseScale, uBreath, uBreathAmp, uPulse;
      #ifdef HB_CENTER
        attribute vec3 aCenter;
      #endif
      varying vec3 vWorld; varying vec3 vNrm; varying float vN;
      void main(){
        vec3 p = position;
        float n = hbNoise(p * uNoiseScale + vec3(0.0, 0.0, uTime * 0.25));
        vN = n;
      #ifdef HB_CENTER
        float ph = fract(dot(aCenter, vec3(0.017, 0.031, 0.011)));
        p = aCenter + (p - aCenter) * (1.0 + uBreath * uBreathAmp * (0.75 + 0.5 * ph));
        p += normal * (n * uWobble);
      #else
        p += normal * (n * uWobble + uBreath * uBreathAmp * 0.6);
      #endif
        vec4 wp = modelMatrix * vec4(p, 1.0);
        vWorld = wp.xyz;
        vNrm = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      ${UTIL}
      uniform vec3 uInner, uEdge, uFogColor;
      uniform float uPower, uBase, uRimA, uGlow, uIrid, uAlpha, uFogDensity, uVivid, uTime;
      varying vec3 vWorld; varying vec3 vNrm; varying float vN;
      void main(){
        vec3 V = cameraPosition - vWorld;
        float dist = length(V);
        V /= max(dist, 1e-4);
        vec3 N = gl_FrontFacing ? vNrm : -vNrm;
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float fres = pow(max(1.0 - ndv, 0.0), uPower);
        vec3 col = mix(uInner, uEdge, fres);
        col += uEdge * fres * uGlow;
        if (uIrid > 0.0){
          float t = fres * 5.0 + vN * 1.4 + uTime * 0.12;
          col *= 1.0 + uIrid * vec3(sin(t), sin(t + 2.09), sin(t + 4.19));
        }
        col = hbSaturate(col, uVivid);
        float a = uAlpha * (uBase + fres * uRimA);
        a *= exp(-uFogDensity * uFogDensity * dist * dist * 0.75);
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
      }`,
  });
}

/* ═══════════ HALO / ÉMISSION — additif, sert de source lumineuse ═══════════ */
export function glow(o = {}) {
  return new THREE.ShaderMaterial({
    side: o.side ?? THREE.FrontSide,
    transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: g({
      uColor:  { value: new THREE.Color(o.color ?? 0x62dbe4) },
      uPower:  { value: o.power ?? 2.2 },
      uCore:   { value: o.core ?? 0.35 },
      uInt:    { value: o.intensity ?? 1.0 },
      uPulseAmp: { value: o.pulseAmp ?? 0.0 },
      uFlicker:  { value: o.flicker ?? 0.0 },
    }),
    vertexShader: /* glsl */`
      varying vec3 vWorld; varying vec3 vNrm;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz; vNrm = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      ${UTIL}
      uniform vec3 uColor; uniform float uPower, uCore, uInt, uTime, uPulse, uPulseAmp, uFlicker, uFogDensity;
      varying vec3 vWorld; varying vec3 vNrm;
      void main(){
        vec3 V = normalize(cameraPosition - vWorld);
        float d = length(cameraPosition - vWorld);
        vec3 N = gl_FrontFacing ? vNrm : -vNrm;
        float ndv = clamp(abs(dot(N, V)), 0.0, 1.0);
        float f = pow(max(1.0 - ndv, 0.0), uPower) + uCore;
        float fl = 1.0 + uFlicker * (sin(uTime * 7.3) * 0.5 + sin(uTime * 11.7) * 0.5);
        float a = f * uInt * fl * (1.0 + uPulse * uPulseAmp);
        a *= exp(-uFogDensity * uFogDensity * d * d * 0.5);
        gl_FragColor = vec4(uColor * a, a);
      }`,
  });
}

/* ═══════════ VOÛTE — arrière-plan dégradé d'une cavité ═══════════ */
export function voidDome(o = {}) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: g({
      uTop:    { value: new THREE.Color(o.top ?? 0x1a0308) },
      uBottom: { value: new THREE.Color(o.bottom ?? 0x05010a) },
      uCloud:  { value: new THREE.Color(o.cloud ?? 0x51101d) },
      uAmt:    { value: o.clouds ?? 0.35 },
      uScale:  { value: o.scale ?? 0.9 },
    }),
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main(){
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */`
      ${NOISE}${UTIL}
      uniform vec3 uTop, uBottom, uCloud; uniform float uAmt, uScale, uTime, uVivid;
      varying vec3 vDir;
      void main(){
        float h = clamp(vDir.y * 0.5 + 0.5, 0.0, 1.0);
        vec3 col = mix(uBottom, uTop, pow(h, 0.85));
        float n = hbFbm(vDir * uScale * 3.0 + vec3(0.0, uTime * 0.012, 0.0));
        col = mix(col, uCloud, hbSat(n * 0.5 + 0.5) * uAmt);
        col = hbSaturate(col, uVivid);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

/* ═══════════════════════════════════════════════════════════
   PARTICULES EN FLUX — suivent le conduit analytique.
   ═══════════════════════════════════════════════════════════ */
export function flowPoints(channel, o = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: o.additive === false ? THREE.NormalBlending : THREE.AdditiveBlending,
    uniforms: g(Object.assign({}, channel.uniforms, {
      uColorA: { value: new THREE.Color(o.colorA ?? 0xff8090) },
      uColorB: { value: new THREE.Color(o.colorB ?? 0xffd9c0) },
      uZ0:     { value: o.z0 ?? 0 },
      uZ1:     { value: o.z1 ?? 100 },
      uRadius: { value: o.radius ?? 9 },
      uSpeed:  { value: o.speed ?? 0.03 },
      uSwirl:  { value: o.swirl ?? 0.1 },
      uSize:   { value: o.size ?? 12 },
      uSoft:   { value: o.soft ?? 1.6 },
      uInt:    { value: o.intensity ?? 1.0 },
      uMaxPx:  { value: o.maxPx ?? 44 },
      uNear:   { value: o.near ?? 22 },
      uPulseAmp: { value: o.pulseAmp ?? 0.4 },
    })),
    vertexShader: /* glsl */`
      ${CURVE}
      attribute float aU, aRad, aAng, aSize, aSeed;
      uniform float uTime, uPulse, uZ0, uZ1, uRadius, uSpeed, uSwirl, uSize, uPx, uPulseAmp, uMaxPx;
      varying float vFade; varying float vSeed; varying float vDist;
      void main(){
        float sp = uSpeed * (0.6 + 0.8 * aSeed) * (1.0 + uPulse * uPulseAmp);
        float u = fract(aU + uTime * sp);
        float z = mix(uZ0, uZ1, u);
        vec3 T, N, B; hbFrame(z, T, N, B);
        vec3 c = hbCenter(z);
        float ang = aAng + uTime * uSwirl * (0.4 + aSeed);
        vec3 p = c + (N * cos(ang) + B * sin(ang)) * (aRad * uRadius);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vDist = -mv.z;
        vFade = smoothstep(0.0, 0.05, u) * (1.0 - smoothstep(0.93, 1.0, u));
        vSeed = aSeed;
        gl_PointSize = min(uSize * aSize * uPx / max(vDist, 1.0), uMaxPx);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      ${UTIL}
      uniform vec3 uColorA, uColorB; uniform float uSoft, uInt, uFogDensity, uVivid, uNear;
      varying float vFade; varying float vSeed; varying float vDist;
      void main(){
        vec2 d = gl_PointCoord - 0.5;
        float r2 = dot(d, d);
        if (r2 > 0.25) discard;
        float a = pow(smoothstep(0.25, 0.0, r2), uSoft);
        vec3 col = mix(uColorA, uColorB, vSeed);
        col += col * pow(a, 5.0) * 1.2;
        col = hbSaturate(col, uVivid);
        float f = exp(-uFogDensity * uFogDensity * vDist * vDist * 0.8);
        f *= smoothstep(uNear * 0.22, uNear, vDist);
        gl_FragColor = vec4(col, a * vFade * uInt * f);
      }`,
  });
}

/* Attributs pour un système en flux. */
export function flowAttributes(count, rnd, o = {}) {
  const aU = new Float32Array(count), aRad = new Float32Array(count),
        aAng = new Float32Array(count), aSize = new Float32Array(count),
        aSeed = new Float32Array(count), aSpin = new Float32Array(count);
  const bias = o.radiusBias ?? 0.5;
  for (let i = 0; i < count; i++) {
    aU[i] = rnd();
    aRad[i] = Math.pow(rnd(), bias);
    aAng[i] = rnd() * Math.PI * 2;
    aSize[i] = (o.sizeMin ?? 0.5) + rnd() * ((o.sizeMax ?? 1.4) - (o.sizeMin ?? 0.5));
    aSeed[i] = rnd();
    aSpin[i] = (rnd() - 0.5) * (o.spin ?? 1.4);
  }
  return { aU, aRad, aAng, aSize, aSeed, aSpin };
}

/* ═══════════ CELLULES EN FLUX — maillages instanciés dans le conduit ═══════════ */
export function flowCells(channel, o = {}) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: g(Object.assign({}, channel.uniforms, {
      uDeep:   { value: new THREE.Color(o.deep ?? 0x5e0a14) },
      uMid:    { value: new THREE.Color(o.mid ?? 0xd23a44) },
      uHot:    { value: new THREE.Color(o.hot ?? 0xff9d92) },
      uZ0:     { value: o.z0 ?? 0 },
      uZ1:     { value: o.z1 ?? 100 },
      uRadius: { value: o.radius ?? 9 },
      uSpeed:  { value: o.speed ?? 0.03 },
      uSwirl:  { value: o.swirl ?? 0.08 },
      uWobble: { value: o.wobble ?? 0.5 },
      uSpinRate: { value: o.spinRate ?? 0.5 },
      uFall:   { value: o.falloff ?? 0.002 },
      uRim:    { value: o.rim ?? 0.8 },
      uWet:    { value: o.wet ?? 0.5 },
      uAmbient:{ value: o.ambient ?? 0.25 },
      uClear:  { value: o.clear ?? 16 },
      uPulseAmp: { value: o.pulseAmp ?? 0.5 },
    })),
    vertexShader: /* glsl */`
      ${CURVE}${ROT}
      attribute float aU, aRad, aAng, aSize, aSeed, aSpin;
      uniform float uTime, uPulse, uZ0, uZ1, uRadius, uSpeed, uSwirl, uWobble, uSpinRate, uPulseAmp, uClear;
      varying vec3 vWorld; varying vec3 vNrm; varying float vSeed; varying float vFade;
      void main(){
        float sp = uSpeed * (0.72 + 0.55 * aSeed) * (1.0 + uPulse * uPulseAmp);
        float u = fract(aU + uTime * sp);
        float z = mix(uZ0, uZ1, u);
        vec3 T, N, B; hbFrame(z, T, N, B);
        vec3 c = hbCenter(z);
        float ang = aAng + uTime * uSwirl * (0.5 + aSeed);
        vec3 base = c + (N * cos(ang) + B * sin(ang)) * (aRad * uRadius);
        base += N * sin(uTime * 1.5 + aSeed * 31.0) * uWobble
              + B * cos(uTime * 1.2 + aSeed * 17.0) * uWobble;
        mat3 frame = mat3(N, B, T);
        mat3 spin = hbRotAxis(normalize(vec3(0.35 + aSeed, 1.0, 0.6 - aSeed)),
                              uTime * aSpin * uSpinRate + aSeed * 6.283);
        // une cellule qui traverserait l'objectif se rétracte au lieu de
        // remplir l'écran : c'est la distance de dégagement de la sonde.
        vec3 wc = (modelMatrix * vec4(base, 1.0)).xyz;
        float clear = smoothstep(uClear * 0.45, uClear, distance(wc, cameraPosition));
        vec3 lp = spin * (position * aSize * clear);
        vec4 wp = modelMatrix * vec4(base + frame * lp, 1.0);
        vWorld = wp.xyz;
        vNrm = normalize(mat3(modelMatrix) * (frame * (spin * normal)));
        vSeed = aSeed;
        vFade = smoothstep(0.0, 0.05, u) * (1.0 - smoothstep(0.94, 1.0, u)) * clear;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      ${UTIL}${FOG}
      uniform vec3 uDeep, uMid, uHot;
      uniform float uFall, uRim, uWet, uAmbient, uVivid;
      varying vec3 vWorld; varying vec3 vNrm; varying float vSeed; varying float vFade;
      void main(){
        vec3 V = cameraPosition - vWorld;
        float dist = length(V);
        V /= max(dist, 1e-4);
        vec3 N = gl_FrontFacing ? vNrm : -vNrm;
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float atten = 1.0 / (1.0 + uFall * dist * dist);
        vec3 base = mix(uDeep, uMid, 0.35 + 0.65 * vSeed);
        vec3 col = base * (uAmbient + (1.0 - uAmbient) * ndv) * atten;
        float fres = pow(max(1.0 - ndv, 0.0), 2.6);
        col += uHot * fres * uRim * atten;
        col += vec3(1.0) * pow(ndv, 30.0) * uWet * atten;
        col = hbSaturate(col, uVivid);
        col = hbFog(col, dist);
        col = mix(uFogColor, col, vFade);
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
}

/* ═══════════ DÉRIVE — objets flottant librement dans un volume ═══════════ */
export function driftCells(o = {}) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: !!o.transparent,
    uniforms: g({
      uDeep:  { value: new THREE.Color(o.deep ?? 0x341027) },
      uMid:   { value: new THREE.Color(o.mid ?? 0xb0567a) },
      uHot:   { value: new THREE.Color(o.hot ?? 0xffc0d0) },
      uDrift: { value: o.drift ?? 3.0 },
      uRate:  { value: o.rate ?? 0.12 },
      uSpinRate: { value: o.spinRate ?? 0.3 },
      uFall:  { value: o.falloff ?? 0.0018 },
      uRim:   { value: o.rim ?? 0.7 },
      uWet:   { value: o.wet ?? 0.4 },
      uAmbient: { value: o.ambient ?? 0.25 },
      uEmissive: { value: new THREE.Color(o.emissive ?? 0x000000) },
      uAlpha: { value: o.alpha ?? 1.0 },
      uClear: { value: o.clear ?? 26 },
    }),
    vertexShader: /* glsl */`
      ${NOISE}${ROT}
      attribute vec3 aPos; attribute float aSize, aSeed, aSpin;
      uniform float uTime, uDrift, uRate, uSpinRate, uClear;
      varying vec3 vWorld; varying vec3 vNrm; varying float vSeed;
      void main(){
        vec3 q = aPos * 0.05 + vec3(uTime * uRate);
        vec3 off = vec3(hbNoise(q), hbNoise(q + 13.7), hbNoise(q + 27.3)) * uDrift;
        mat3 spin = hbRotAxis(normalize(vec3(0.3 + aSeed, 0.8, 0.5 - aSeed)),
                              uTime * aSpin * uSpinRate + aSeed * 6.283);
        vec3 wc = (modelMatrix * vec4(aPos + off, 1.0)).xyz;
        float clear = smoothstep(uClear * 0.45, uClear, distance(wc, cameraPosition));
        vec4 wp = modelMatrix * vec4(aPos + off + spin * (position * aSize * clear), 1.0);
        vWorld = wp.xyz;
        vNrm = normalize(mat3(modelMatrix) * (spin * normal));
        vSeed = aSeed;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      ${UTIL}${FOG}
      uniform vec3 uDeep, uMid, uHot, uEmissive;
      uniform float uFall, uRim, uWet, uAmbient, uVivid, uAlpha, uPulse;
      varying vec3 vWorld; varying vec3 vNrm; varying float vSeed;
      void main(){
        vec3 V = cameraPosition - vWorld;
        float dist = length(V);
        V /= max(dist, 1e-4);
        vec3 N = gl_FrontFacing ? vNrm : -vNrm;
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float atten = 1.0 / (1.0 + uFall * dist * dist);
        vec3 base = mix(uDeep, uMid, 0.3 + 0.7 * vSeed);
        vec3 col = base * (uAmbient + (1.0 - uAmbient) * ndv) * atten;
        col += uHot * pow(max(1.0 - ndv, 0.0), 2.4) * uRim * atten;
        col += vec3(1.0) * pow(ndv, 26.0) * uWet * atten;
        col += uEmissive * (0.7 + 0.5 * uPulse);
        col = hbSaturate(col, uVivid);
        col = hbFog(col, dist);
        gl_FragColor = vec4(col, uAlpha);
      }`,
  });
}

/* ═══════════════════════════════════════════════════════════
   CHAMP DE TIGES — villosités, cils, podocytes, épines.
   Géométrie source : un fuseau normalisé de 0 à 1 en Y.
   ═══════════════════════════════════════════════════════════ */
export function stalkField(o = {}) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: !!o.transparent,
    uniforms: g({
      uRoot:   { value: new THREE.Color(o.root ?? 0x6d1f14) },
      uTip:    { value: new THREE.Color(o.tip ?? 0xffb98a) },
      uHot:    { value: new THREE.Color(o.hot ?? 0xffd9b0) },
      uSway:   { value: o.sway ?? 0.28 },
      uRate:   { value: o.rate ?? 1.1 },
      uRim:    { value: o.rim ?? 0.8 },
      uWet:    { value: o.wet ?? 0.4 },
      uAmbient:{ value: o.ambient ?? 0.22 },
      uFall:   { value: o.falloff ?? 0.0022 },
      uGlowTip:{ value: o.tipGlow ?? 0.4 },
      uAlpha:  { value: o.alpha ?? 1.0 },
      uPulseAmp: { value: o.pulseAmp ?? 0.0 },
    }),
    vertexShader: /* glsl */`
      ${NOISE}
      attribute vec3 aPos; attribute vec3 aDir; attribute vec2 aScale; attribute float aSeed;
      uniform float uTime, uSway, uRate, uPulse, uPulseAmp;
      varying vec3 vWorld; varying vec3 vNrm; varying float vY; varying float vSeed;
      mat3 hbAlign(vec3 d){
        vec3 up = abs(d.y) > 0.985 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
        vec3 x = normalize(cross(up, d));
        vec3 z = cross(d, x);
        return mat3(x, d, z);
      }
      void main(){
        float y = clamp(position.y, 0.0, 1.0);
        vY = y; vSeed = aSeed;
        vec3 lp = vec3(position.x * aScale.x, y * aScale.y, position.z * aScale.x);
        float ph = aSeed * 41.0 + dot(aPos, vec3(0.05, 0.037, 0.061));
        float w = pow(y, 1.7) * uSway * aScale.y * (1.0 + uPulse * uPulseAmp);
        lp.x += sin(uTime * uRate + ph) * w;
        lp.z += cos(uTime * uRate * 0.83 + ph * 1.3) * w;
        mat3 R = hbAlign(normalize(aDir));
        vec3 wp3 = aPos + R * lp;
        vec4 wp = modelMatrix * vec4(wp3, 1.0);
        vWorld = wp.xyz;
        vNrm = normalize(mat3(modelMatrix) * (R * normal));
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      ${UTIL}${FOG}
      uniform vec3 uRoot, uTip, uHot;
      uniform float uRim, uWet, uAmbient, uFall, uGlowTip, uAlpha, uVivid;
      varying vec3 vWorld; varying vec3 vNrm; varying float vY; varying float vSeed;
      void main(){
        vec3 V = cameraPosition - vWorld;
        float dist = length(V);
        V /= max(dist, 1e-4);
        vec3 N = gl_FrontFacing ? vNrm : -vNrm;
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float atten = 1.0 / (1.0 + uFall * dist * dist);
        vec3 base = mix(uRoot, uTip, pow(vY, 0.8) * (0.75 + 0.5 * vSeed));
        vec3 col = base * (uAmbient + (1.0 - uAmbient) * ndv) * atten;
        col += uHot * pow(max(1.0 - ndv, 0.0), 2.6) * uRim * atten;
        col += vec3(1.0) * pow(ndv, 24.0) * uWet * atten;
        col += uTip * pow(vY, 6.0) * uGlowTip;
        col = hbSaturate(col, uVivid);
        col = hbFog(col, dist);
        gl_FragColor = vec4(col, uAlpha);
      }`,
  });
}

/* Fuseau normalisé (base en y=0, pointe en y=1) pour stalkField. */
export function spindle(radial = 7, rings = 6) {
  const geo = new THREE.CylinderGeometry(0.26, 0.44, 1, radial, rings, false);
  geo.translate(0, 0.5, 0);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const k = Math.sin(Math.min(1, y) * Math.PI * 0.62);      // profil arrondi
    p.setX(i, p.getX(i) * (1.02 - 0.42 * k * k));
    p.setZ(i, p.getZ(i) * (1.02 - 0.42 * k * k));
  }
  geo.computeVertexNormals();
  return geo;
}

/* ═══════════ POUSSIÈRES — points flottants, repères de profondeur ═══════════ */
export function motes(o = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: g({
      uColorA: { value: new THREE.Color(o.colorA ?? 0xffd7c0) },
      uColorB: { value: new THREE.Color(o.colorB ?? 0x8fd8ff) },
      uSize:   { value: o.size ?? 5 },
      uDrift:  { value: o.drift ?? 4 },
      uRate:   { value: o.rate ?? 0.08 },
      uInt:    { value: o.intensity ?? 0.7 },
      uSoft:   { value: o.soft ?? 1.5 },
      uTwinkle:{ value: o.twinkle ?? 0.5 },
      uMaxPx:  { value: o.maxPx ?? 40 },
      uNear:   { value: o.near ?? 26 },
      uRise:   { value: o.rise ?? 0.0 },
      uSpanY:  { value: o.spanY ?? 1000.0 },
    }),
    vertexShader: /* glsl */`
      ${NOISE}
      attribute float aSize, aSeed;
      uniform float uTime, uSize, uDrift, uRate, uPx, uRise, uSpanY, uMaxPx;
      varying float vSeed; varying float vDist;
      void main(){
        vec3 base = position;
        if (uRise != 0.0){
          base.y = mod(base.y + uTime * uRise * (0.6 + aSeed) + uSpanY * 0.5, uSpanY) - uSpanY * 0.5;
        }
        vec3 q = base * 0.04 + vec3(uTime * uRate);
        vec3 off = vec3(hbNoise(q), hbNoise(q + 9.1), hbNoise(q + 21.5)) * uDrift;
        vec4 mv = modelViewMatrix * vec4(base + off, 1.0);
        vDist = -mv.z;
        vSeed = aSeed;
        gl_PointSize = min(uSize * aSize * uPx / max(vDist, 1.0), uMaxPx);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      ${UTIL}
      uniform vec3 uColorA, uColorB; uniform float uInt, uSoft, uTwinkle, uTime, uFogDensity, uVivid, uNear;
      varying float vSeed; varying float vDist;
      void main(){
        vec2 d = gl_PointCoord - 0.5;
        float r2 = dot(d, d);
        if (r2 > 0.25) discard;
        float a = pow(smoothstep(0.25, 0.0, r2), uSoft);
        float tw = 1.0 - uTwinkle * 0.5 * (1.0 + sin(uTime * (1.2 + vSeed * 3.0) + vSeed * 40.0));
        vec3 col = hbSaturate(mix(uColorA, uColorB, vSeed), uVivid);
        float f = exp(-uFogDensity * uFogDensity * vDist * vDist * 0.6);
        f *= smoothstep(uNear * 0.25, uNear, vDist);
        gl_FragColor = vec4(col, a * uInt * tw * f);
      }`,
  });
}

/* ═══════════ IMPULSION — dégradé le long d'un tube (axones, nerfs) ═══════════ */
export function pulseStrand(o = {}) {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide, transparent: true, depthWrite: o.depthWrite ?? true,
    blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: g({
      uBase:   { value: new THREE.Color(o.base ?? 0x3a2a55) },
      uSpark:  { value: new THREE.Color(o.spark ?? 0x9fe6ff) },
      uSpeed:  { value: o.speed ?? 0.35 },
      uWidth:  { value: o.width ?? 0.06 },
      uDensity:{ value: o.density ?? 2.5 },
      uRim:    { value: o.rim ?? 0.6 },
      uInt:    { value: o.intensity ?? 1.0 },
      uAlpha:  { value: o.alpha ?? 1.0 },
      uFall:   { value: o.falloff ?? 0.0015 },
    }),
    vertexShader: /* glsl */`
      varying vec3 vWorld; varying vec3 vNrm; varying vec2 vUv;
      void main(){
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz; vNrm = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */`
      ${UTIL}${FOG}
      uniform vec3 uBase, uSpark;
      uniform float uSpeed, uWidth, uDensity, uRim, uInt, uAlpha, uTime, uFall, uVivid;
      varying vec3 vWorld; varying vec3 vNrm; varying vec2 vUv;
      void main(){
        vec3 V = cameraPosition - vWorld;
        float dist = length(V);
        V /= max(dist, 1e-4);
        vec3 N = gl_FrontFacing ? vNrm : -vNrm;
        float ndv = clamp(dot(N, V), 0.0, 1.0);
        float atten = 1.0 / (1.0 + uFall * dist * dist);
        float t = fract(vUv.x * uDensity - uTime * uSpeed);
        float spark = smoothstep(uWidth, 0.0, abs(t - 0.5) - 0.5 + uWidth) ;
        spark = pow(hbSat(1.0 - abs(t - 0.5) / max(uWidth, 1e-3)), 2.0);
        vec3 col = uBase * (0.35 + 0.65 * ndv) * atten;
        col += uSpark * spark * uInt;
        col += uSpark * pow(max(1.0 - ndv, 0.0), 2.6) * uRim * atten;
        col = hbSaturate(col, uVivid);
        col = hbFog(col, dist);
        gl_FragColor = vec4(col, uAlpha);
      }`,
  });
}

/* Construit une géométrie instanciée à partir d'une géométrie source. */
export function instanced(geo, count, attrs) {
  const g2 = new THREE.InstancedBufferGeometry();
  g2.index = geo.index;
  for (const k in geo.attributes) g2.setAttribute(k, geo.attributes[k]);
  for (const k in attrs) {
    const a = attrs[k];
    g2.setAttribute(k, new THREE.InstancedBufferAttribute(a.array ?? a, a.size ?? 1));
  }
  g2.instanceCount = count;
  g2.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
  return g2;
}

/* Nuage de points prêt à l'emploi. */
export function moteField(count, spread, o = {}, seed = 5) {
  const rnd = (() => { let a = seed >>> 0; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })();
  const pos = new Float32Array(count * 3), size = new Float32Array(count), sd = new Float32Array(count);
  const shape = o.shape ?? 'box';
  for (let i = 0; i < count; i++) {
    if (shape === 'sphere') {
      const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = spread * Math.cbrt(rnd());
      const s = Math.sqrt(1 - u * u);
      pos[i * 3] = r * s * Math.cos(a); pos[i * 3 + 1] = r * u; pos[i * 3 + 2] = r * s * Math.sin(a);
    } else {
      pos[i * 3] = (rnd() - 0.5) * spread;
      pos[i * 3 + 1] = (rnd() - 0.5) * (o.spreadY ?? spread);
      pos[i * 3 + 2] = (rnd() - 0.5) * (o.spreadZ ?? spread);
    }
    size[i] = 0.35 + rnd() * 0.9;
    sd[i] = rnd();
  }
  const g2 = new THREE.BufferGeometry();
  g2.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g2.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  g2.setAttribute('aSeed', new THREE.BufferAttribute(sd, 1));
  g2.boundingSphere = new THREE.Sphere(new THREE.Vector3(), spread * 1.5);
  const p = new THREE.Points(g2, motes(o));
  p.frustumCulled = false;
  return p;
}
