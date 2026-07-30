# Astro Sewa — Design Guidelines

Official design system and UI implementation standards for the Astro Sewa web platform.

**Version:** 1.0 · 2026  
**Source of truth:** `app/globals.css`, `app/layout.tsx`, `components/ui/`

See also: [Developer Handbook](../README.md) for architecture and development workflow.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design System](#design-system)
3. [Typography Guidelines](#typography-guidelines)
4. [Color Guidelines](#color-guidelines)
5. [Layout Guidelines](#layout-guidelines)
6. [UI Component Standards](#ui-component-standards)
7. [Styling Standards](#styling-standards)
8. [Implementation Checklist](#implementation-checklist)

---

## Design Philosophy

| Value | Implementation |
|---|---|
| **Maroon dominates** | Primary actions, navigation, headings, and logo use brand maroon (`#611508`). |
| **Mukta is the voice** | Mukta handles all functional UI text. Tiro Devanagari is reserved for emotional headlines. |
| **Warm, never cold** | Parchment backgrounds, cream surfaces, warm-tinted shadows — no cold blues, neons, or pure white. |
| **Soft geometry** | High border-radius on interactive elements. No hard square corners on buttons or pills. |
| **Unhurried motion** | Transitions use `ease-in-out` at 200–350ms. |

---

## Design System

The Astro Sewa design system is defined in `app/globals.css` and applied through Tailwind CSS utilities and semantic tokens.

### Design Tokens Overview

| Category | Source | Usage |
|---|---|---|
| Brand colors | CSS variables in `:root` | Marketing pages, headings, CTAs |
| Semantic colors | shadcn HSL tokens (`--primary`, `--background`) | UI primitives in `components/ui/` |
| Typography | `next/font/google` in `app/layout.tsx` | Font family variables |
| Spacing | Tailwind scale + `.spacing-*` utilities | Section rhythm |
| Radius | `--radius` and component-specific values | Cards, buttons, navigation |
| Shadows | Defined per component type | Cards, navigation, elevation |

---

## Typography Guidelines

### Font Families

Fonts are loaded via `next/font/google` in `app/layout.tsx` and exposed as CSS variables on `<body>`.

| Font | Variable | Tailwind Utility | Role | Weights |
|---|---|---|---|---|
| **Tiro Devanagari Sanskrit** | `--font-tiro-devanagari` | `font-tiro-devanagari` | Display / hero headlines | 400 |
| **Mukta** | `--font-mukta` | `font-mukta` | Primary UI — navigation, labels, buttons, body | 300, 400, 600, 700, 800 |
| **Sahitya** | `--font-sahitya` | `font-sahitya` | Sanskrit / Devanagari decorative text | 400, 700 |
| **Nunito Sans** | `--font-nunito-sans` | `font-nunito-sans` | Long-form body, descriptions, blog content | 400, 500 |
| **Inter** | `--font-inter` | `font-inter` | Prices, stats, data labels | 500 |
| **Lato** | `--font-lato` | `font-lato` | Captions, tooltips, helper text | 300, 400 |

### Font Usage Rules

| Font | Use for | Do not use for |
|---|---|---|
| Tiro Devanagari Sanskrit | Hero headlines, section titles with cultural gravitas | Buttons, labels, data, navigation |
| Mukta | Navigation, labels, buttons, UI copy, section headings | Long-form blog prose |
| Sahitya | Nepali/Sanskrit ornamental labels | General UI text |
| Nunito Sans | Paragraphs, descriptions, blog articles | Headings, navigation |
| Inter | Prices, ratings, statistics, numeric data | Headlines, body prose |
| Lato | Captions, timestamps, helper text | Primary content |

### Type Scale

| Level | Size | Rem | Font | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|---|
| Hero | 80px | 5rem | Tiro Devanagari Sanskrit | 400 | 1.2 | default |
| H1 | 48px | 3rem | Mukta | 700 | 1.2 | default |
| H2 | 32px | 2rem | Mukta | 700 | 1.2 | default |
| H3 | 24px | 1.5rem | Mukta | 600 | 1.2 | 0.48px |
| Body L | 20px | 1.25rem | Mukta | 400 | 1.5 | 0.02em |
| Body | 16px | 1rem | Nunito Sans | 400 | 1.5 | 0.02em |
| Caption | 12px | 0.75rem | Lato | 300 | 1.5 | default |

### Base Typography

Applied globally in `app/globals.css`:

```css
body {
  font-family: var(--font-mukta);
  letter-spacing: 0.02em;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.81);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-tiro-devanagari);
  line-height: 1.2;
}
```

### Responsive Typography

| Element | Mobile | Desktop (lg+) |
|---|---|---|
| Hero headline | `text-3xl` to `text-4xl` | `text-[5rem]` |
| H1 | `text-3xl` | `text-5xl` |
| H2 | `text-2xl` | `text-[2rem]` |
| Body | `text-base` | `text-base` to `text-xl` |

### Usage Examples

```tsx
{/* Hero headline */}
<h1 className="font-tiro-devanagari text-[5rem] font-normal leading-[1.2] text-primary">
  Astrology, Made Personal.
</h1>

{/* Section heading */}
<h2 className="font-mukta text-[2rem] font-bold leading-[1.2] text-primary">
  Today&apos;s Horoscope
</h2>

{/* Section description */}
<p className="font-mukta text-xl font-normal leading-[1.5] text-[rgba(0,0,0,0.81)]">
  Vedic astrology guides your path.
</p>

{/* Body copy */}
<p className="font-nunito-sans text-base font-normal leading-[1.5]">
  Connect with expert astrologers in minutes.
</p>

{/* Price / stat */}
<span className="font-inter text-base font-medium">NPR 2/min</span>

{/* Caption */}
<span className="font-lato text-xs font-light">Updated daily at sunrise</span>
```

---

## Color Guidelines

### Primary Palette

| Name | Hex | CSS Variable | Tailwind | Usage |
|---|---|---|---|---|
| **Maroon** (Primary) | `#611508` | `--primary` | `bg-primary`, `text-primary` | Navigation, CTAs, headings, logo |
| **Coral Red** (Secondary) | `#c34b40` | `--destructive` | `bg-destructive`, `text-destructive` | Badges, alerts, accent highlights |
| **Warm Cream** (Surface) | `#f8f3df` | `--primary-foreground` | `bg-secondary`, `text-primary-foreground` | Text on dark backgrounds, card surfaces |
| **Parchment** (Background) | `#faf6ec` | `--background` | `bg-background` | Page background |
| **Dusk Mist** (Overlay) | `rgba(255,255,255,0.15)` | — | Custom utility | Active nav pill, glass effects |
| **Body Ink** | `rgba(0,0,0,0.81)` | — | `text-[rgba(0,0,0,0.81)]` | Paragraph text on light backgrounds |

### Extended Palettes

Full color scales (50–950) are available as CSS variables for specialized UI:

| Palette | Primary token | Use case |
|---|---|---|
| Saffron | `--saffron-500` (`#d47f2c`) | Warm accents, decorative highlights |
| Turmeric | `--turmeric-500` (`#ffd700`) | Festival and calendar highlights |
| Sindoor | `--sindoor-500` (`#c34b40`) | Alert and destructive variants |
| Royal | `--royal-700` (`#4b1d64`) | Premium and spiritual features |
| Moonlight | `--moonlight-500` (`#727272`) | Muted text, borders, disabled states |

Tailwind utilities follow the pattern `text-saffron-500`, `bg-sindoor-100`, `border-moonlight-300`, etc.

### Semantic Colors (shadcn/ui)

| Token | Maps to | Usage |
|---|---|---|
| `--primary` | Maroon `#611508` | Primary buttons, links, focus rings |
| `--primary-foreground` | Warm cream | Text on primary backgrounds |
| `--secondary` | Warm cream | Secondary surfaces |
| `--destructive` | Coral red `#c34b40` | Error states, destructive actions |
| `--muted` | Light cream | Subdued backgrounds |
| `--muted-foreground` | Gray-brown | Secondary text |
| `--border` | Light warm gray | Input borders, dividers |
| `--ring` | Maroon | Focus ring color |

### Text Colors

| Context | Color | Class |
|---|---|---|
| Body text on light background | `rgba(0,0,0,0.81)` | `text-[rgba(0,0,0,0.81)]` |
| Headings | `#611508` | `text-primary` |
| Text on dark/maroon background | `#f8f3df` | `text-primary-foreground` |
| Muted / secondary text | `--muted-foreground` | `text-muted-foreground` |
| Links | `#611508` | `text-primary hover:underline` |

### Color Rules

**Do:**

- Use Maroon `#611508` as the dominant brand color.
- Pair Cream `#f8f3df` as text on dark backgrounds.
- Use Coral Red `#c34b40` sparingly for badges and alerts.
- Use Parchment `#faf6ec` instead of pure white for page backgrounds.

**Do not:**

- Use cold blues, greens, or teals.
- Use pure black `#000000` for body text.
- Use Coral Red as a primary CTA color.
- Use neon or fluorescent accent colors.

### Gradients

| Name | Value | Usage |
|---|---|---|
| Dark section | `linear-gradient(90deg, #350b04 -50.26%, #691709 100%)` | CTA bands, clarity sections |
| Festival highlight | `linear-gradient(90deg, #c0944a 0%, #f9db51 100%)` | Panchang and festival accents |

---

## Layout Guidelines

### Container Widths

| Context | Max width | Class |
|---|---|---|
| Page content | 1280px | `max-w-7xl mx-auto` |
| Narrow content (forms, articles) | 768px | `max-w-3xl mx-auto` |
| Full-bleed sections | 100% | `w-full` |

Apply horizontal padding: `px-4 md:px-6 lg:px-8`.

### Spacing System

Base unit: **4px**. All spacing values are multiples of 4.

| Token | Value | Tailwind | Common usage |
|---|---|---|---|
| xs | 4px | `1` | Inline element gaps |
| sm | 8px | `2` | Icon-to-text gap |
| md | 16px | `4` | Compact padding |
| base | 20px | `5` | Button horizontal padding |
| lg | 24px | `6` | Card gaps, heading-to-content |
| xl | 40px | `10` | Section internal spacing |
| 2xl | 48px | `12` | Section padding (mobile) |
| 3xl | 100px | `[100px]` | Section padding (desktop) |

### Section Spacing Utilities

Defined in `app/globals.css`:

| Class | Mobile | Desktop (md+) | Purpose |
|---|---|---|---|
| `.spacing-section` | `py-12` (48px) | `py-[100px]` | Vertical padding between major sections |
| `.spacing-heading-content` | `mb-6` (24px) | `mb-[50px]` | Gap between section heading and content |
| `.spacing-title-desc` | `mt-2.5` (10px) | `mt-6` (24px) | Gap between title and description |

### Grid Patterns

| Layout | Columns | Gap | Usage |
|---|---|---|---|
| Zodiac cards | 1 → 2 → 4 | `gap-6` / `gap-10` | Horoscope and zodiac grids |
| Service cards | 1 → 2 → 4 | `gap-20` (80px) | Services section |
| Astrologer cards | 1 → 2 → 3 | `gap-[82px]` | Astrologer carousel |
| Two-column split | 1 → 2 | `gap-[79px]` | Calendar + Panchang |

### Breakpoints

| Breakpoint | Min width | Tailwind prefix |
|---|---|---|
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1536px | `2xl:` |

### Page Section Blueprint

```
┌─────────────────────────────────────────┐
│  Navigation (sticky, maroon, glass)     │
├─────────────────────────────────────────┤
│                                         │
│  Section — Hero / Title                 │
│  .spacing-section                       │
│                                         │
├── .spacing-heading-content ─────────────┤
│                                         │
│  Section — Content Grid / Cards         │
│                                         │
├── .spacing-section ─────────────────────┤
│                                         │
│  Section — Dark CTA Band (gradient)     │
│                                         │
├── .spacing-section ─────────────────────┤
│                                         │
│  Footer                                 │
└─────────────────────────────────────────┘
```

### Alignment Principles

- Section headings: center-aligned on marketing pages.
- Body content: left-aligned within containers.
- CTAs: inline-flex with consistent gap (`gap-4`).
- Cards: stretch to equal height within grid rows (`items-stretch`).

---

## UI Component Standards

### Buttons

**Location:** `components/ui/button.tsx`, `components/ui/sign-in-button.tsx`

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| Primary (default) | `#611508` | `#f8f3df` | none | Main actions — Book, Connect, Submit |
| Outline | transparent | `#611508` | `1px solid` | Secondary actions — language toggle |
| Secondary | `#f8f3df` | `#611508` | none | Alternative actions |
| Ghost | transparent | inherit | none | Nav items, subtle actions |
| Destructive | `#c34b40` | `#f8f3df` | none | Delete, error confirmations |
| Link | transparent | `#611508` | none | Inline text actions |

**Sizing:**

| Size | Height | Padding | Font |
|---|---|---|---|
| sm | 36px | `px-3` | 14px |
| default | 40px | `px-4 py-2` | 14px |
| lg | 44px | `px-8` | 16px |
| icon | 40×40px | — | — |

**Standards:**

- Border-radius: `24px` (`rounded-3xl`) for branded CTAs; `rounded-md` for admin forms.
- Padding: `8px 20px` for marketing buttons.
- Font: Mukta Medium (500).
- Transition: `transition-colors duration-200 ease-in-out`.
- Focus: `focus-visible:ring-2 focus-visible:ring-ring`.

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default" size="lg">Book Consultation</Button>
<Button variant="outline">Download app</Button>
```

### Cards

**Location:** `components/ui/card.tsx`

| Property | Value |
|---|---|
| Background | `bg-card` (`#f8f3df` or white) |
| Border | `1px solid` with low-opacity warm tone |
| Border-radius | `12px` (`rounded-lg`, `--radius: 0.75rem`) |
| Shadow | `shadow-sm` — warm, low opacity |
| Padding | `p-5` to `p-6` (20–24px) |

**Compound structure:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>{/* content */}</CardContent>
  <CardFooter>{/* actions */}</CardFooter>
</Card>
```

### Navigation

**Location:** `components/pages/landing/header/landing-header.tsx`

| Property | Value |
|---|---|
| Background | `#611508` |
| Text | `#f8f3df` |
| Active item | `rgba(255,255,255,0.15)` pill background |
| Font (active) | Mukta Bold (700) |
| Font (inactive) | Mukta Light (300) |
| Bar radius | `23px` |
| Shadow | `5px 7px 41px rgba(0,0,0,0.06)` |
| Sticky glass | `backdrop-blur-[2.5px]` |

### Forms and Inputs

**Location:** `components/ui/input.tsx`, `components/ui/form.tsx`, `components/ui/label.tsx`

| Property | Value |
|---|---|
| Border-radius | `12px` (`rounded-lg`) |
| Border | `border-input` |
| Focus ring | `ring-ring` (maroon) |
| Label font | Mukta Medium |
| Error state | `text-destructive` with `aria-invalid` |

Forms use React Hook Form with Zod validation:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
```

### Dialogs (Modals)

**Location:** `components/ui/dialog.tsx`

Built on Radix UI Dialog. Supports overlay, focus trap, and keyboard dismissal (Escape).

| Property | Value |
|---|---|
| Overlay | Semi-transparent dark backdrop |
| Content radius | `rounded-lg` |
| Animation | Radix enter/exit animations |
| Focus | Auto-focus on open, restore on close |

### Dropdowns

**Location:** `components/ui/dropdown-menu.tsx`, `components/ui/select.tsx`

Built on Radix UI. Used for navigation sub-menus, language selectors, and filter controls.

| Property | Value |
|---|---|
| Item padding | `px-2 py-1.5` |
| Hover | `bg-accent` |
| Font | Mukta Regular |

### Tables

**Location:** `components/ui/table.tsx`

Used in admin dashboards. Built with semantic `<table>` elements.

| Element | Style |
|---|---|
| Header | `font-medium text-muted-foreground` |
| Row | `border-b` with hover highlight |
| Cell padding | `p-4` |

### Badges and Tags

**Location:** `components/ui/badge.tsx`

| Variant | Background | Text |
|---|---|---|
| default | `#611508` | `#f8f3df` |
| secondary | `#f8f3df` | `#611508` |
| destructive | `#c34b40` | `#f8f3df` |
| outline | transparent | foreground |

| Property | Value |
|---|---|
| Border-radius | `24px` (`rounded-full` or `rounded-3xl`) |
| Padding | `4px 12px` |
| Font | Mukta Medium, 12px |

### Avatars

**Location:** `components/ui/avatar.tsx`

| Property | Value |
|---|---|
| Shape | `rounded-full` |
| Sizes | `sm` (32px), `default` (40px), `lg` (56px) |
| Fallback | Initials on `bg-muted` |

### Domain-Specific Components

| Component | Location | Purpose |
|---|---|---|
| `ZodiacSignCardsGrid` | `components/ui/zodiac-sign-cards-grid.tsx` | Zodiac sign card grid with icons, ratings, and links |
| `CompatibilitySignsGrid` | `components/ui/compatibility-signs-grid.tsx` | Compatibility sign selection grid |
| `SignInButton` | `components/ui/sign-in-button.tsx` | Branded authentication CTA |
| `AstrologerCard` | `components/pages/landing/talk-to-our-astrologer/` | Astrologer profile card with pricing and tags |

### Border Radius Reference

| Element | Radius | Class |
|---|---|---|
| Navigation bar | 23px | `rounded-[23px]` |
| Buttons and CTAs | 24px | `rounded-3xl` |
| Cards | 12px | `rounded-lg` |
| Tags and badges | 24px | `rounded-3xl` |
| Avatars | Full | `rounded-full` |
| Input fields | 12px | `rounded-lg` |

### Shadows and Elevation

| Element | Shadow | Usage |
|---|---|---|
| Navigation | `5px 7px 41px rgba(0,0,0,0.06)` | Sticky header |
| Cards | `0 2px 8px rgba(0,0,0,0.04)` | Default card elevation |
| Card hover | `0 4px 16px rgba(0,0,0,0.08)` | Interactive card lift |

Shadows are warm-tinted with opacity below 0.08. Avoid harsh or cold-toned shadows.

### Iconography

| Property | Value |
|---|---|
| Standard size | 22–24px |
| Badge size | 11px |
| Stroke weight | 1.375–2px |
| Style | Line / duotone (Solar icon set) |
| Color on dark | `#f8f3df` |
| Color on light | `#611508` |
| End caps | Round (`linecap: round`, `linejoin: round`) |

**Icon sources:**

| Library | Usage |
|---|---|
| `lucide-react` | shadcn/ui primitives |
| `react-icons` | Marketing sections |
| `components/icons/` | Custom branded SVG icons |

### Motion and Interaction

| Property | Value | Usage |
|---|---|---|
| Easing | `ease-in-out` | All transitions |
| Micro-interactions | 200ms | Hover, focus, color changes |
| Page transitions | 350ms | Section reveals, route changes |
| Backdrop blur | `backdrop-blur-[2.5px]` | Sticky navigation glass effect |

```css
transition: all 200ms ease-in-out;
```

### Backgrounds

| Type | Implementation |
|---|---|
| Page background | Parchment texture via `app/landing-page.module.css` on `SiteChrome` |
| Base color | `#faf6ec` (Parchment) |
| Dark sections | Maroon gradient (see [Gradients](#gradients)) |
| Card surfaces | `#f8f3df` (Warm Cream) or white |

---

---

## Styling Standards

### Tailwind Conventions

- Use semantic tokens (`bg-primary`, `text-muted-foreground`) in `components/ui/`.
- Use brand utilities (`text-saffron-500`, `bg-sindoor-100`) in marketing sections.
- Merge conditional classes with `cn()` from `lib/utils.ts`.
- Prefer Tailwind utilities over inline styles.
- Use CSS Modules only for complex section-specific styles (gradients, background images).

```tsx
import { cn } from '@/lib/utils';

<div className={cn('rounded-lg bg-card p-6', isActive && 'ring-2 ring-primary')} />
```

### CSS Variable Usage

Design tokens are defined in `app/globals.css`:

```css
/* Brand palette */
--saffron-500: #d47f2c;
--sindoor-500: #c34b40;

/* shadcn semantic tokens */
--primary: 359 84% 24%;
--radius: 0.75rem;
```

Access semantic tokens through Tailwind: `bg-primary`, `text-primary-foreground`, `rounded-lg`.

### Responsive-First Development

1. Write mobile layout first.
2. Add `md:` and `lg:` breakpoints for tablet and desktop.
3. Use `.spacing-section` and `.spacing-heading-content` for consistent section rhythm.
4. Test at 375px, 768px, and 1280px viewports.

### Component Styling Philosophy

| Layer | Styling approach |
|---|---|
| `components/ui/` | Semantic Tailwind tokens only |
| `components/pages/` | Brand utilities + spacing classes |
| CSS Modules | Section gradients, texture backgrounds, complex animations |

---
---

## Implementation Checklist

Use this checklist when building or reviewing UI.

- [ ] Colors match the brand palette (maroon, cream, parchment, body ink)
- [ ] Typography follows the type scale and font assignment rules
- [ ] Border-radius is consistent (24px buttons, 12px cards, 23px nav)
- [ ] Spacing uses the 4px base system and section utilities
- [ ] Shadows are warm-tinted with low opacity
- [ ] No cold colors (blue, green, teal) or pure black body text
- [ ] Layout works at 375px, 768px, and 1280px
- [ ] Section spacing uses `.spacing-section` and `.spacing-heading-content`
- [ ] Interactive elements use the defined motion and focus styles
- [ ] Icons follow size, stroke, and color rules

---

**Astro Sewa · Design Guidelines · 2026**
