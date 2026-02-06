-- App boosting: limited daily inventory, rotating 24h boosts, amplify score (not override).
-- Non-pay-to-win: boosts lift trending score; ranking stays merit-based.

create table if not exists public.app_boosts (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  multiplier numeric not null default 0.5 check (multiplier >= 0 and multiplier <= 2)
);

create index if not exists app_boosts_ends_at_idx on public.app_boosts(ends_at);
create index if not exists app_boosts_app_id_idx on public.app_boosts(app_id);

alter table public.app_boosts enable row level security;

drop policy if exists "app_boosts_select" on public.app_boosts;
drop policy if exists "app_boosts_insert_owner" on public.app_boosts;

-- Anyone can read (to compute boosted trending score)
create policy "app_boosts_select"
  on public.app_boosts for select
  using (true);

-- Only app owner can insert (Pro + slot limit enforced in app)
create policy "app_boosts_insert_owner"
  on public.app_boosts for insert
  with check (
    app_id in (select id from public.apps where owner_id = auth.uid())
  );

grant select on public.app_boosts to anon, authenticated;
grant insert on public.app_boosts to authenticated;

comment on table public.app_boosts is 'Time-limited boosts amplify trending score; limited slots per day, rotate when expired.';
comment on column public.app_boosts.multiplier is 'Score multiplier lift (e.g. 0.5 = 50% boost).';
