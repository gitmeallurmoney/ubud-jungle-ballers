# Club member sign-ups → Supabase

The "Join our club" flow on the homepage (the 5-step modal) stores every
sign-up in Supabase, then sends the new member to the WhatsApp community group.

It reuses the **same Supabase project + keys** as the tournament page (loaded
from `env.js` → `window.__ENV`; see `SETUP-TOURNAMENT.md`). You only need to
create the table below. Until it exists, the flow runs in harmless "preview
mode" — members still reach the success screen and the WhatsApp group, but
nothing is stored (a warning is logged to the browser console).

## 1. Create the table + insert policy

Supabase dashboard → **SQL Editor** → run:

```sql
create table if not exists public.club_signups (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text not null,
  age            int,
  nationality    text,
  bali_timeframe text,          -- long | short | visiting
  level          text,          -- fun | higher | compete
  positions      text[],        -- e.g. {GK, MID}
  sessions       text[]         -- e.g. {Mon, Wed, Fri}
);

alter table public.club_signups enable row level security;

-- Anyone on the site can submit a sign-up (insert only)
create policy "anon can join the club"
  on public.club_signups
  for insert to anon
  with check (true);
```

That's it — sign-ups now land in the table.

## 2. See who joined

Supabase dashboard → **Table Editor → `club_signups`**. Each row is a new
member with their level, preferred position(s) and which sessions they can make.
Export to CSV from there.

---

### Notes
- **Insert-only / private**: like the tournament table, the public can submit but
  cannot read the list back — you read it in the dashboard.
- **Best-effort**: the sign-up is stored in the background; if the network
  hiccups the member is never blocked from joining the WhatsApp community (the
  failure is logged to the console). Storage succeeds on the normal path.
- The keys live in `.env.local` / Vercel env vars — never committed. The club
  flow and the tournament flow share them.
