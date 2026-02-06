-- Creator Pro subscription: tier, expiry, "Featured for 24h" token (1/month).
-- Never charge users to use apps; charge creators to accelerate outcomes.

alter table public.profiles
  add column if not exists subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'pro')),
  add column if not exists pro_until timestamptz;

comment on column public.profiles.subscription_tier is 'free | pro; Pro unlocks advanced analytics, priority review, featured token, branding.';
comment on column public.profiles.pro_until is 'When Pro expires; null = not Pro or lifetime.';

create table if not exists public.pro_featured_uses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  featured_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists pro_featured_uses_expires_at_idx on public.pro_featured_uses(expires_at);
create index if not exists pro_featured_uses_user_id_idx on public.pro_featured_uses(user_id);

alter table public.pro_featured_uses enable row level security;

drop policy if exists "pro_featured_uses_select" on public.pro_featured_uses;
drop policy if exists "pro_featured_uses_insert_owner" on public.pro_featured_uses;

-- Anyone can read (to show featured apps on homepage/list)
create policy "pro_featured_uses_select"
  on public.pro_featured_uses for select
  using (true);

-- Only app owner can insert (Pro + token check enforced in app)
create policy "pro_featured_uses_insert_owner"
  on public.pro_featured_uses for insert
  with check (
    app_id in (select id from public.apps where owner_id = auth.uid())
  );

grant select on public.pro_featured_uses to anon, authenticated;
grant insert on public.pro_featured_uses to authenticated;

comment on table public.pro_featured_uses is 'Pro "Featured for 24h" token uses; 1 per month per Pro creator.';

-- Grant Pro for testing: update public.profiles set subscription_tier = 'pro', pro_until = null where username = '...';
