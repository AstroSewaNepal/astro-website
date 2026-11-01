// One-off image optimizer for the Cloudflare move: the site serves its own images as plain static files
// (images.unoptimized), so each image must already be the size it is shown at.
//
// For every image imported from components/images, it picks a width (largest size the image is shown at,
// x2 for sharp screens, measured from the real pages), re-encodes it as WebP, and rewrites the imports.
//
// Usage (from the repo root, after `next build`):
//   node scripts/optimize-images.mjs <sizes.json>            report only
//   node scripts/optimize-images.mjs <sizes.json> --write    convert, delete the originals, update imports
//
// sizes.json: { "<built media file name>": { "maxCssWidth": number } }, as measured in the browser.
import { createHash } from 'node:crypto';
import {
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
  unlinkSync,
  existsSync,
} from 'node:fs';
import { join, dirname, basename, extname, resolve, relative, sep } from 'node:path';
import sharp from 'sharp';

const [sizesFile, flag] = process.argv.slice(2);
const WRITE = flag === '--write';
const ROOT = process.cwd();
const IMAGE_DIR = join(ROOT, 'components', 'images');
const MEDIA_DIR = join(ROOT, '.next', 'static', 'media');
const CODE_DIRS = ['app', 'components', 'lib', 'hooks', 'providers'];
const RASTER = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const QUALITY = 80;
const ALPHA_QUALITY = 80;
// Hand-tuned: the page background is a faint paper texture (about 25% opacity) on every page, so it can be
// small and soft (landing-page.module.css keeps its 1728px tile size); the sketch's pencil-stroke alpha is
// what makes it large.
const OVERRIDES = {
  'components/images/background.png': { width: 1000, quality: 60 },
  'components/images/lovecalculator.png': { alphaQuality: 60 },
};
// Images not seen on any measured page (admin, rare states) keep at most this width.
const UNMEASURED_MAX_WIDTH = 1200;
// Small files aren't worth a rename.
const MIN_SAVING_BYTES = 8 * 1024;

const walk = dir =>
  readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
const md5 = p => createHash('md5').update(readFileSync(p)).digest('hex');
const posix = p => p.split(sep).join('/');

// 1. Built media name -> source file, matched by identical bytes.
const sources = walk(IMAGE_DIR).filter(p => RASTER.has(extname(p).toLowerCase()));
const bySourceHash = new Map(sources.map(p => [md5(p), p]));
const widthBySource = new Map();
const measured = JSON.parse(readFileSync(sizesFile, 'utf8'));
for (const [key, { maxCssWidth }] of Object.entries(measured)) {
  const mediaName = key.replace(/ \(css\)$/, '');
  const built = join(MEDIA_DIR, mediaName);
  if (!existsSync(built)) continue;
  const src = bySourceHash.get(md5(built));
  if (src) widthBySource.set(src, Math.max(widthBySource.get(src) ?? 0, maxCssWidth));
}

// 2. Plan each conversion.
const plan = [];
for (const src of sources) {
  const meta = await sharp(src).metadata();
  const css = widthBySource.get(src);
  const override = OVERRIDES[posix(relative(ROOT, src))] ?? {};
  const target =
    override.width ??
    Math.min(meta.width, css ? Math.ceil((css * 2) / 10) * 10 : UNMEASURED_MAX_WIDTH);
  const out = await sharp(src)
    .resize({ width: target, withoutEnlargement: true })
    .webp({
      quality: override.quality ?? QUALITY,
      alphaQuality: override.alphaQuality ?? ALPHA_QUALITY,
    })
    .toBuffer();
  const before = statSync(src).size;
  plan.push({ src, meta, css, target, before, after: out.length, buffer: out });
}

let totalBefore = 0;
let totalAfter = 0;
const chosen = plan.filter(p => p.before - p.after >= MIN_SAVING_BYTES);
for (const p of plan.sort((a, b) => b.before - a.before)) {
  const take = chosen.includes(p);
  totalBefore += p.before;
  totalAfter += take ? p.after : p.before;
  console.log(
    `${take ? 'CONVERT' : 'keep   '} ${(p.before / 1024).toFixed(0).padStart(5)} KB -> ${(p.after / 1024).toFixed(0).padStart(4)} KB` +
      `  ${String(p.meta.width).padStart(4)}px -> ${String(p.target).padStart(4)}px  shown ${p.css ? p.css + 'px' : 'unmeasured'}` +
      `  ${posix(relative(ROOT, p.src))}`,
  );
}
console.log(
  `\n${chosen.length} of ${plan.length} images converted: ${(totalBefore / 1024).toFixed(0)} KB -> ${(totalAfter / 1024).toFixed(0)} KB`,
);
if (!WRITE) process.exit(0);

// 3. Write WebP files, delete originals, rewrite imports that resolve to a converted file.
const codeFiles = CODE_DIRS.filter(d => existsSync(d))
  .flatMap(d => walk(join(ROOT, d)))
  .filter(p => /\.(tsx?|jsx?|css)$/.test(p));
const renamed = new Map(); // absolute old path -> absolute new path
for (const p of chosen) {
  const target = join(dirname(p.src), basename(p.src, extname(p.src)) + '.webp');
  if (existsSync(target) && target !== p.src) throw new Error(`Refusing to overwrite ${target}`);
  writeFileSync(target, p.buffer);
  if (target !== p.src) unlinkSync(p.src);
  renamed.set(resolve(p.src), resolve(target));
}
const resolveRef = (file, ref) =>
  ref.startsWith('@/')
    ? resolve(ROOT, ref.slice(2))
    : ref.startsWith('.')
      ? resolve(dirname(file), ref)
      : null;
let edits = 0;
for (const file of codeFiles) {
  const text = readFileSync(file, 'utf8');
  const next = text.replace(
    /(['"(])((?:@\/|\.{1,2}\/)[^'"()]+\.(?:png|jpe?g|webp))(['")])/gi,
    (m, open, ref, close) => {
      const abs = resolveRef(file, ref);
      const to = abs && renamed.get(abs);
      if (!to) return m;
      edits++;
      return open + ref.slice(0, ref.length - extname(ref).length) + '.webp' + close;
    },
  );
  if (next !== text) writeFileSync(file, next);
}
console.log(`wrote ${renamed.size} files, rewrote ${edits} references`);
