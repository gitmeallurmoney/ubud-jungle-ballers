# Ubud Jungle Ballers — website

Marketing site for a football club based in Ubud, Bali. Static HTML/CSS/JS with a vendored Three.js globe — **no framework, no bundler, no server-side rendering**. A tiny Node codegen step (Supabase env keys + the Bahasa Indonesia pages) runs on deploy and locally; there is no npm dependency tree. Deployed on Vercel via GitHub push.

The parent directory `../` holds private business plan + governance docs — only the `website/` folder is published.

---

## ⚑ Agent rules — read before editing

This is a **bilingual (EN + ID)**, **no-bundler** static site with a deliberate visual identity. Three rules are non-negotiable; the rest of this doc is reference.

### 1. Translate every user-facing string (no exceptions)

Both languages are first-class — English at `/` + `/events`, Bahasa Indonesia at `/id/` + `/id/events`. **Any** copy a visitor can read must exist in both. Two mechanisms:

- **Static HTML** → tag it: `data-i18n="key"` (element text) or `data-i18n-attr="attr:key"` (an attribute like `placeholder`/`aria-label`/`alt`/`content`). The English text stays inline; the build renders the `/id/` pages from `i18n/id.json`.
- **JS-generated text** → call the global `t('key')` (or `t('key', { n })` to interpolate). **Never hardcode a visible string in JS.**

For every new or changed string:
1. Add the key to **both** `i18n/en.json` and `i18n/id.json` — same path, same shape (they must stay key-for-key in parity).
2. Run `node scripts/build-i18n.mjs`. It **warns** on any key missing/extra between the catalogs — keep it silent.
3. If your JS renders translated content, re-render it on the document `i18n:changed` event (the EN/ID toggle switches in place — see `i18n/README.md`).

**Numbers, currency, dates, country names** → use the locale-aware helpers, never hardcode: `UBJ_I18N.formatCurrency(1500000,'IDR')` → `IDR 1,500,000` / `Rp 1.500.000`; also `.formatNumber`, `.formatDate`, `.countryName`.

**Gotchas:** never nest a `data-i18n` inside another `data-i18n` value (the build replaces inner HTML by key — inline the text or use a runtime-filled `data-cfg` span). **Do not translate** brand/proper nouns: `Ubud Jungle Ballers`, `Jungle Kings Cup` (the tournament), `Welcome to the Jungle`, `Liga Raya`, sponsor names, player names, position codes (GK/DEF/MID/FWD), `SALAM HIJAU`.

Audit before finishing: `node scripts/build-i18n.mjs` (warns on keys missing from `id.json`) **and** `node scripts/scan-i18n.mjs` (lists any visible text not wrapped in `data-i18n` — exits non-zero if it finds untranslated copy). Both must be clean. Full guide: **`i18n/README.md`**.

### 2. Match the visual identity

Editorial, premium, jungle. Don't introduce new fonts, colours, or bespoke component styles — reuse what's there.

- **Colours:** only the CSS tokens (`var(--bg)`, `--bg-2`, `--bg-3`, `--line`, `--ink`, `--ink-dim`, `--gold`, `--gold-2`). Never hardcode a hex. **Gold is the only accent** — use it sparingly, for CTAs and highlights.
- **Type:** `.display` (Anton) for headlines; `.mono` (JetBrains Mono, UPPERCASE, wide `letter-spacing`) for eyebrows / labels / metadata; Archivo for body. Section eyebrows follow the `0X / NAME` mono pattern.
- **Components:** buttons are `.btn.btn--gold` / `.btn.btn--ghost`; sections use the `.cd-section` rhythm with hairline (`--line`) borders and generous whitespace.
- **Motion:** animate **`transform`/`opacity` only** — never `width`/`height` (it caused flicker on the scroll-pinned hero).
- **Responsive:** the breakpoint is **≤960px** (with ≤600px tweaks) — hamburger drawer, bottom sheets. Test both.

### 3. Respect the no-bundler architecture

- No npm packages, no frameworks, no build tooling beyond the two Node codegen scripts. Match the existing vanilla patterns.
- Shared assets/scripts are referenced **root-absolute** (`/style.css`, `/assets/…`, `/vendor/…`, `/main.js`) so the `/id/` pages resolve them; keep new ones root-absolute. **Page-to-page links stay relative** (`tournament.html`, `index.html#about`) so navigation keeps the active locale.
- After editing copy or i18n, **rebuild** (`node scripts/build-i18n.mjs`) and **verify both languages in the browser** — the `/id/` pages and `i18n/strings.js` are generated (git-ignored).

