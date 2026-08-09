/**
 * Fabrique une version « un seul fichier » du voyage.
 *   node build.mjs        →  dist/interieur.html   (autonome, ouvrable tel quel)
 * Tout est embarqué : three.js, les shaders, le contenu, la feuille de style.
 */
import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'dist');

const result = await build({
  entryPoints: [join(ROOT, 'src/main.js')],
  bundle: true,
  format: 'esm',
  minify: true,
  legalComments: 'none',
  target: ['chrome110', 'firefox110', 'safari16'],
  write: false,
  alias: {
    three: join(ROOT, 'vendor/three/three.module.js'),
  },
  plugins: [{
    name: 'three-addons',
    setup(b) {
      b.onResolve({ filter: /^three\/addons\// }, (args) => ({
        path: join(ROOT, 'vendor/three/addons', args.path.replace('three/addons/', '')),
      }));
    },
  }],
});

const js = result.outputFiles[0].text;
const css = await readFile(join(ROOT, 'styles.css'), 'utf8');
const html = await readFile(join(ROOT, 'index.html'), 'utf8');

// on ne garde que le contenu du <body>, sans les scripts de la version modulaire
const body = html
  .slice(html.indexOf('<body'), html.indexOf('</body>'))
  .replace(/^<body[^>]*>/, '')
  .replace(/<script type="module"[\s\S]*?<\/script>/g, '')
  .trim();

const page = `<title>INTÉRIEUR — Voyage dans le corps humain</title>
<meta name="description" content="Une visite guidée en 3D de l'intérieur du corps humain, en version enfant et en version adulte." />
<style>
${css}
/* la page est injectée dans un hôte : on force le fond et l'attribut d'âge */
:root, html, body { background: #07060a; }
</style>
${body}
<script type="module">
document.body.dataset.age = document.body.dataset.age || 'adulte';
${js}
</script>
`;

await mkdir(OUT, { recursive: true });
await writeFile(join(OUT, 'interieur.html'), page);
console.log(`dist/interieur.html — ${(page.length / 1024 / 1024).toFixed(2)} Mo`);
