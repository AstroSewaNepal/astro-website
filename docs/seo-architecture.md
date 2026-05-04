# SEO Architecture: Headless CMS, Canonical URLs, and Dynamic Sitemap

---

## 1. Headless CMS — What It Is and How It Works Here

### The concept

A traditional CMS (like WordPress) owns both the **content database** and the **frontend** (the HTML pages visitors see). A **headless CMS** only owns the content database. It exposes that content through an API and lets you build any frontend you want on top of it.

```
Traditional CMS           Headless CMS
┌─────────────────┐       ┌──────────────┐      ┌──────────────────┐
│  DB + Templates │       │  Ghost (DB)  │  API │  Next.js (UI)    │
│  → HTML page    │       │  + REST API  │ ───► │  → HTML page     │
└─────────────────┘       └──────────────┘      └──────────────────┘
```

**Ghost** is the headless CMS used here. It runs at `https://blog.dev.astrosewa.com` and stores all blog posts, authors, and tags. It has its own admin UI for writing content.

This Next.js repo is the **frontend only**. It never renders its own admin panel — it just calls Ghost's Content API and renders the data.

### How it works in this repo

**Step 1 — Environment variables tell Next.js where Ghost is:**

```
GHOST_CONTENT_API_URL     = https://blog.dev.astrosewa.com
GHOST_CONTENT_API_KEY     = <read-only public key from Ghost admin>
GHOST_CONTENT_API_VERSION = v5.0
```

These are set in Vercel (or `.env.local` locally). The key is read-only — it only lets you fetch public content, not modify anything.

**Step 2 — `lib/ghostClient.ts` initialises the SDK once:**

```
lib/ghostClient.ts  →  new GhostContentAPI({ url, key, version })
```

This singleton is imported wherever posts need to be fetched.

**Step 3 — Server components call Ghost at request time:**

| File | What it fetches from Ghost |
|---|---|
| `app/blogs/page.tsx` | All posts (title, slug, excerpt, feature_image, tags, authors) for the blog listing page |
| `app/blogs/[slug]/page.tsx` | One post's full HTML content, meta fields, OG fields, Twitter fields |
| `app/sitemap.ts` | All post slugs and `updated_at` timestamps for the sitemap |

Because these are **async React Server Components**, the fetch happens on the server — the browser never sees the Ghost API URL or key. The visitor only receives rendered HTML.

**Step 4 — Ghost content fields flow into the page:**

```
Ghost post fields
  ├── meta_title / meta_description  →  <title> and <meta name="description">
  ├── og_title / og_description / og_image  →  <meta property="og:...">
  ├── twitter_title / twitter_description / twitter_image  →  <meta name="twitter:...">
  └── html  →  rendered as the blog body via BlogContent component
```

If Ghost fields are empty, the Next.js `generateMetadata` function falls back gracefully (e.g. `post.meta_title ?? post.og_title ?? post.title`).

---

## 2. Canonical URLs — What They Are and Why They Matter

### The concept

A canonical URL tells search engines: *"this is the definitive version of this page."*

Without a canonical, if the same content is reachable at multiple URLs (e.g. `astrosewa.com/blogs/slug` and `www.astrosewa.com/blogs/slug` and `blog.dev.astrosewa.com/slug`), Google may treat them as duplicates and split ranking signals between them — hurting SEO.

The canonical tag looks like this in the rendered HTML:

```html
<link rel="canonical" href="https://www.astrosewa.com/blogs/vedic-astrology-guide" />
```

It is not a redirect — it is a hint to crawlers about which URL to index and rank.

### The Ghost double-URL problem

Because Ghost is publicly accessible, the same blog post exists at two URLs:

```
https://blog.dev.astrosewa.com/dasha-ending-signs-vedic/   ← Ghost renders this
https://www.astrosewa.com/blogs/dasha-ending-signs-vedic    ← Next.js renders this
```

Without action, Google sees duplicate content across two domains and splits ranking signals.

### How this is solved — two layers of defence

**Layer 1 — Ghost is told not to be indexed at all.**

In Ghost admin → Settings → Code Injection → Site Header:

```html
<meta name="robots" content="noindex, nofollow" />
```

This tells every crawler: do not index this page and do not follow links from it. Ghost is invisible to search engines. The Ghost site continues to work as an API source for Next.js — `noindex` only affects browser-based crawlers, not server-side API calls.

**Layer 2 — Next.js declares explicit self-referencing canonicals.**

`metadataBase` in `app/layout.tsx`:
```ts
metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.astrosewa.com')
```

Home page (`app/page.tsx`):
```ts
alternates: { canonical: 'https://www.astrosewa.com' }
```
Emits: `<link rel="canonical" href="https://www.astrosewa.com" />`

Blog detail page (`app/blogs/[slug]/page.tsx`):
```ts
alternates: { canonical: `https://www.astrosewa.com/blogs/${slug}` }
```
Emits: `<link rel="canonical" href="https://www.astrosewa.com/blogs/vedic-astrology-guide" />`

### The rule: one canonical domain everywhere

All of the following must use the exact same domain (`https://www.astrosewa.com`):

| Location | Setting |
|---|---|
| `app/layout.tsx` | `metadataBase` |
| `app/page.tsx` | `alternates.canonical` |
| `app/blogs/[slug]/page.tsx` | `alternates.canonical` |
| `app/sitemap.ts` | `BASE_URL` |

If any one of these uses `astrosewa.com` (no www) while others use `www.astrosewa.com`, Google may treat them as different origins.

---

## 3. Dynamic Sitemap — What It Is and How It Works Here

### The concept

A sitemap (`sitemap.xml`) is a file that lists every URL on the site, when each page was last updated, and how important it is. Without a sitemap Google discovers pages only by following links. With a sitemap, discovery is direct and fast.

