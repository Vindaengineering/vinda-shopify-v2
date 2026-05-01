# Swedish Translation Sweep — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every English customer-facing string from the active Vinda v2 storefront by fixing `| default:` fallbacks, replacing hardcoded English labels, and producing a merchant content translation reference doc.

**Architecture:** Two deliverables — (1) code changes to `sections/`, `snippets/`, and `locales/` files so all runtime strings resolve to proper Swedish locale keys with English maintained in lockstep; (2) `docs/sv-content-translations.md` with proposed Swedish copy for merchant-level content (products, pages, blog, nav) that lives in Shopify Admin. Schema defaults that are already Swedish are left untouched per scope decision.

**Tech Stack:** Shopify Liquid, JSON locale files (`locales/sv.default.json`, `locales/en.json`), vanilla text editing. No build step.

---

## File Map

| File | Change |
|------|--------|
| `locales/sv.default.json` | Add `footer.legal_label`, `footer.location`, `newsletter.submit`, `sticky_bar.*` keys |
| `locales/en.json` | Same keys in English, lockstep |
| `sections/footer.liquid` | Replace `| default: 'Designed in Sweden'`, `| default: 'Legal'`, `| default: 'Payment methods'` with proper `| t` calls using new keys |
| `sections/sticky-cart-bar.liquid` | Replace hardcoded `label: 'Portable'` and `label: 'Wall Reel'` with `| t` calls |
| `docs/sv-content-translations.md` | New file: Swedish copy for all merchant-level Admin content |

**Note:** `header.*`, `cart.*`, `home.hero.*` keys already exist in `sv.default.json` and `en.json` — those `| default:` fallbacks in `header.liquid` and `cart-drawer.liquid` are safety nets, not actual missing translations. They will be verified but require no locale changes.

---

## Task 1: Verify existing locale keys resolve correctly

**Files:**
- Read: `locales/sv.default.json`
- Read: `sections/header.liquid`
- Read: `sections/cart-drawer.liquid`
- Read: `snippets/cart-drawer-item.liquid`

- [ ] **Step 1: Confirm header keys exist**

Open `locales/sv.default.json` and verify these keys are present:
```
"header" → "about": "Om oss"          ✓ line 553
"header" → "cart": "Varukorg"          ✓ line 554
"header" → "cart_label": "Öppna varukorg"  ✓ line 555
```

- [ ] **Step 2: Confirm cart-drawer keys exist**

Verify in `locales/sv.default.json`:
```
"cart" → "title": "Varukorg"           ✓ line 562
"cart" → "close": "Stäng varukorg"     ✓ line 563
"cart" → "empty_title": "Din varukorg är tom."  ✓ line 564
"cart" → "empty_sub": "Lägg till en produkt för att börja."  ✓ line 565
"cart" → "total_incl_vat": "Totalt inkl. moms"  ✓ line 566
"cart" → "checkout": "Till kassan"     ✓ line 567
"cart" → "footnote": "Fri frakt · Säker betalning · 30 dagars öppet köp"  ✓ line 569
"cart" → "remove": "Ta bort"           ✓ line 568
```

- [ ] **Step 3: Confirm hero + product-feature keys exist**

Verify in `locales/sv.default.json`:
```
"home" → "hero" → "reviews": "omdömen"      ✓ line 541
"home" → "hero" → "scroll_hint": "Skrolla"  ✓ line 543
```

- [ ] **Step 4: Commit verification note**

No code change needed — these keys exist. The `| default:` fallbacks are safety nets that will never fire on the Swedish storefront.

```bash
# No commit needed for this task — proceed to Task 2
```

---

## Task 2: Add missing footer locale keys

**Files:**
- Modify: `locales/sv.default.json`
- Modify: `locales/en.json`

The footer uses three `| t` calls whose keys are missing: `footer.legal_label`, plus `footer.payment` (already exists at `sections.footer.payment` — needs to be checked if the Liquid uses the right path).

- [ ] **Step 1: Check exact translation key paths used in footer.liquid**

Open `sections/footer.liquid`. Line 93 uses:
```liquid
{{ 'footer.legal_label' | t | default: 'Legal' }}
```
Line 101 uses:
```liquid
{{ 'footer.payment' | t | default: 'Payment methods' }}
```

