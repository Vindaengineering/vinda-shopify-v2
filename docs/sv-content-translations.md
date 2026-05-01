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

**Title:** `Vinda Home`

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

**SEO title** (Admin → Products → Search engine listing):
`Vinda Home — Väggmonterad Kabelvinda 11 kW | Vinda`

**SEO description:**
`Auto-indragande kabelvinda för hemmaladdning. IP44, 11 kW trefas, 8 m Typ 2-kabel. Monteras på vägg — kabeln rullar in sig själv efter varje laddning.`

---

### Vinda Go (portable reel)

**Title:** `Vinda Go`

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

**SEO title:** `Vinda Go — Portabel Kabelvinda för Elbil | Vinda`

**SEO description:** `Portabel auto-indragande kabelvinda. Passar alla bilar med Typ 2-kabel. Kompakt, IP44-klassad, perfekt för resan.`

---

## 3. Pages
Admin path: **Online Store → Pages → [page name] → Edit**

### About (Om oss)
Already translated via theme locale keys. Verify any Admin rich text body is Swedish.

### Contact (Kontakt)
Page body if set in Admin:
`Har du frågor? Skriv till oss på info@vinda.se så svarar vi inom en arbetsdag.`

### FAQ / Shipping & Returns / Installation
All managed in theme JSON templates — already fully Swedish. No Admin changes needed.

---

## 4. Collections
Admin path: **Products → Collections → [collection name] → Edit**

| Field | Value |
|---|---|
| Title | Alla produkter |
| Description | Väggmonterade och portabla kabelvindor för elbilsladdning. |
| SEO title | Kabelvindor för Elbil — Vinda |
| SEO description | Vinda Home och Vinda Go. Auto-indragande kabelvindor för hem och resa. IP44, Typ 2-kontakt. |

---

## 5. Blog posts
Admin path: **Online Store → Blog posts**

Translate each post individually. Fields per post: Title, Content, Excerpt, SEO title (`[Swedish title] | Vinda`), SEO description (~155 chars).

Suggested first post if none exist:
- **Title:** `Därför samlar sig laddkabeln alltid i en hög`
- **Excerpt:** `Elbilsägare vet problemet. Kabeln landar på marken, trasslar ihop sig och är alltid i vägen. Så löser Vinda det.`

---

## 6. Shop meta / General settings
Admin path: **Online Store → Preferences**

**Homepage title:** `Vinda — Auto-indragande Kabelvindor för Elbil`

**Homepage meta description:** `Vinda bygger kabelvindor som gör elbilsladdning smidigare. Vinda Home väggmonteras och drar in kabeln automatiskt. Vinda Go åker med i bagaget.`

---

## 7. Email notifications
Admin path: **Settings → Notifications**

Shopify activates Swedish email templates automatically when the store language is Swedish. Verify each template is set to "Svenska":
- Order confirmation
- Shipping confirmation
- Customer account welcome
- Password reset
