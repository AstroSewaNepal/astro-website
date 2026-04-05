# Astro Sewa — development guide (for humans & AI assistants)

This document explains **how this Next.js repo is structured**, **where to put new pages and components**, and **how to handle APIs and env** so work stays consistent and easy to extend.

---

## 1. What you are working in

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16** (App Router) |
| UI | **React 19**, **TypeScript** |
| Styling | **Tailwind CSS 4**, occasional **CSS modules** (e.g. landing background) |
| Content API | **Ghost** via `@tryghost/content-api` (`lib/ghostClient.ts`) |
| Fonts | Next `next/font/google` — Tiro Devanagari, Sahitya, Mukta (`app/layout.tsx`) |

**Mental model:** Routes live under `app/`. UI building blocks live under `components/`. Shared logic and integrations live under `lib/`. **Do not** put business UI inside `lib/`; **do not** put route files inside `components/`.

---

## 2. Server Components vs Client Components (critical)

Next.js App Router defaults to **Server Components** (no `'use client'`).

| Use **Server Component** (default) when… | Use **Client Component** (`'use client'`) when… |
|------------------------------------------|--------------------------------------------------|
| Page only renders markup and reads data with `async` | You need `useState`, `useEffect`, browser APIs |
| You call `ghostClient` or DB directly in the page | You use Swiper, drag, modals, controlled forms |
| No event handlers | You attach `onClick`, `onChange`, etc. |

**Rule of thumb:** Keep **pages** as Server Components when possible; push interactivity into a **small leaf** client component.

**Data fetching:**

- **Server:** `async function Page() { const data = await ghostClient... }` — secrets stay server-side.
- **Client:** `fetch()` to your **Next.js API route** (`/api/...`) or to a **public** backend URL (`NEXT_PUBLIC_*` only). Never put secret keys in client code.

---

## 3. Folder map (where things go)

```
app/                          # Routes only (page.tsx, layout.tsx, route handlers)
  layout.tsx                  # Root layout, fonts, global <html>/<body>
  globals.css
  landing-page.module.css     # Shared parchment background (imported by marketing pages)
  page.tsx                    # Home
  about-us/page.tsx
  blogs/page.tsx
  blogs/[slug]/page.tsx
  api/ghost/...               # BFF proxy for Ghost (server)

components/
  logo/                       # Brand logo
  icons/                      # Small SVG/React icons (one folder per icon set)
  images/                     # Static image imports + barrel index.ts
  enums/                      # Shared enums (e.g. language)
  common/                     # Generic reusable UI (pagination, blog cards, FAQ primitives)
  pages/
    landing/                  # Site-wide marketing blocks
      header/landing-header.tsx
      footer/index.tsx
      hero/, services/, faq/, ...
    about-us/                 # About-specific sections
    blogs/                    # Blog listing/detail UI
    puja-bidhi/

lib/
  env.ts                      # Environment variables (Ghost URL/key, etc.)
  logger.ts
  ghostClient.ts              # Ghost Content API singleton
  ghostResources.ts           # Ghost resource allowlist for API routes
  api/                        # RECOMMENDED: module-wise URL builders & fetch helpers (see §7)
```

**Convention:**

- **`components/pages/landing/`** — chrome and sections reused on many routes: **header, footer, hero, services, download app**, etc.
- **`components/pages/<feature>/`** — sections used mainly on one area (e.g. `about-us/hero`).
- **`components/common/`** — dumb/reusable widgets not tied to one page.
- **`components/icons/`**, **`components/images/`** — assets and small UI atoms.

---

## 4. Standard page shell (header, footer, background)

Most marketing pages follow the same **outer shell**:

1. `<main>` with `LandingPageCSS.background` + vertical spacing (`space-y-[100px]`).
2. First block: **`LandingHeader`** + page-specific hero (or first section).
3. Middle: feature sections.
4. Optional: **`Services`**, **`DownloadApp`**, etc.
5. **`Footer`** at the bottom.

**Canonical imports:**

```tsx
import clsx from 'clsx';

import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import LandingPageCSS from '@/app/landing-page.module.css'; // adjust relative path from page file
```

**Example skeleton (new route `app/my-feature/page.tsx`):**

