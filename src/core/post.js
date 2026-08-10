import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* Étalonnage final : hublot, aberration, vignetage, grain, flash cardiaque. */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uRes:   { value: new THREE.Vector2(1, 1) },
    uTime:  { value: 0 },
    uVig:   { value: 0.55 },
    uGrain: { value: 0.035 },
    uAber:  { value: 0.0026 },
    uWarp:  { value: 0.055 },
    uPulse: { value: 0 },
    uFlash: { value: 0.05 },
    uTint:  { value: new THREE.Color(1, 1, 1) },
    uLift:  { value: new THREE.Color(0, 0, 0) },
    uContrast: { value: 1.04 },
    uFade:  { value: 0 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform vec2 uRes; uniform vec3 uTint, uLift;
    uniform float uTime, uVig, uGrain, uAber, uWarp, uPulse, uFlash, uContrast, uFade;
    varying vec2 vUv;
    void main(){
      vec2 c = vUv - 0.5;
      float r2 = dot(c, c);
      vec2 uv = clamp(0.5 + c * (1.0 + uWarp * r2), vec2(0.0011), vec2(0.9989));
      float amt = uAber * (0.2 + r2 * 2.2);
      vec3 col;
      col.r = texture2D(tDiffuse, uv + c * amt).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - c * amt).b;

      col += uFlash * uPulse * vec3(0.6, 0.14, 0.18) * (0.35 + r2);
      col = (col - 0.5) * uContrast + 0.5;
      col = col * uTint + uLift;
      col *= 1.0 - uVig * smoothstep(0.12, 0.92, r2);

      float g = fract(sin(dot(uv * uRes + fract(uTime) * 137.0, vec2(12.9898, 78.233))) * 43758.5453);
      col += (g - 0.5) * uGrain;

      col = mix(col, vec3(0.0), uFade);
      // garde-fou : une valeur non finie isolée serait étalée par le bloom
      col = mix(vec3(0.0), col, vec3(greaterThanEqual(col, vec3(0.0))));
      gl_FragColor = vec4(clamp(col, 0.0, 8.0), 1.0);
    }`,
};

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: false, alpha: false, powerPreference: 'high-performance',
    stencil: false, depth: true,
    preserveDrawingBuffer: new URLSearchParams(location.search).has('debug'),
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 1);
  return renderer;
}

export function createComposer(renderer, scene, camera) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const target = new THREE.WebGLRenderTarget(size.x, size.y, {
    type: THREE.HalfFloatType,
    samples: 4,                       // MSAA matériel (WebGL2)
    colorSpace: THREE.LinearSRGBColorSpace,
  });
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(renderer.getPixelRatio());

  const renderPass = new RenderPass(scene, camera);
  // Seuil haut et noyau large : sous ce réglage, seules les vraies sources
  // lumineuses fleurissent. Un éclat d'un pixel se retrouvait sinon étalé par
  // l'agrandissement bilinéaire des niveaux grossiers — en carré net.
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.62, 0.92, 0.85);
  bloom.materialHighPassFilter.fragmentShader =
    bloom.materialHighPassFilter.fragmentShader.replace(
      'gl_FragColor = mix( outputColor, texel, alpha );',
      'gl_FragColor = min( mix( outputColor, texel, alpha ), vec4( 1.2 ) );');
  const output = new OutputPass();
  const grade = new ShaderPass(GradeShader);
  grade.renderToScreen = true;

  composer.addPass(renderPass);
  composer.addPass(bloom);
  composer.addPass(output);
  composer.addPass(grade);

  const resize = (w, h) => {
    composer.setSize(w, h);
    bloom.setSize(w, h);
    grade.uniforms.uRes.value.set(w, h);
  };
  resize(innerWidth, innerHeight);

  return { composer, bloom, grade, renderPass, resize, target };
}
