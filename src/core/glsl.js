/**
 * Fragments GLSL partagés par tous les matériaux du voyage.
 * Tout est préfixé `hb` (human body) pour ne jamais entrer en collision
 * avec les chunks injectés par three.js.
 */

/* Bruit simplex 3D (Ashima / webgl-noise, MIT) + fbm. */
export const NOISE = /* glsl */`
vec3 hbMod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 hbMod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 hbPermute(vec4 x){ return hbMod289(((x*34.0)+1.0)*x); }
vec4 hbTaylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float hbNoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = hbMod289(i);
  vec4 p = hbPermute(hbPermute(hbPermute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = hbTaylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float hbFbm(vec3 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++){ s += a * hbNoise(p); p *= 2.02; a *= 0.5; }
  return s;
}
float hbFbm2(vec3 p){
  return 0.6667 * hbNoise(p) + 0.3333 * hbNoise(p * 2.03);
}
float hbRidge(vec3 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++){ s += a * (1.0 - abs(hbNoise(p))); p *= 2.07; a *= 0.5; }
  return s;
}
`;

/**
 * Ligne médiane analytique d'un conduit (artère, bronche, intestin…).
 * La même formule existe côté JS (`channelCenter` dans build.js) : géométrie,
 * caméra et particules suivent donc rigoureusement la même courbe.
 *   uCurveA = vec4(ax1, fx1, ax2, fx2)
 *   uCurveB = vec4(ay1, fy1, ay2, fy2)
 *   uCurveP = vec4(px1, px2, py1, py2)
 */
export const CURVE = /* glsl */`
uniform vec4 uCurveA;
uniform vec4 uCurveB;
uniform vec4 uCurveP;

vec3 hbCenter(float z){
  return vec3(
    uCurveA.x * sin(uCurveA.y * z + uCurveP.x) + uCurveA.z * sin(uCurveA.w * z + uCurveP.y),
    uCurveB.x * cos(uCurveB.y * z + uCurveP.z) + uCurveB.z * sin(uCurveB.w * z + uCurveP.w),
    z);
}
vec3 hbTangent(float z){
  return normalize(vec3(
    uCurveA.x * uCurveA.y * cos(uCurveA.y * z + uCurveP.x) + uCurveA.z * uCurveA.w * cos(uCurveA.w * z + uCurveP.y),
    -uCurveB.x * uCurveB.y * sin(uCurveB.y * z + uCurveP.z) + uCurveB.z * uCurveB.w * cos(uCurveB.w * z + uCurveP.w),
    1.0));
}
void hbFrame(float z, out vec3 T, out vec3 N, out vec3 B){
  T = hbTangent(z);
  vec3 up = abs(T.y) > 0.92 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  N = normalize(cross(up, T));
  B = cross(T, N);
}
`;

/* Brouillard exponentiel + petit halo directionnel devant la sonde. */
export const FOG = /* glsl */`
uniform vec3  uFogColor;
uniform float uFogDensity;
vec3 hbFog(vec3 col, float dist){
  float f = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
  return mix(col, uFogColor, clamp(f, 0.0, 1.0));
}
`;

/**
 * BANC DE LUMIÈRES — partagé par toute la scène, réglé par escale.
 *
 * Jusqu'ici chaque matériau s'éclairait avec dot(N, V) : la lumière venait
 * donc toujours de la sonde, dans toutes les escales, ce qui donnait à tout
 * le voyage le même relief. Ici trois sources indépendantes de la caméra —
 * une clé, un complément, une ambiance ciel/sol — donnent à chaque organe
 * sa direction et sa couleur propres. La lampe frontale reste en plus,
 * gérée par chaque matériau (uLight / uFall).
 */
export const LIGHT = /* glsl */`
uniform vec3  uKeyDir, uKeyCol, uFillDir, uFillCol, uSkyCol, uGndCol;
uniform float uKeyInt, uFillInt, uSkyInt;
uniform float uLitKey, uLitFill, uLitSky;

/* Diffus enveloppant : la lumière déborde derrière le terminateur, comme
   dans un tissu translucide traversé par le sang. */
float hbWrap(float d, float w){ return clamp((d + w) / (1.0 + w), 0.0, 1.0); }

vec3 hbRig(vec3 alb, vec3 N, vec3 V, float ao, float wrap, float shiny, float wet){
  vec3 c = mix(uGndCol, uSkyCol, N.y * 0.5 + 0.5) * uSkyInt * uLitSky * ao * alb;

  vec3 kc = uKeyCol * (uKeyInt * uLitKey);
  c += alb * kc * hbWrap(dot(N, uKeyDir), wrap) * mix(0.5, 1.0, ao);
  c += kc * pow(max(dot(N, normalize(uKeyDir + V)), 0.0), shiny) * wet;

  vec3 fc = uFillCol * (uFillInt * uLitFill);
  c += alb * fc * hbWrap(dot(N, uFillDir), wrap * 1.5 + 0.2) * ao;
  return c;
}
`;

/**
 * PAVAGE CELLULAIRE — Voronoï jitteré sur les coordonnées de texture.
 * Renvoie x = proximité du joint (1 sur le joint, 0 au centre de la cellule)
 * et y = un aléa propre à la cellule, pour la teinter.
 *
 * C'est ce qui fait qu'un endothélium ressemble à un carrelage de cellules
 * allongées et une couche cornée à des dalles, au lieu d'une bouillie de
 * bruit. Le joint est adouci sous la taille du pixel : sans ça il se met à
 * grésiller dès qu'on s'éloigne.
 */
export const PAVE = /* glsl */`
vec2 hbCell2(vec2 p){
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}
vec2 hbPave(vec2 q, float soft, float round){
  vec2 g = floor(q), f = q - g;
  float d1 = 8.0, d2 = 8.0;
  vec2 best = g;
  for (int j = -1; j <= 1; j++){
    for (int i = -1; i <= 1; i++){
      vec2 o = vec2(float(i), float(j));
      vec2 c = o + mix(vec2(0.5), hbCell2(g + o), round);
      float d = length(c - f);
      if (d < d1){ d2 = d1; d1 = d; best = g + o; }
      else if (d < d2){ d2 = d; }
    }
  }
  float edge = d2 - d1;
  float w = max(soft, 0.0025);
  return vec2(1.0 - smoothstep(0.0, w, edge), hbCell2(best).x);
}
`;

/* Petites fonctions d'appoint. */
export const UTIL = /* glsl */`
float hbSat(float x){ return clamp(x, 0.0, 1.0); }
vec3  hbSat(vec3 x){ return clamp(x, 0.0, 1.0); }
float hbHash(float n){ return fract(sin(n) * 43758.5453123); }
vec3  hbHash3(float n){ return fract(sin(vec3(n, n + 1.7, n + 3.4)) * vec3(43758.5453, 22578.1459, 19642.3490)); }
mat2  hbRot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
vec3  hbSaturate(vec3 c, float amount){
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  return mix(vec3(l), c, amount);
}
`;