Check `locales/sv.default.json`:
- `footer.legal_label` — **MISSING** (only `footer.nav_label` exists at line 559)
- `footer.payment` — **MISSING** at top-level `footer`; exists only at `sections.footer.payment`

Shopify resolves `'footer.payment' | t` against the top-level `footer` key, not `sections.footer`. So `sections.footer.payment` does NOT satisfy this call.

- [ ] **Step 2: Add missing keys to sv.default.json**

In `locales/sv.default.json`, find the `"footer"` block (around line 558-560):
```json
  "footer": {
    "nav_label": "Sidfot"
  },
```

Replace with:
```json
  "footer": {
    "nav_label": "Sidfot",
    "legal_label": "Juridisk information",
    "payment": "Betalningsmetoder",
    "location": "Designad i Sverige"
  },
```

- [ ] **Step 3: Add matching keys to en.json**

In `locales/en.json`, find the `"footer"` block (around line 559-561):
```json
  "footer": {
    "nav_label": "Footer"
  },
```

Replace with:
```json
  "footer": {
    "nav_label": "Footer",
    "legal_label": "Legal",
    "payment": "Payment methods",
    "location": "Designed in Sweden"
  },
```

- [ ] **Step 4: Update footer.liquid to use new locale key for location**

In `sections/footer.liquid`, line 31:
```liquid
{{ section.settings.location | default: 'Designed in Sweden' }}
```

The location text comes from a schema setting — this is correct pattern (merchant-overridable). Leave it as-is. The `'Designed in Sweden'` default in the schema setting at line 117 is a schema default, which is out of scope per our decision.

The `footer.legal_label` and `footer.payment` keys now exist — their `| default:` fallbacks will never fire.

- [ ] **Step 5: Commit**

```bash
git add locales/sv.default.json locales/en.json
git commit -m "fix(i18n): add footer.legal_label, footer.payment, footer.location locale keys"
```

---

## Task 3: Add newsletter.submit locale key

**Files:**
- Modify: `locales/sv.default.json`
- Modify: `locales/en.json`

`sections/footer.liquid` line 73 uses:
```liquid
{{ 'newsletter.submit' | t | default: 'Prenumerera' }}
```

Check `locales/sv.default.json` — the `newsletter` block has `label`, `success`, `button_label` but NOT `submit`.

- [ ] **Step 1: Add newsletter.submit to sv.default.json**

Find the `"newsletter"` block (around line 69-73):
```json
  "newsletter": {
    "label": "E-post",
    "success": "Tack för att du prenumererar",
    "button_label": "Prenumerera"
  },
```

Replace with:
```json
  "newsletter": {
    "label": "E-post",
    "success": "Tack för att du prenumererar",
    "button_label": "Prenumerera",
    "submit": "Prenumerera"
  },
```

- [ ] **Step 2: Add newsletter.submit to en.json**

Find the `"newsletter"` block (around line 69-73):
```json
  "newsletter": {
    "label": "Email",
    "success": "Thanks for subscribing",
    "button_label": "Subscribe"
  },
```

Replace with:
```json
  "newsletter": {
    "label": "Email",
    "success": "Thanks for subscribing",
    "button_label": "Subscribe",
    "submit": "Subscribe"
  },
```

- [ ] **Step 3: Commit**

```bash
git add locales/sv.default.json locales/en.json
git commit -m "fix(i18n): add newsletter.submit locale key"
```

---

## Task 4: Fix sticky-cart-bar hardcoded English labels

**Files:**
- Modify: `sections/sticky-cart-bar.liquid`
- Modify: `locales/sv.default.json`
- Modify: `locales/en.json`

`sections/sticky-cart-bar.liquid` lines 18 and 25 pass hardcoded English strings as `label:` to the `atc-form` snippet:
```liquid
label: 'Portable',
...
label: 'Wall Reel',
```

The `atc-form` snippet uses `label` as the button text prefix: `{{ btn_label }}{% if show_price %} — {{ p.price | money }}{% endif %}`. These labels show directly to customers on the sticky bar.

- [ ] **Step 1: Add sticky_bar keys to sv.default.json**

Find the `"header"` block in `locales/sv.default.json` (around line 552). Add a new `"sticky_bar"` block immediately after the `"footer"` block:

