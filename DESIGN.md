# Design System — Plus Jakarta Sans

> Typography foundation for web applications, dashboards, data portals, and internal systems.
>
> **Status:** Initial recommendation  
> **Font family:** Plus Jakarta Sans  
> **Language:** Indonesian  
> **Scope:** Typography tokens and implementation guidance

---

## 1. Principles

- Use **Plus Jakarta Sans** as the primary UI typeface.
- Establish hierarchy with size, weight, line height, and letter spacing—not size alone.
- Prefer semantic typography tokens over arbitrary values in individual components.
- Keep body copy readable and interface labels compact but legible.
- Treat the values below as project defaults; adjust them to match product requirements and brand guidelines.

## 2. Font family

**Primary:** `Plus Jakarta Sans`  
**Fallback:** `sans-serif`

Recommended weights:

| Weight | Name | Intended use |
|---:|---|---|
| 400 | Regular | Body text, descriptions, paragraphs |
| 500 | Medium | Navigation and light emphasis |
| 600 | SemiBold | Labels, card titles, subheadings |
| 700 | Bold | Headings and important values |
| 800 | ExtraBold | Special display headlines only |

Avoid using too many weights within one view. Most interfaces can work well with 400, 500, 600, and 700.

## 3. Type scale

Use a base size of **16 px** (1 rem, assuming the browser default root size).

| Token | Size | Weight | Line height | Typical use |
|---|---:|---:|---:|---|
| `display-xl` | 48 px / 3 rem | 700 | 1.15 | Hero headline |
| `heading-xl` | 36 px / 2.25 rem | 700 | 1.2 | Page title |
| `heading-lg` | 30 px / 1.875 rem | 700 | 1.25 | Major section heading |
| `heading-md` | 24 px / 1.5 rem | 600 | 1.3 | Panel or section title |
| `heading-sm` | 20 px / 1.25 rem | 600 | 1.4 | Card title |
| `body-lg` | 18 px / 1.125 rem | 400 | 1.6 | Introductory copy |
| `body-md` | 16 px / 1 rem | 400 | 1.5 | Default body text |
| `body-sm` | 14 px / 0.875 rem | 400 | 1.5 | Supporting text |
| `label-md` | 14 px / 0.875 rem | 600 | 1.4 | Form labels and controls |
| `label-sm` | 12 px / 0.75 rem | 600 | 1.4 | Compact labels and metadata |
| `caption` | 12 px / 0.75 rem | 400 | 1.5 | Timestamps and helper captions |

### Usage guidance

- Use `display-xl` sparingly for prominent marketing or landing-page headlines.
- Use `heading-xl` for the primary page heading; avoid multiple competing page-level headings.
- Use `heading-lg` and `heading-md` to organize sections and panels.
- Use `heading-sm` for cards, dialogs, and compact modules.
- Use `body-md` as the default reading size.
- Use `body-sm` for secondary content, not for long passages that users must read carefully.
- Use `caption` only for non-critical supporting information. Avoid going below 12 px for essential UI text.

## 4. Font weight tokens

| Token | Value |
|---|---:|
| `font-regular` | 400 |
| `font-medium` | 500 |
| `font-semibold` | 600 |
| `font-bold` | 700 |
| `font-extrabold` | 800 |

## 5. Line-height tokens

Use unitless line-height values so they scale with the font size.

| Token | Value | Usage |
|---|---:|---|
| `leading-tight` | 1.2 | Large headings |
| `leading-heading` | 1.3 | Standard headings |
| `leading-label` | 1.4 | Labels and compact headings |
| `leading-body` | 1.5 | Standard UI and body copy |
| `leading-relaxed` | 1.6 | Introductory or longer reading copy |

## 6. Letter-spacing tokens

| Token | Value | Usage |
|---|---:|---|
| `tracking-tight` | `-0.03em` | Large display headings |
| `tracking-heading` | `-0.02em` | Page and section headings |
| `tracking-normal` | `0` | Body text and most UI |
| `tracking-wide` | `0.04em` | Optional short uppercase eyebrow labels |

Do not apply negative letter spacing to all text. Keep body copy at normal tracking.

## 7. CSS tokens

Add the following to `src/app/globals.css` or your global stylesheet:

```css
:root {
  /* Font family */
  --font-sans: var(--font-plus-jakarta-sans), sans-serif;

  /* Font sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */

  /* Font weights */
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;

  /* Line heights */
  --leading-tight: 1.2;
  --leading-heading: 1.3;
  --leading-label: 1.4;
  --leading-body: 1.5;
  --leading-relaxed: 1.6;

  /* Letter spacing */
  --tracking-tight: -0.03em;
  --tracking-heading: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.04em;
}

html {
  font-family: var(--font-sans);
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--font-regular);
  line-height: var(--leading-body);
  letter-spacing: var(--tracking-normal);
}

h1,
h2,
h3,
h4 {
  letter-spacing: var(--tracking-heading);
}

h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
}

h2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: 1.25;
}

h3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-heading);
}

h4 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: 1.4;
}

small {
  font-size: var(--text-sm);
  line-height: var(--leading-body);
}
```

## 8. Next.js font setup

For a Next.js App Router project, configure the font in `src/app/layout.tsx`:

```tsx
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={plusJakartaSans.variable}>
        {children}
      </body>
    </html>
  );
}
```

