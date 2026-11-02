// Fails when an image in components/images or public is over the limit. Images ship to every visitor as they are
// (images.unoptimized, for Cloudflare), so a new image must be resized first: node scripts/optimize-images.mjs
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const LIMIT_KB = 400;
const DIRS = ['components/images', 'public'];
const IMAGE = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif']);

const walk = dir =>
  readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const tooBig = DIRS.flatMap(walk)
  .filter(p => IMAGE.has(extname(p).toLowerCase()))
  .map(p => ({ p, kb: Math.round(statSync(p).size / 1024) }))
  .filter(({ kb }) => kb > LIMIT_KB);

for (const { p, kb } of tooBig) console.error(`${kb} KB  ${p}`);
if (tooBig.length) {
  console.error(
    `\n${tooBig.length} image(s) over ${LIMIT_KB} KB. Resize them first (see scripts/optimize-images.mjs).`,
  );
  process.exit(1);
}
console.log(`Images OK (all under ${LIMIT_KB} KB).`);