After this section:
```json
  "footer": {
    "nav_label": "Sidfot",
    "legal_label": "Juridisk information",
    "payment": "Betalningsmetoder",
    "location": "Designad i Sverige"
  },
```

Add:
```json
  "sticky_bar": {
    "portable_label": "Portabel",
    "wall_label": "Väggmonterad"
  },
```

- [ ] **Step 2: Add sticky_bar keys to en.json**

After the `"footer"` block in `locales/en.json`, add:
```json
  "sticky_bar": {
    "portable_label": "Portable",
    "wall_label": "Wall-Mount"
  },
```

- [ ] **Step 3: Update sticky-cart-bar.liquid**

In `sections/sticky-cart-bar.liquid`, replace lines 14-27:

```liquid
      <div class="v-sticky-bar__ctas">
        {%- if portable != blank -%}
          {% render 'atc-form',
              product: portable,
              classes: 'v-btn-outline',
              label: 'Portable',
              show_price: true %}
        {%- endif -%}
        {%- if wall != blank -%}
          {% render 'atc-form',
              product: wall,
              classes: 'v-btn-primary',
              label: 'Wall Reel',
              show_price: true %}
        {%- endif -%}
      </div>
```

With:
```liquid
      <div class="v-sticky-bar__ctas">
        {%- if portable != blank -%}
          {%- assign portable_label = 'sticky_bar.portable_label' | t -%}
          {% render 'atc-form',
              product: portable,
              classes: 'v-btn-outline',
              label: portable_label,
              show_price: true %}
        {%- endif -%}
        {%- if wall != blank -%}
          {%- assign wall_label = 'sticky_bar.wall_label' | t -%}
          {% render 'atc-form',
              product: wall,
              classes: 'v-btn-primary',
              label: wall_label,
              show_price: true %}
        {%- endif -%}
      </div>
```

- [ ] **Step 4: Commit**

```bash
git add sections/sticky-cart-bar.liquid locales/sv.default.json locales/en.json
git commit -m "fix(i18n): replace hardcoded English labels in sticky-cart-bar with locale keys"
```

---

## Task 5: Verify customer account pages resolve to Swedish

**Files:**
- Read: `templates/customers/login.json`
- Read: `templates/customers/register.json`
- Read: `templates/customers/account.json`
- Read: `templates/customers/addresses.json`
- Read: `templates/customers/order.json`
- Read: `templates/customers/activate_account.json`
- Read: `templates/customers/reset_password.json`

All customer account sections use `customer.*` locale keys. These are fully populated in `sv.default.json` (lines 396–505). This task verifies there are no gaps.

- [ ] **Step 1: Check customer.* keys exist for each page**

Open `locales/sv.default.json` and verify these paths exist and are Swedish:

| Key path | Expected value |
|----------|---------------|
| `customer.login_page.title` | `"Inloggning"` |
| `customer.login_page.sign_in` | `"Logga in"` |
| `customer.login_page.forgot_password` | `"Har du glömt ditt lösenord?"` |
| `customer.login_page.create_account` | `"Skapa konto"` |
| `customer.register.title` | `"Skapa konto"` |
| `customer.register.submit` | `"Skapa"` |
| `customer.account.title` | `"Konto"` |
| `customer.addresses.title` | `"Adresser"` |
| `customer.addresses.add_new` | `"Lägg till en ny adress"` |
| `customer.orders.title` | `"Orderhistorik"` |
| `customer.orders.none` | `"Du har ännu inte lagt någon order."` |
| `customer.order.title` | `"Order {{ name }}"` |
| `customer.recover_password.title` | `"Återställ ditt lösenord"` |
| `customer.reset_password.title` | `"Återställ kontolösenord"` |
| `customer.activate_account.title` | `"Aktivera konto"` |

All exist at lines 396–505. ✓ No code changes needed.

- [ ] **Step 2: No commit needed**

Customer account pages are fully translated. Proceed to Task 6.

---

## Task 6: Write merchant content translation reference doc

**Files:**
- Create: `docs/sv-content-translations.md`

This document provides proposed Swedish copy for all merchant-level content that lives in Shopify Admin (not the theme repo). The merchant copy-pastes these translations into Admin.

- [ ] **Step 1: Create the reference doc**

Create `docs/sv-content-translations.md` with this content:

