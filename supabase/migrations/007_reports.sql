-- Reports: users can report an app; admins can read. Idempotent: safe to run again.

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists reports_app_id_idx on public.reports(app_id);
create index if not exists reports_created_at_idx on public.reports(created_at desc);

alter table public.reports enable row level security;

drop policy if exists "reports_insert_own" on public.reports;
drop policy if exists "reports_select_admin" on public.reports;

-- Authenticated users can insert their own report
create policy "reports_insert_own"
  on public.reports for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- Only admins can read reports
create policy "reports_select_admin"
  on public.reports for select
  using (public.is_admin());

grant insert on public.reports to authenticated;
grant select on public.reports to authenticated;
