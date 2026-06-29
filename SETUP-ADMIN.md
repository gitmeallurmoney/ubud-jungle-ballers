# Admin dashboard — one-time Supabase setup

The admin dashboard lives at **`/admin`** (not linked from the public site, `noindex`).
Admins sign in with **email + password** via Supabase Auth and can review + manage the
**tournament team registrations** (`tournament_signups`) and **member sign-ups**
(`club_signups`).

Access model:

- The **first person to sign up automatically becomes the owner** (admin).
- Everyone who signs up after that lands in a **pending** state — an existing admin
  approves them from the dashboard's **Admins** tab before they can see any data.
- Row-Level Security (RLS) enforces all of this in the database, so the data is never
  readable by the public anon key — only by approved admins' logged-in sessions.

Run the SQL below **once** in **Supabase → SQL Editor**, then do the one Auth setting in
step 3. The public sign-up forms keep working unchanged (their insert-only policies are
untouched).

---

## 1. Tables, helper, and the first-admin trigger

```sql
-- Approved admins (allowlist). One row per admin.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

-- People who signed up but aren't approved yet.
create table if not exists public.admin_requests (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  email        text,
  requested_at timestamptz not null default now()
);

alter table public.admins         enable row level security;
alter table public.admin_requests enable row level security;

-- Helper: is the current user an approved admin?
-- SECURITY DEFINER so it bypasses RLS (no recursive-policy problems).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- On every new auth user: first one becomes owner, everyone else becomes a request.
create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.admins) = 0 then
    insert into public.admins (user_id, email) values (new.id, new.email);
  else
    insert into public.admin_requests (user_id, email)
    values (new.id, new.email)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_admin_user();
```

## 2. RLS policies

```sql
-- ---- admins: an admin sees all admins; a user can see their own row ----
drop policy if exists "read admins" on public.admins;
create policy "read admins" on public.admins
  for select to authenticated
  using (public.is_admin() or user_id = auth.uid());

drop policy if exists "admins add admins" on public.admins;
create policy "admins add admins" on public.admins
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "admins remove admins" on public.admins;
create policy "admins remove admins" on public.admins
  for delete to authenticated
  using (public.is_admin());

-- ---- admin_requests: admins see all; a user sees their own pending request ----
drop policy if exists "read requests" on public.admin_requests;
create policy "read requests" on public.admin_requests
  for select to authenticated
  using (public.is_admin() or user_id = auth.uid());

drop policy if exists "self request" on public.admin_requests;
create policy "self request" on public.admin_requests
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "admins clear requests" on public.admin_requests;
create policy "admins clear requests" on public.admin_requests
  for delete to authenticated
  using (public.is_admin() or user_id = auth.uid());

-- ---- tournament_signups: admins can read / update status / delete ----
-- (the existing "anon can register a team" insert policy stays as-is)
alter table public.tournament_signups
  add column if not exists status text not null default 'pending';   -- pending | paid | confirmed

drop policy if exists "admins read teams" on public.tournament_signups;
create policy "admins read teams" on public.tournament_signups
  for select to authenticated using (public.is_admin());

drop policy if exists "admins update teams" on public.tournament_signups;
create policy "admins update teams" on public.tournament_signups
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins delete teams" on public.tournament_signups;
create policy "admins delete teams" on public.tournament_signups
  for delete to authenticated using (public.is_admin());

-- ---- club_signups: admins can read / delete ----
drop policy if exists "admins read members" on public.club_signups;
create policy "admins read members" on public.club_signups
  for select to authenticated using (public.is_admin());

drop policy if exists "admins delete members" on public.club_signups;
create policy "admins delete members" on public.club_signups
  for delete to authenticated using (public.is_admin());
```

> If `tournament_signups` or `club_signups` don't exist yet, create them first via
> **SETUP-TOURNAMENT.md** / **SETUP-CLUB.md**.

## 3. One Auth setting

**Supabase → Authentication → Providers → Email** → turn **OFF "Confirm email"**.

This makes a new sign-up usable immediately (no inbox round-trip), which is what the
dashboard expects for a small internal tool. (If you leave it ON, a new admin must click
the confirmation link in their email before they can log in — the dashboard will tell
them to check their inbox.)

Leave **"Enable sign-ups"** ON so people can self-register (they still need approval).

## 4. Use it

1. Deploy / open **`/admin`**.
2. **Sign up** with your email + password → you become the **owner** automatically.
3. Anyone else who signs up appears under **Admins → Pending** for you to approve.

The same `SUPABASE_URL` + `SUPABASE_ANON_KEY` env vars the public site already uses power
the dashboard — no new keys. The service-role key is **never** used in the browser.

---

## Troubleshooting

**"I signed up but I'm stuck on 'awaiting approval' / can't see data."**
The first-admin trigger only fires on *new* sign-ups, so if you created your account
**before** running the SQL above, you won't be in `admins`. Promote yourself once:

```sql
insert into public.admins (user_id, email)
select id, email from auth.users where email = 'you@club.com'
on conflict (user_id) do nothing;
delete from public.admin_requests where email = 'you@club.com';
```

**A new admin gets a 404 / "relation does not exist" on sign-in.**
The `admins` / `admin_requests` tables (step 1) haven't been created yet — run the SQL.

**Sign-up says "check your email" and never logs in.**
Email confirmation is still ON — see step 3, or click the link in the confirmation email.