```tsx
import type { Metadata } from 'next';
import clsx from 'clsx';

import Footer from '@/components/pages/landing/footer';
import { LandingHeader } from '@/components/pages/landing/header/landing-header';
import LandingPageCSS from '../landing-page.module.css';

export const metadata: Metadata = {
  title: 'My Feature',
  description: '…',
};

export default function MyFeaturePage() {
  return (
    <main className={clsx('min-h-screen space-y-[100px]', LandingPageCSS.background)}>
      <div>
        <LandingHeader />
        {/* Hero or first section component */}
      </div>
      {/* More sections */}
      <Footer />
    </main>
  );
}
```

**If you add a layout shared only by a section** (e.g. all `/horoscope/*`), use `app/horoscope/layout.tsx` to wrap children — still import the same header/footer if design requires it.

---

## 5. Creating a new page (checklist)

1. **Create** `app/<segment>/page.tsx` (or `app/<segment>/[param]/page.tsx` for dynamic routes).
2. **Export `metadata`** (title, description, openGraph) for SEO.
3. **Reuse** `LandingHeader`, `Footer`, and `LandingPageCSS.background` unless the design is a completely different layout (e.g. auth-only page).
4. **Implement sections** as components under `components/pages/<feature>/` — keep the page file thin (composition only).
5. **Fetch data** in the page if it is a Server Component: `await ghostClient...` or a `lib/api` helper that runs on the server.
6. **Add** the route to **navigation** in `components/pages/landing/header/landing-header.tsx` (and mobile `MOBILE_NAV`) with a real `href`.
7. **Update** footer links in `components/pages/landing/footer/index.tsx` when the page is public.
8. **Optional:** add the path to `next-sitemap.config.js` if it should be explicit in the sitemap.

---

## 6. Creating a new component (checklist)

### 6.1 Where to put the file

| Kind of component | Location |
|-------------------|----------|
| Marketing block used on many pages (e.g. CTA strip) | `components/pages/landing/<name>/index.tsx` |
| Feature-specific block (one area of the site) | `components/pages/<feature>/<name>/index.tsx` |
| Generic UI (pagination, card, modal shell) | `components/common/<name>/` |
| Icon | `components/icons/<name>/index.tsx` |
| Image barrel export | `components/images/index.ts` |

### 6.2 File shape

- Prefer **`index.tsx`** inside a folder so imports stay `@/components/pages/landing/hero`.
- Use **named export** or **default export** consistently with siblings in that folder (this repo often uses **default** for section components).
- Use **TypeScript** props interface at the top of the file or in `types.ts` if large.

### 6.3 Client boundary

If the component needs hooks or events, add **`'use client'`** as the **first line** of that file only — do not mark the whole page as client unless necessary.

---

## 7. API and data — industry-standard layering

Avoid scattering `fetch('https://...')` and `process.env` across components. Use **three layers**:

### Layer A — Environment (`lib/env.ts`)

- **All** server-side secrets and config are read here (Ghost URL, keys, etc.).
- **Never** expose secret keys to the client. Only variables prefixed with **`NEXT_PUBLIC_`** are safe in the browser.

