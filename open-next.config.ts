import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// No cache for now: Workers Free allows only 1,000 KV writes a day, and every deploy (prerendered pages) and
// every ISR / fetch-cache refresh is a write, so the KV cache ran out on day one. Without a cache each request
// renders fresh, which is fine for the low-traffic test site.
// TODO(www move, Workers Paid): switch back to KV (1M writes/month), the binding is already in wrangler.jsonc:
//   import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
//   import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';
//   defineCloudflareConfig({ incrementalCache: kvIncrementalCache, queue: memoryQueue });
export default defineCloudflareConfig({
  incrementalCache: 'dummy',
  queue: 'dummy',
});