---

## Quick start

```bash
# Local preview — ES modules can't load from file://, so use a server.
python3 -m http.server 8765
# then http://localhost:8765
```

Or double-click `start.command` (macOS launcher that does the above and opens the browser).

Deploy: every `git push` to `main` triggers an auto-deploy on Vercel.

---

## File map

| Path | Purpose |
|---|---|
| `index.html` | Page structure, all sections, inline scripts (nav drawer, squad picker, join modal) |
| `style.css` | All styling, ~3100 lines. Tokens at top, then sections, then mobile media queries |
| `main.js` | Three.js scene: football-globe, scroll-driven hero cinematic, country lift/focus |
| `players.js` | Mock player nationalities for the globe (lat/lon/iso) |
| `squads.js` | Mock rosters for the squad-picker (3 tiers × 15 players) |
| `vendor/` | Three.js + OrbitControls + earcut + earth texture + Natural Earth GeoJSON — all vendored, no CDN |
| `assets/` | Logos, jungle SVGs, club mockup photos, badge, favicon |
| `start.command` | Double-click launcher (macOS) |

---

## Design system

Claude-design tokens live at the top of `style.css`:

```
--bg:      #0a1f15   (deep jungle green — page background)
--bg-2:    #0e2a1c   (panels, cards)
--bg-3:    #133525   (inputs, recessed elements)
--line:    #1f4530   (hairlines, borders)
--ink:     #f3ecdc   (primary text — warm off-white)
--ink-dim: #b9b59c   (secondary text)
--gold:    #e8b339   (CTAs, accents)
--gold-2:  #f3c861   (hover)
```

Type:

- `display` class — Anton, big condensed sans for headlines
- `mono` class — JetBrains Mono, all caps, wide letterspacing — used for eyebrows, labels, metadata
- Body — Archivo

Buttons: `.btn.btn--gold` (filled gold) and `.btn.btn--ghost` (outlined).

---

## Architecture: scroll-pinned hero

The hero is a sticky-pinned cinematic. A 200vh anchor section pins the hero for two viewports of scroll; during that range:

- `--scroll-progress` (0 → 1) drives hero text translateX, globe scale, and badge fade
- `--jungle-progress` (0 → 1) drives the parallax jungle layers behind the globe
- The Three.js scene reads these from `getComputedStyle` each frame

Scroll-driver code lives in `main.js`. CSS animations are all `transform`/`opacity` — never `width`/`height` (caused flicker on early prototypes).

---

## Architecture: globe → country interaction

`main.js`:

1. SphereGeometry + canvas-baked texture (Earth jpg + truncated-icosahedron seams + country borders + stitching) — looks like a football, behaves like a globe
2. Click → raycast sphere → `vec3ToLonLat` → point-in-polygon test against `vendor/countries-110m.geo.json`
3. If a player nationality matches the country, lift it as a 3D plateau (earcut triangulation) and SLERP camera to centre on it
4. Open the country panel (desktop side panel) or country popover + bottom sheet (mobile, ≤960px)

---

## Mobile patterns (≤960px breakpoint, with ≤600px tweaks)

- **Hamburger drawer**: nav links collapse, burger reveals a full-height drawer with backdrop + body scroll lock
- **Country popover + bottom sheet**: replaces desktop side panel — compact card at viewport bottom, taps open a translateY(100%→0) sheet
- **Squad picker**: 3-column horizontal tier tabs, tapping a player opens a `.player-sheet` bottom-sheet
- **Club section**: uses `display: contents` on `.club-copy`/`.club-media` + explicit `order: N` on children to re-stitch the desktop two-column layout into a natural single-column mobile flow

---

## Join-our-club onboarding modal

5-step modal opened from any `[href="#join"]` link (intercepted via JS) and from the Yellow CTA section's WhatsApp button. Steps:

1. Name + Age
2. Nationality + Bali timeframe (long/short/visiting)
3. Level (fun / higher / compete) — routes them to the right session tier
4. Position (GK / DEF / MID / FWD / Anywhere)
5. Sessions (Mon training / Wed social / Thu social / Fri squad — all 7 PM)