**Optional upgrade (common in production Next apps):** validate env with **Zod** + **`@t3-oss/env-nextjs`** so missing/invalid keys fail at build/start with clear errors. See [env.t3.gg](https://env.t3.gg).

### Layer B — Module-wise API surface (`lib/api/`)

**Recommended structure** (add this folder if it does not exist yet):

```
lib/api/
  url-utils.ts      # joinUrl, normalizeBaseUrl
  astrology.ts      # NEXT_PUBLIC_BACKEND_URL + paths → getAstrologyHoroscopeUrl()
  ghost.ts          # buildGhostPostsBrowseUrl() for /api/ghost/posts?...
  site.ts           # getSiteUrl(), getGaMeasurementId()
  index.ts          # re-export public helpers
```

**Rules:**

- **One module per domain** (astrology, payments, user, …) as the product grows.
- Export **functions** that return full URLs or **typed fetch wrappers**, not raw string concatenation inside JSX.
- **Server-only** calls can import `env` from `lib/env.ts` and use Node APIs.
- **Client** code may only use **`NEXT_PUBLIC_*`** (surfaced through `lib/api` getters that read validated client env).

**Example (client-safe URL):**

```ts
// lib/api/astrology.ts
import { joinUrl, normalizeBaseUrl } from './url-utils';

export function getAstrologyHoroscopeUrl(): string {
  const base = normalizeBaseUrl(process.env.NEXT_PUBLIC_BACKEND_URL ?? '');
  return joinUrl(base, 'api/v1/astrology/horoscope');
}
```

Then in a client component: `fetch(getAstrologyHoroscopeUrl())`.

### Layer C — Who calls what

| Data source | Preferred caller | Pattern |
|-------------|------------------|---------|
| Ghost (posts, tags) | Server page or API route | `ghostClient` from `lib/ghostClient.ts` |
| Ghost from browser without exposing key | Client `fetch('/api/ghost/posts?...')` | Use URL builders from `lib/api/ghost.ts` |
| Your backend REST | Server: direct fetch with server env; Client: `NEXT_PUBLIC_` base + `lib/api/*.ts` | Consider adding `lib/api/client.ts` with `fetchJson<T>()` for consistent errors |

**Ghost today:** `app/blogs/page.tsx` uses **`ghostClient` on the server** (good). `blog-listing` and `useBlogPosts` use **`/api/ghost`** from the client (also good for keys).

---

## 8. Styling and design consistency

- **Global tokens:** `app/globals.css` (Tailwind theme extensions if any).
- **Marketing background:** `app/landing-page.module.css` — import as `LandingPageCSS.background` on main wrappers.
- **Primary brand color:** Tailwind `primary` / hex like `#611508`, `#691709` — match existing sections before inventing new palettes.
- **Typography:** `font-sahitya`, `font-mukta`, `font-tiro-devanagari` (CSS variables from root layout).
- **Prose for long HTML (blog):** `@tailwindcss/typography` — use `prose` classes where blog body is rendered.

---

## 9. Imports and aliases

- Use **`@/`** for all app and component imports (configured in `tsconfig.json`).
- Order imports logically: React → Next → third-party → `@/components` → `@/lib` → relative (CSS last is fine).

---

## 10. Anti-patterns (avoid these)

| Don’t | Do instead |
|-------|------------|
| Put `fetch` URLs as long strings in random components | Centralize in `lib/api/<module>.ts` |
| Use `href=""` or `#` for real navigation | Wire real paths; use `Link` from `next/link` |
| Mark entire pages `'use client'` for one interactive block | Extract a small client child |
| Commit secrets | Only `lib/env` + `.env.local`; keep `.env.example` updated |
| Duplicate header/footer markup per page | Use the same `LandingHeader` + `Footer` pattern |

---

## 11. Quick reference — “I want to…”

| Goal | Action |
|------|--------|
| New public page | `app/.../page.tsx` + sections in `components/pages/...` + nav + footer links |
| Reuse top nav / footer | Import from `components/pages/landing/header` and `.../footer` |
| New Ghost-based list | Server: `ghostClient`; client: `/api/ghost` + `lib/api/ghost.ts` URLs |
| New REST integration | Add `lib/api/<name>.ts` + env vars in `lib/env.ts` / `.env.example` |
| New icon | `components/icons/...` + use in UI |
| New shared button/card | `components/common/...` |

---

## 12. Flow diagram (mental model)

```text
User request
    → app/<route>/page.tsx  (Server Component by default)
         → composes components/pages/*
         → optional: await ghostClient / await fetch (server)
    → Client leaf components ('use client')
         → fetch('/api/...') or fetch(publicBackendUrl from lib/api)

Config & secrets
    → lib/env.ts (server)
    → NEXT_PUBLIC_* only for browser-accessible URLs

External HTTP surface
    → lib/api/*.ts (URLs, small helpers)
    → lib/ghostClient.ts (Ghost SDK)
    → app/api/* (BFF / proxy)
```

---

## 13. Keeping this guide useful for AI tools

When asking an AI to implement a feature, you can attach this file and say:

- “Follow `docs/DEVELOPMENT_GUIDE.md`.”
- Specify route path, whether the page needs client state, and which API module in `lib/api` to extend.

**Maintainers:** When you introduce a new pattern (e.g. auth layout, new CMS), add a short subsection here so humans and AI stay aligned.

---

*Last aligned with repo layout: App Router under `app/`, shared chrome under `components/pages/landing/`, Ghost under `lib/ghostClient.ts` and `app/api/ghost/`.*
