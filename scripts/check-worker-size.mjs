// Checks the built Worker (after cf:build) against the Workers Free size limit: 3 MB gzipped.
// Warns from 90% so there is time to trim before deploys start failing.
// Usage: node scripts/check-worker-size.mjs [--env test]
import { execSync } from 'node:child_process';

const LIMIT_KIB = 3072;
const WARN_KIB = Math.round(LIMIT_KIB * 0.9);
const args = process.argv.slice(2).join(' ');

const out = execSync(`npx wrangler deploy --dry-run ${args}`, {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
});
const match = out.match(/gzip:\s*([\d.]+)\s*KiB/);
if (!match) {
  console.error(out);
  throw new Error('Could not read the gzip size from wrangler output.');
}
const kib = Number(match[1]);
const summary = `Worker size ${kib.toFixed(0)} KiB gzip (free plan limit ${LIMIT_KIB} KiB)`;
const ci = Boolean(process.env.GITHUB_ACTIONS);

if (kib >= LIMIT_KIB) {
  console.error(ci ? `::error::${summary}` : summary);
  process.exit(1);
} else if (kib >= WARN_KIB) {
  console.warn(ci ? `::warning::${summary}, over 90%` : `${summary}, over 90%`);
} else {
  console.log(summary);
}