```markdown
# Merchant Content — Swedish Translations

Copy-paste guide for translating all customer-facing merchant content in Shopify Admin.
Use **Admin → Online Store → Themes → ··· → Edit languages** (or Translate & Adapt app) for each item.

---

## 1. Navigation Menus
Admin path: **Online Store → Navigation**

### Main Menu (header nav)
| Current (EN) | Swedish |
|---|---|
| Home | Hem |
| Products | Produkter |
| Contact | Kontakt |
| FAQ | Vanliga frågor |
| About | Om oss |

### Footer — Products column
| Current | Swedish |
|---|---|
| Vinda Home | Vinda Home |
| Vinda Go | Vinda Go |
| All products | Alla produkter |

### Footer — Help column
| Current | Swedish |
|---|---|
| FAQ | Vanliga frågor |
| Installation | Installation |
| Shipping & Returns | Frakt & Retur |
| Contact | Kontakt |

### Footer — Company column
| Current | Swedish |
|---|---|
| About us | Om oss |
| Press | Press |
| Sustainability | Hållbarhet |

---

## 2. Products
Admin path: **Products → [product name] → Edit**

### Vinda Home (wall-mount reel)

**Title:**
```
Vinda Home
```

**Description (HTML):**
```html
<p>Väggmonterad och auto-indragande. Efter varje laddning rullas kabeln in av sig själv — inga trassel, ingen markkontakt, ingen daglig irritation.</p>
<p>IP44-klassad för utomhusbruk året om. Trefasladdning upp till 11 kW. 8 meters Typ 2-kabel. Monteras på valfri yttervägg på 30 minuter.</p>
<ul>
  <li>Effekt: 11 kW (trefas, 16 A)</li>
  <li>Kabellängd: 8 m</li>
  <li>Kontakt: Typ 2</li>
  <li>IP-klass: IP44</li>
  <li>Mått: 320 × 320 × 140 mm</li>
  <li>Vikt: 5,4 kg</li>
  <li>Garanti: 2 år</li>
</ul>
```

**SEO title (Admin → Products → [product] → Search engine listing):**
```
Vinda Home — Väggmonterad Kabelvinda 11 kW | Vinda
```

**SEO description:**
```
Auto-indragande kabelvinda för hemmaladdning. IP44, 11 kW trefas, 8 m Typ 2-kabel. Monteras på vägg — kabeln rullar in sig själv efter varje laddning.
```

---

### Vinda Go (portable reel)

**Title:**
```
Vinda Go
```

**Description (HTML):**
```html
<p>Portabel kabelvinda för elbilsladdning på resande fot. Slipp hoptrullade laddkablar i bagageluckan.</p>
<p>Fjäderbelastad auto-indragning. Passar alla bilar med Typ 2-uttag. Kompakt nog för handväskan, robust nog för daglig användning.</p>
<ul>
  <li>Effekt: 3,6 kW (enfas, 16 A)</li>
  <li>Kabellängd: upp till 5 m</li>
  <li>Kontakt: Typ 2 + universell adapter</li>
  <li>IP-klass: IP44</li>
  <li>Material: Återvinnbar slittålig plast</li>
  <li>Garanti: 2 år</li>
