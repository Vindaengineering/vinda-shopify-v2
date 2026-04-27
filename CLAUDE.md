# CLAUDE.md

Context for Claude Code when working in this repository.

## Project

**Vinda v2** — Shopify storefront for an EV cable reel brand, separate from the live v1 store. Two products only: a **wall-mounted auto-retractable reel** and a **portable cable reel**. Markets: Sweden primary, also wider EU. Languages: Swedish (default) + English.

The visual language for v2 was mocked up in Anthropic Design and lives at [`/tmp/design-r03/vinda-storefront/`](/tmp/design-r03/vinda-storefront/) at the time of build. It is dark, dense, e-commerce-flat — a single-page conversion-focused layout. **Do not introduce the v1 instrument-panel aesthetic here**; v2 is a separate brand expression.

## Build approach

- **Fork of Shopify Dawn**, not a from-scratch theme.
- The design is a React/Babel prototype. We recreate the visual output inside Shopify Liquid + vanilla JS — **no React on the storefront**.
- Solo developer, ship-focused. Polish over feature count.

## Non-negotiable constraints

- **No heavy JS frameworks.** No React, Vue, Alpine, htmx. Vanilla JS with native APIs (`<dialog>`, `IntersectionObserver`, `fetch`).
- **No npm build step in the theme.** Shopify bundles `/assets` at serve time.
- **No browser storage APIs** beyond what Shopify's cart already uses.
- **Fonts: Google Fonts CDN.** Space Grotesk (display), DM Sans (body), JetBrains Mono (labels). Loaded via `<link>` in `layout/theme.liquid`. Self-hosting is a deliberate non-goal for v2.
- **All user-facing strings go through the locale files** (`locales/sv.default.json`, `locales/en.json`) via `{{ 'key' | t }}`. Never hardcode Swedish or English text in Liquid.
- **Respect `prefers-reduced-motion`** on every animation. Tokens collapse durations to 0ms automatically — additionally guard cart-drawer / sticky-bar transitions.
- **WCAG 2.1 AA.** Focus rings visible (2px accent green), keyboard nav works, contrast ratios meet spec. Skip-link wired in `theme.liquid`.

## File conventions

- **Product templates:** one alternate template per product. `templates/product.wall-reel.json` and `templates/product.portable.json`. `templates/product.json` stays as default fallback. Compose sections in JSON; no Liquid conditionals to branch between products.
- **Sections:** one section file per homepage module (hero, trust-strip, features, product-feature, lifestyle-break, reviews, final-cta). Keep them independently editable in the theme editor.
- **CSS:** design tokens in `assets/tokens.css`. All section + primitive styles in `assets/storefront.css` (one shared file — surface area is small for a one-page brand site). Critical CSS loaded synchronously via `<link rel="stylesheet">` in head.
- **JS:** ES modules where possible. One file per component. Defer everything. No global namespace pollution.

## Design tokens (canonical source)

Use these CSS custom properties (defined in `assets/tokens.css`). Don't introduce new colors without updating this list.

```css
--color-bg: #0D0D0D;
--color-bg-alt: #080808;
--color-bg-card: #111;
--color-bg-card-hi: #141414;
--color-fg: #FFFFFF;
--color-fg-soft: #BBBBBB;
--color-fg-muted: #777;
--color-fg-mute2: #555;
--color-fg-mute3: #444;
--color-fg-mute4: #333;
--color-border: #1A1A1A;
--color-border-2: #222;
--color-border-3: #2A2A2A;
--color-accent: #39E614;  /* the only accent. used sparingly. */

--font-display: 'Space Grotesk', sans-serif;
--font-body: 'DM Sans', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* spacing uses the design's exact pixel cadence — see tokens.css */
--header-height: 64px;
--content-max: 1200px;

--radius-xs: 2px; --radius-sm: 4px; --radius-md: 8px;

--motion-fast: 200ms;
--motion-base: 300ms;
--motion-slow: 600ms;
--motion-drawer: 380ms;
--motion-ease-out: cubic-bezier(0.25, 0, 0, 1);
```

## Things to always do

- **Translation keys in both locales.** When adding a string in `sv.default.json`, add the matching key in `en.json` in the same commit. Don't leave empty EN keys.
- **Responsive images.** Use Liquid `image_url` filter with `width` param + a `srcset`. Preload the hero LCP image (already wired in `theme.liquid` for index template).
- **Keyboard test.** After any new interactive component, tab through it. Focus visible, Enter/Space activates, Escape closes drawers.
- **Mobile first.** Start every component at 375px viewport and scale up. Swedish e-commerce is ~70% mobile.
- **Accessible patterns.** Buttons are `<button>`. Links are `<a>`. Drawers are `<dialog>` or role="dialog" with focus trap. Cart drawer must trap focus + handle Escape.

## Things to never do

- **Never hardcode prices.** Use `{{ product.price | money }}` so currency formatting works per market. The design's `€399` / `€70` are placeholders — real values come from Shopify products.
- **Never quote song lyrics or copyrighted long-form content** in blog posts, product copy, or FAQs.
- **Never include car-brand logos** (Volvo, Tesla, BMW, Porsche, etc.) without an actual licensing agreement. Use a text statement: "Compatible with all EVs using a standard Type 2 cable."
- **Never add a tracking pixel, analytics snippet, or third-party script** outside of Shopify built-in. Ask before adding any.
- **Never commit merchant-owned files.** These resync from Shopify Admin on every push — committing local versions overwrites the merchant's saved state (logos, menus, image pickers, block settings):
  - `config/settings_data.json` — theme settings (logo, colors, social)
  - `templates/index.json`, `templates/product.json`, `templates/collection.json` — merchant-edited via Theme Editor
  - Any `templates/*.json` after it contains real merchant content
  - **Exception:** scaffolding a brand-new template JSON for the first time (`page.about.json`, `product.wall-reel.json`) — commit once, then leave alone.
  - **Workflow:** `git pull --rebase` before every push. If `git status` shows unintended changes to these files, `git checkout -- <file>` to discard them.
- **Never write inline styles** in section files for anything that's not a one-off positional tweak. Default to CSS classes tied to tokens.
- **Never rely on `window.load`** for critical UI. Use `DOMContentLoaded` or `defer`.

## Shopify quirks worth remembering

- Liquid is server-rendered; you can't use JS variables in Liquid logic. Pass Liquid values into JS via `data-*` attributes or JSON in a `<script type="application/json">` block.
- `cart.js` endpoints are `/cart/add.js`, `/cart/update.js`, `/cart/change.js`. They return JSON. Don't refetch the cart after every change — use the response.
- Theme editor sections must declare `{% schema %}` with `presets` to appear in the section picker. If a section isn't showing up, the schema is missing or malformed.
- Image CDN params: `?width=800&format=webp` works.
- Metafields are the right way to store per-product structured content (spec rows). Define in admin, reference with `{{ product.metafields.namespace.key }}`.

## Current status

- [x] Wave 1 — foundation (tokens, fonts, layout shell)
- [ ] Wave 2 — header + footer
- [ ] Wave 3 — homepage (8 sections)
- [ ] Wave 4 — cart drawer + sticky cart bar
- [ ] Wave 5 — PDPs + locales + a11y polish

## Communication style

Prefer concise diffs and direct edits over long explanations. When changing more than one file, say what changed in each in one line. Flag anything that touches checkout, cart, or payment config — those are high-stakes.
