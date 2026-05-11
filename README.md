# Ubud Jungle Ballers — Website

A scroll-driven static site for the football club. Built with vanilla HTML/CSS/JS + a Three.js football-globe and a CSS-driven jungle parallax sequence. **No build step, no framework, no server-side anything.**

---

## Local preview

ES modules can't load from `file://`, so open via a local web server.

**Easiest (macOS):** double-click `start.command`. Opens a Python server on port 8765 and pops the page in your browser.

**Manual:**
```bash
cd "/path/to/website"
python3 -m http.server 8765
# then http://localhost:8765
```

---

## Push to GitHub

The website is self-contained in this folder — push only this folder, not the whole `Ubud Jungle Ballers` parent (which holds private business plan docs).

From inside the `website/` folder:

```bash
# 1. Initialise a git repo here (one-time)
git init -b main

# 2. Stage and commit
git add .
git commit -m "Initial site"

# 3. Create the GitHub repo (UI or gh CLI)
#    Option A — via the web UI:
#      Go to https://github.com/new → name it `ubud-jungle-ballers` (or anything you like)
#      Don't add a README/.gitignore from the UI (we have them already)
#      Then run the suggested git remote add + git push command on the next page.
#
#    Option B — with the gh CLI installed (recommended):
gh repo create ubud-jungle-ballers --public --source=. --remote=origin --push
```

After this, your repo is on GitHub and every `git push` updates it.

---

## Deploy to Vercel

Vercel auto-detects static sites. Three minutes end-to-end:

1. Go to <https://vercel.com/signup> and sign up with **GitHub** (uses the same login).
2. On the dashboard, click **Add New → Project**.
3. Pick the `ubud-jungle-ballers` repo you just pushed.
4. On the configure screen:
   - **Framework Preset**: `Other`
   - **Root Directory**: leave as `./` (or whatever the website folder is — pick the one containing `index.html`)
   - **Build Command**: leave empty
   - **Output Directory**: leave empty
5. Click **Deploy**.

Vercel will give you a URL like `ubud-jungle-ballers.vercel.app` within ~30 seconds. From then on, every `git push` to `main` auto-deploys.

### Custom domain

In Vercel's project → **Settings → Domains**, add `ubudjungleballers.com` (or whatever you've registered). Vercel walks you through pointing the DNS A/CNAME records — once propagated (usually < 1 hour), the site is live on that domain with automatic HTTPS.

---

## What lives where

| Path | Purpose |
|---|---|
| `index.html` | Page structure & content |
| `style.css` | All styling (~2.5k lines, brand tokens + Claude-design tokens) |
| `main.js` | Three.js globe scene, scroll-progress driver, country lift |
| `players.js` | Mock player nationality data for the globe |
| `squads.js` | Mock rosters for the squad picker |
| `vendor/` | Three.js + OrbitControls + Earth texture + earcut (vendored, no CDN required) |
| `assets/` | Logos, jungle SVGs, club mockup images, badge |
| `start.command` | Double-click launcher for local preview |

---

## Tweaking content

- **Squad rosters**: edit `squads.js` — each tier has 15 players with `number, name, position, flag, role?`
- **Player-nationality globe markers**: edit `players.js` — `lat`, `lon`, `iso` (ISO 3166-1 numeric) drive what countries light up
- **Hero copy / sections**: directly in `index.html`
- **Brand palette**: CSS variables at the top of `style.css` (`--bg`, `--gold`, `--ink`, etc.)
- **Mock club images**: `assets/club/` — swap files in place (keep filenames the same OR update `index.html` references)

---

## Performance notes

- Total page weight ≈ 12 MB on first load. Biggest contributors:
  - Canva-generated jungle SVGs with embedded PNGs (~7 MB combined)
  - Earth blue-marble texture (~1.4 MB)
  - Three.js bundle (~1.2 MB)
- If you want to optimize later: convert the Canva SVGs to compressed PNGs (≈80% smaller) — they wrap embedded rasters anyway.
- The site uses pure static assets, so Vercel's edge cache makes repeat loads instant.

---

## License

The site code is yours. Third-party assets used:
- Three.js — MIT
- Earth blue marble texture — public domain (from NASA via three-globe)
- earcut.js — ISC
- Natural Earth countries data — public domain
- Unsplash images in the Club section — Unsplash license (free, attribution appreciated)
- Inter, Anton, Archivo, JetBrains Mono, Bricolage Grotesque, Playfair Display, Bebas Neue — Google Fonts (open)