</ul>
```

**SEO title:**
```
Vinda Go — Portabel Kabelvinda för Elbil | Vinda
```

**SEO description:**
```
Portabel auto-indragande kabelvinda. Passar alla bilar med Typ 2-kabel. Kompakt, IP44-klassad, perfekt för resan.
```

---

## 3. Pages
Admin path: **Online Store → Pages → [page name] → Edit**

### About (Om oss)
These blocks are already translated via theme locale keys. The page content section bodies (if any are managed in Admin rich text) should be verified and updated if still in English.

### Contact (Kontakt)
Page body if set in Admin:
```
Har du frågor? Skriv till oss på info@vinda.se så svarar vi inom en arbetsdag.
```

### FAQ (Vanliga frågor)
FAQ content is managed in the theme via `templates/page.faq.json` — already fully Swedish. No Admin changes needed.

### Shipping & Returns (Frakt & Retur)
Shipping content is managed in the theme via `templates/page.shipping.json` — already fully Swedish. No Admin changes needed.

### Installation
Installation content is managed in the theme via `templates/page.installation.json` — already fully Swedish. No Admin changes needed.

---

## 4. Collections
Admin path: **Products → Collections → [collection name] → Edit**

### All products collection
**Title:** `Alla produkter`
**Description:** `Väggmonterade och portabla kabelvindor för elbilsladdning.`
**SEO title:** `Kabelvindor för Elbil — Vinda`
**SEO description:** `Vinda Home och Vinda Go. Auto-indragande kabelvindor för hem och resa. IP44, Typ 2-kontakt.`

---

## 5. Blog posts
Admin path: **Online Store → Blog posts**

If any blog posts exist in English, translate each one individually. Key fields per post:
- **Title:** translate to Swedish
- **Content:** translate body text
- **Excerpt:** translate the summary
- **SEO title:** `[Swedish title] | Vinda`
- **SEO description:** Swedish meta description (~155 chars)

Suggested first post (if none exist yet):
**Title:** `Därför samlar sig laddkabeln alltid i en hög`
**Excerpt:** `Elbilsägare vet problemet. Kabeln landar på marken, trasslar ihop sig och är alltid i vägen. Så löser Vinda det.`

---

## 6. Shop meta / General settings
Admin path: **Online Store → Preferences**

**Homepage title:**
```
Vinda — Auto-indragande Kabelvindor för Elbil
```

**Homepage meta description:**
```
Vinda bygger kabelvindor som gör elbilsladdning smidigare. Vinda Home väggmonteras och drar in kabeln automatiskt. Vinda Go åker med i bagaget.
```

---

## 7. Email notifications (reference only)
Admin path: **Settings → Notifications**

Shopify's default Swedish email templates are activated automatically when the store language is set to Swedish. Verify under Settings → Notifications that each template language is set to "Svenska". Key templates to check:
- Order confirmation
- Shipping confirmation
- Customer account welcome
- Password reset
```

- [ ] **Step 2: Commit the reference doc**

```bash
git add docs/sv-content-translations.md
git commit -m "docs: add Swedish merchant content translation reference"
```

---

## Task 7: Final verification pass

**Files:**
- Read: `sections/footer.liquid`
- Read: `sections/sticky-cart-bar.liquid`
- Read: `locales/sv.default.json`

- [ ] **Step 1: Grep for remaining English | default: fallbacks**

Run:
```bash
grep -rn "| default: '[A-Z]" sections/header.liquid sections/footer.liquid sections/cart-drawer.liquid sections/sticky-cart-bar.liquid sections/hero.liquid sections/product-feature.liquid snippets/cart-drawer-item.liquid snippets/atc-form.liquid
```

Expected output: only lines where the default value is Swedish (starts with uppercase Swedish word) or is a format string. If any English defaults remain, add the missing locale key and update the file.

- [ ] **Step 2: Grep for hardcoded English strings in customer-visible positions**

Run:
```bash
grep -rn "label: '[A-Z][a-z]" sections/sticky-cart-bar.liquid sections/product-feature.liquid
```

Expected: no output (both labels now use `| t`).

- [ ] **Step 3: Commit final verification**

```bash
git add -A
git commit -m "chore(i18n): translation sweep complete — all runtime strings resolve to Swedish"
git push
```

---

## Summary of all locale key additions

### sv.default.json additions
```json
"footer": {
  "nav_label": "Sidfot",        // existing
  "legal_label": "Juridisk information",  // NEW
  "payment": "Betalningsmetoder",         // NEW
  "location": "Designad i Sverige"        // NEW
},
"newsletter": {
  "label": "E-post",            // existing
  "success": "...",             // existing
  "button_label": "Prenumerera", // existing
  "submit": "Prenumerera"       // NEW
},
"sticky_bar": {                           // NEW block
  "portable_label": "Portabel",
  "wall_label": "Väggmonterad"
}
```

### en.json additions (lockstep)
```json
"footer": {
  "nav_label": "Footer",
  "legal_label": "Legal",
  "payment": "Payment methods",
  "location": "Designed in Sweden"
},
"newsletter": {
  "label": "Email",
  "success": "Thanks for subscribing",
  "button_label": "Subscribe",
  "submit": "Subscribe"
},
"sticky_bar": {
  "portable_label": "Portable",
  "wall_label": "Wall-Mount"
}
```
