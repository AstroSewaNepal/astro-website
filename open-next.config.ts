import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import kvIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache';
import memoryQueue from '@opennextjs/cloudflare/overrides/queue/memory-queue';

// ISR pages (blog, puja-bidhi) and cached fetches live in KV (free plan, no card needed). The site only uses
// time-based revalidation, so no tag cache; the memory queue refreshes stale pages through WORKER_SELF_REFERENCE.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: memoryQueue,
});
