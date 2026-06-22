# King of the Jungle — tournament page setup

The tournament page lives at **`/events`** (`events.html`). It shows the
event info and a 3-step "Register a Team" flow that writes each signup to a
**Supabase** database you own (team details + the uploaded logo).

Until Supabase is wired in, the form runs in **preview mode** — it walks through
every step and shows the success screen, but nothing is stored (you'll see a
warning in the browser console). Do the steps below to go live.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> → **New project** (free tier is fine).
2. Once it's ready, open **Project Settings → API** and copy:
   - **Project URL** — e.g. `https://abcd1234.supabase.co`
   - **anon public** key (the long `eyJ...` string). This one is safe to ship in
     the website — it only allows what the policies below permit.

## 2. Create the table + logo bucket

Open **SQL Editor** in Supabase, paste this, and hit **Run**:

```sql
-- Signups table
create table if not exists public.tournament_signups (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  team_name      text not null,
  admin_name     text not null,
  admin_whatsapp text not null,
  roster_size    int,
  logo_url       text
);

alter table public.tournament_signups enable row level security;

-- Allow anyone on the website to register a team (insert only)
create policy "anon can register a team"
  on public.tournament_signups
  for insert to anon
  with check (true);
```

Then create the logo storage bucket:

1. **Storage → New bucket** → name it exactly `team-logos` → tick **Public bucket**.
2. **Important — set server-side limits on the bucket** (the JS checks are only a
   convenience; the anon key is public, so anyone could otherwise POST directly):
   - **Restrict file size**: `4 MB`
   - **Allowed MIME types**: `image/png, image/jpeg, image/webp`
     (deliberately **no SVG** — SVGs can carry scripts and the bucket is public.)
   You can set these when creating the bucket, or later under the bucket's settings.
3. Back in **SQL Editor**, run this so the public form can upload to it:

```sql
create policy "anon can upload team logos"
  on storage.objects
  for insert to anon
  with check (bucket_id = 'team-logos');
```

> Signups are **insert-only** for the public — nobody can read the list from the
> website. You read entries privately in the Supabase dashboard (next step).
> The bucket's size + MIME limits above are the real enforcement boundary; the
> in-page validation just gives users a nicer error before they upload.

## 3. Add your keys via `.env.local` (not in the code)

Keys are **never** hard-coded. They live in `.env.local` (gitignored) and are
baked into a generated `env.js` (also gitignored) that the page loads.

**Local dev:**

```bash
cp .env.example .env.local          # first time only
# edit .env.local and paste your two values:
#   SUPABASE_URL=https://abcd1234.supabase.co
#   SUPABASE_ANON_KEY=eyJhbGciOi...
node scripts/gen-env.mjs            # regenerates env.js
```

Reload the page — the form now stores every team for real. (With the values
blank it stays in harmless "preview mode" and stores nothing.)

**On Vercel:** Project Settings → **Environment Variables** → add `SUPABASE_URL`
and `SUPABASE_ANON_KEY`. The deploy runs `node scripts/gen-env.mjs`
automatically (see `vercel.json` `buildCommand`) to produce `env.js` from them —
so keys live only in Vercel, never in the repo.

> The anon key is the **public** key (safe in the browser). Never put the
> `service_role` / secret key in `.env.local` or anywhere client-side.

## 4. Fill in the fee + payment details

These aren't secrets (they're shown on the page), so they live in
**`tournament.js` → `CONFIG`**. They render automatically across the page and on
the success screen:

```js
feeAmount: 1500000,   // a NUMBER in IDR — formatted per language by Intl
bankName:      'BCA',
accountName:   'Ubud Jungle Ballers',
accountNumber: '0000000000',
ewalletName:   'GoPay / OVO',
ewalletNumber: '+62 812-0000-0000',
whatsappAdmin: '6281234567890',   // line teams send payment proof to
```

`feeAmount` is a plain number: it renders as `IDR 1,500,000` in English and
`Rp 1.500.000` in Indonesian automatically. The "per team" caption is a
translation (`tour.feeNote` in `i18n/en.json` + `i18n/id.json`), not a CONFIG
value.

The remaining descriptive copy (deadline, prize wording, etc.) lives in
**`events.html`** — search for `<!-- EDIT` comments. Anything wrapped in
`data-i18n="…"` also needs its Bahasa text in `i18n/id.json` (then rebuild).
(Date, venue, format and the rules are already filled in.)

## 5. See who registered

Supabase dashboard → **Table Editor → `tournament_signups`**. Each row is a team;
`logo_url` links to the uploaded crest. You can export to CSV from there.

---

### Notes
- **No backend, no framework** — the page talks to Supabase's REST + Storage APIs
  directly over `fetch`. The only "build" is `scripts/gen-env.mjs` writing
  `env.js` from your env vars (a few milliseconds, pure Node, no dependencies);
  the site stays static otherwise.
- **Keys are never committed** — `.env.local` and `env.js` are gitignored; only
  `.env.example` (a blank template) is in the repo.
- Logos are capped at **4 MB** and must be raster images (PNG/JPG/WEBP).
- Free tier limits are generous (500 MB DB, 1 GB storage) — plenty for one event.