The CSS variable `--font-plus-jakarta-sans` is then available to the global stylesheet. The `--font-sans` token uses it with a generic sans-serif fallback.

## 9. Responsive guidance

For smaller screens, reduce large headings while preserving body-text readability.

Example:

```css
@media (max-width: 640px) {
  h1 {
    font-size: 2rem;      /* 32px */
    line-height: 1.2;
  }

  h2 {
    font-size: 1.625rem;  /* 26px */
  }

  h3 {
    font-size: 1.25rem;   /* 20px */
  }
}
```

Keep body text around 16 px where possible. Do not shrink essential labels or controls just to fit more content on screen.

## 10. UI-specific rules

### Dashboard and data tables
- Use `body-md` for primary table content where space allows.
- Use `body-sm` for dense tables and secondary metadata when necessary.
- Use `font-medium` or `font-semibold` for column headers.
- Use tabular numerals for numeric columns when supported by the design or font settings.

```css
.numeric {
  font-variant-numeric: tabular-nums;
  text-align: right;
}
```

### Forms
- Use `label-md` for field labels.
- Use `body-md` for input values.
- Use `body-sm` for helper text and validation messages.
- Make error states distinguishable through text and other visual cues, not color alone.

### Buttons and navigation
- Use 14–16 px text.
- Use weight 600 for primary actions and selected navigation items.
- Maintain consistent capitalization and avoid unnecessary all-caps labels.

### Cards and panels
- Use `heading-sm` for card titles.
- Use `body-sm` for descriptions only when content is short.
- Keep metadata visually secondary to the primary content.

## 11. Accessibility and quality checks

- Maintain sufficient text/background contrast.
- Do not communicate status using color alone.
- Keep essential text comfortably readable; avoid using 12 px for important instructions.
- Check text wrapping with Indonesian labels and longer real-world content.
- Test at mobile, tablet, and desktop widths.
- Verify font loading and fallback behavior.
- Avoid manually bolding entire paragraphs; use weight to communicate hierarchy.

## 12. Quick reference

| UI element | Recommended token |
|---|---|
| Landing page hero | `display-xl` |
| Page title | `heading-xl` |
| Section title | `heading-lg` |
| Panel title | `heading-md` |
| Card title | `heading-sm` |
| Intro paragraph | `body-lg` |
| Standard paragraph | `body-md` |
| Supporting text | `body-sm` |
| Form label | `label-md` |
| Compact metadata | `label-sm` or `caption` |

## 13. Executive Pure White Theme & Flat Layout Architecture

### Palette tokens (WCAG AAA High Contrast)
- **Surface Primary:** `#ffffff` (Clean card & panel backgrounds)
- **Canvas Base:** `#f8fafc` / `#ffffff` (Clean, crisp background)
- **Border Default:** `#cbd5e1` / `#e2e8f0` (Crisp 1px borders)
- **Text Dominant:** `#0f172a` (Charcoal / Slate-900 for high-contrast headers and hero numbers)
- **Text Body / Secondary:** `#1e293b` (Slate-800) and `#334155` (Slate-700) - 10.1:1+ AAA contrast ratio
- **Text Meta / Footnotes:** `#475569` (Slate-600) / `#334155` (Slate-700 font-semibold) - Eliminates washed-out slate-400/500 text
- **High-Contrast Badges:**
  - *Alert / Critical:* `bg-rose-100 text-rose-900 border-rose-300` (deep crimson text on light rose with defined border)
  - *Warning / Perlu Akselerasi:* `bg-amber-100 text-amber-900 border-amber-300` (deep amber-brown text on warm amber)
  - *Success:* `bg-emerald-100 text-emerald-900 border-emerald-300` (dark forest green on pale emerald)
  - *Neutral:* `bg-slate-100 text-slate-800 border-slate-300` (slate-800 on slate-100)

### Flat Layout & Decluttering (Zero Nested Card-in-Card)
1. **CardBesar1 (Macro Strip):** Flat card surface; eliminated nested gray comparison containers. Hero numbers are `text-3xl lg:text-4xl font-extrabold text-slate-900` with direct trajectory context in `text-slate-700`.
2. **PillarCard (4 Core Pillars):** Eliminated nested inner shaded boxes and distracting progress bars. Hero progress metric (`45,7%`, `81,5%`, `99%`, `8,07%`) sits directly on the card surface with high-contrast text and a clean hairline divider.
3. **CardBesar2 (Pusat Kendali):** Removed inner nested white cards inside the 5 critical alert items. Renders flat, simple cards with bold titles, high-contrast badges, prominent numbers, and readable text (`text-slate-700 font-medium`).
4. **Table Contrast:** Table headers across Layer 1 (*Trajektori*), Layer 2 (*Pemantauan Terpadu*), and Layer 3 (*DTSEN*) use `bg-slate-100 text-slate-900 font-bold border-b border-slate-300`, with the 2026 current year highlighted in `text-blue-950 bg-blue-100/70 border-x border-blue-200`.

### Removed Elements & Noise Reduction
- Removed dark theme banner and dark mode toggles.
- Removed nested card-in-card containers that created visual noise.
- Removed dummy notification bells, user profile avatars, and placeholder export/share buttons.
- Merged redundant titles between navbar and subheader.

---

## Maintenance

Treat this document as the single reference for design and typography decisions. If the scale changes, update the tokens and examples together. Add new tokens only when a recurring UI need cannot be represented clearly by the existing system.