On submit, all data is encoded into a `wa.me?text=...` URL with a pre-formatted summary so the admin gets every field in one tap. The WhatsApp number is hardcoded as `WA_NUMBER = '6281234567890'` near the top of the modal `<script>` — update when the real club line is live.

Mobile renders as a bottom sheet (slides up from `translateY(100%)`), desktop as a centered card. Modal sits at `z-index: 200`, above country sheet (110), nav (100), and everything else.

---

## Gotcha: HTML `hidden` attribute vs `display: flex`

Several elements in the join modal use the `hidden` attribute for show/hide (`.join-step`, `.join-modal-foot`, eyebrow text variants). If you write CSS like `.foo { display: flex }`, it **overrides** the UA stylesheet's `[hidden] { display: none }` rule, and the element stays visible.

Always pair `display: flex/grid/block` rules with an explicit `.foo[hidden] { display: none !important }` rule. This bit us twice — once with `.join-step` (all 5 steps rendered stacked, step 5 checkboxes intercepted step 1's Continue click), once with `.join-modal-foot` (Back/Continue showed on the success screen).

---

## Gotcha: stale element references after `innerHTML =`

Setting `parent.innerHTML = '<span id="x">...'` destroys the original `#x` element and creates a new one with the same id. Any JavaScript variable that still points to the original is now detached — `.parentElement` is null, and writes silently throw.

In the join modal, the original `showStep()` did `stepNum.parentElement.innerHTML = ...` to swap the eyebrow text. After the first call, every subsequent call threw at that line, which cascaded: progress bar stuck, footer wouldn't hide on success. The fix was pre-rendering two sibling spans (`.join-eyebrow-progress` + `.join-eyebrow-done`) and toggling their `hidden` attributes — no innerHTML thrash.

---

## Internationalization (EN / ID)

The site is bilingual: English at `/` + `/events`, Bahasa Indonesia at `/id/` + `/id/events`. Full guide in `i18n/README.md`. In short:

- Strings live in `i18n/en.json` + `i18n/id.json` (`id` mirrors `en` key-for-key).
- Static HTML is tagged `data-i18n="key"` / `data-i18n-attr="attr:key"`; English stays inline, and `scripts/build-i18n.mjs` pre-renders the `/id/*.html` pages by swapping in `id.json`. JS-generated text calls the global `t('key')`.
- The build also generates `i18n/strings.js` (runtime catalog). Both `i18n/strings.js` and `/id/` are git-ignored — produced by `vercel.json`'s build command and by `start.command` locally. **Re-run `node scripts/build-i18n.mjs` after editing the JSON or any tagged copy.**
- Numbers/currency/country names use the `Intl` formatters in `i18n/i18n.js` (`UBJ_I18N.formatCurrency`, `.countryName`). The tournament fee is `CONFIG.feeAmount` (a number) formatted per-locale.
- **Gotcha:** never nest a `data-i18n` inside another `data-i18n` value (the build replaces inner HTML by key) — inline the text, or use a runtime-filled `data-cfg` span.

---

## Tweaking content

- **Squad rosters** → `squads.js`. Each tier (`first-team`, `second-team`, `fun-first`) has 15 players with `{ number, name, position, flag, role? }`
- **Player-nationality globe markers** → `players.js`. Each entry needs `iso` (ISO 3166-1 numeric, not alpha), `lat`, `lon`
- **Hero copy + section copy** → directly in `index.html` (then mirror the change into `i18n/en.json` + `i18n/id.json` and rebuild — see the i18n section above)
- **Brand palette** → CSS variables at top of `style.css`
- **Club mockup photos** → `assets/club/`. Swap files in place keeping filenames, or update `index.html` references

---

## QA workflow

Visual QA via Playwright headless:

```bash
pip3 install --break-system-packages playwright
playwright install chromium
# Then write a script that drives the page; we used /tmp-style scripts during dev.
```

The join modal flow was verified at 1280×800 and 390×844 by clicking through all 5 steps, asserting the step counter advances, the progress bar fills, and the success screen renders without Back/Continue. Saved screenshots into the scratchpad for inspection.

---

## Performance notes

Total first-load weight ~12 MB, dominated by:
- Canva-generated jungle SVGs with embedded PNGs (~7 MB combined) — converting to compressed PNGs would cut ~80%
- Earth blue-marble texture (~1.4 MB)
- Three.js bundle (~1.2 MB)

Pure static assets so Vercel edge cache makes repeat loads instant.