A **dynamic sitemap** is generated programmatically — it includes URLs not known at code-write time, such as blog post URLs whose slugs come from Ghost.

### How it works in this repo

The sitemap is generated by `app/sitemap.ts` — a Next.js App Router convention. When Google requests `https://www.astrosewa.com/sitemap.xml`, Next.js runs this file on the server, calls Ghost's API for the current list of posts, and returns a fresh XML response.

```
Google requests /sitemap.xml
  → Next.js runs app/sitemap.ts
       ├── Adds static entries:  / and /blogs
       └── ghostClient.posts.browse({ fields: 'slug, updated_at' })
             └── returns all current posts from Ghost
                   └── maps to /blogs/<slug> entries with lastmod
  → returns sitemap.xml with all URLs
  → revalidate: 3600 caches the response for 1 hour
```

**`revalidate: 3600`** controls how long Next.js caches the sitemap response before rebuilding it. This uses Next.js **Incremental Static Regeneration (ISR)** — it does not call Ghost's API on every request, nor does it require a redeploy when content changes.

How the cache cycle works:

```
Time 0:00  →  Google hits /sitemap.xml
               Next.js runs sitemap.ts, calls Ghost API, builds XML
               Response is served and cached for 3600 seconds (1 hour)

Time 0:30  →  Google hits /sitemap.xml again
               Cached response served instantly — Ghost API not called

Time 0:45  →  You publish a new post in Ghost

Time 1:00  →  Cache expires

Time 1:01  →  Next request hits /sitemap.xml
               Next.js runs sitemap.ts again, calls Ghost API
               New post is now included — cached for another hour
```

The new post appears in the sitemap within 1 hour of publishing — no redeployment needed. If faster discovery is required, lower the value:

```ts
export const revalidate = 600; // 10 minutes
```

1 hour is sufficient for a blog since Google itself re-reads sitemaps every few days regardless.

**Key fields in each sitemap entry:**

```xml
<url>
  <loc>https://www.astrosewa.com/blogs/vedic-astrology-guide</loc>
  <lastmod>2025-04-20T10:00:00.000Z</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>
```

- `loc` — the full canonical URL (uses `NEXT_PUBLIC_SITE_URL` as prefix)
- `lastmod` — taken from `post.updated_at` in Ghost, so Google re-crawls when a post is edited
- `priority` — 0.7 for blog posts, 0.8 for /blogs listing, 1.0 for home

### robots.txt

`app/robots.ts` (also a Next.js convention) generates `robots.txt` at runtime:

```
User-agent: *
Allow: /
Disallow: /_next/
Disallow: /api/
Sitemap: https://www.astrosewa.com/sitemap.xml
```

Google reads this first, finds the sitemap URL, then reads the sitemap to discover all pages.

### Why Ghost's own sitemap is not a problem

Ghost auto-generates `blog.dev.astrosewa.com/sitemap.xml`. Because Ghost pages have `<meta name="robots" content="noindex, nofollow">` injected, Google will crawl those Ghost URLs but immediately discard them. The `nofollow` also prevents Google from following the link to Ghost's sitemap file itself. Never submit `blog.dev.astrosewa.com/sitemap.xml` to Google Search Console — only submit `https://www.astrosewa.com/sitemap.xml`.

---

## 4. How All Three Pieces Connect

```
Ghost CMS (blog.dev.astrosewa.com)
  │  noindex + nofollow on all pages  →  invisible to Google
  │
  │  Content API (server-side only)
  │
  ├──► app/blogs/page.tsx          →  blog listing UI
  ├──► app/blogs/[slug]/page.tsx   →  full post UI
  │       canonical: www.astrosewa.com/blogs/<slug>
  │       og/twitter meta from Ghost fields
  │
  └──► app/sitemap.ts (revalidates every 1h)
          lists / , /blogs , /blogs/<every slug>
          lastmod from Ghost updated_at
```

Google's perspective:
1. Reads `robots.txt` → finds `https://www.astrosewa.com/sitemap.xml`
2. Reads `sitemap.xml` → discovers all blog post URLs under `www.astrosewa.com`
3. Crawls each URL → reads `<link rel="canonical">` → confirms `www.astrosewa.com` is authoritative
4. Attempts to crawl Ghost → sees `noindex` → discards, never indexes
5. All ranking signals accumulate on `https://www.astrosewa.com`

---

## 5. Files Reference

| File | Role |
|---|---|
| `app/sitemap.ts` | Generates sitemap.xml dynamically, fetches Ghost posts, revalidates hourly |
| `app/robots.ts` | Generates robots.txt, points crawlers to sitemap |
| `app/layout.tsx` | Sets `metadataBase` for the whole app |
| `app/page.tsx` | Sets canonical for the home page |
| `app/blogs/[slug]/page.tsx` | Sets per-post canonical in `generateMetadata` |
| `lib/ghostClient.ts` | Singleton Ghost Content API client |
| `lib/env.ts` | Validates and exports Ghost environment variables |
| Ghost code injection | `noindex` + `nofollow` on all Ghost-rendered pages |

---

## 6. Environment Variables Summary

| Variable | Used by | Purpose |
|---|---|---|
| `GHOST_CONTENT_API_URL` | `lib/env.ts` | Ghost instance base URL |
| `GHOST_CONTENT_API_KEY` | `lib/env.ts` | Read-only Ghost Content API key |
| `GHOST_CONTENT_API_VERSION` | `lib/env.ts` | Ghost API version (default `v5.0`) |
| `NEXT_PUBLIC_SITE_URL` | `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts` | Production domain — must be `https://www.astrosewa.com` |
| `NEXT_PUBLIC_GA_ID` | `app/layout.tsx` | Google Analytics tag ID |
