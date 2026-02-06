-- Private app analytics for creators: page views, demo/repo clicks.
-- Only app owner can read. Insert allowed for anon + authenticated (server + client record events).

create type app_analytics_event_type as enum ('page_view', 'demo_click', 'repo_click');

create table if not exists public.app_analytics_events (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  event_type app_analytics_event_type not null,
  created_at timestamptz not null default now()
);

create index if not exists app_analytics_events_app_id_idx on public.app_analytics_events(app_id);
create index if not exists app_analytics_events_created_at_idx on public.app_analytics_events(created_at desc);

alter table public.app_analytics_events enable row level security;

drop policy if exists "app_analytics_events_insert" on public.app_analytics_events;
drop policy if exists "app_analytics_events_select_owner" on public.app_analytics_events;

-- Server (page view) and client (link clicks) can insert; no PII stored
create policy "app_analytics_events_insert"
  on public.app_analytics_events for insert
  with check (true);

-- Only app owner can read their app's events (aggregated in app)
create policy "app_analytics_events_select_owner"
  on public.app_analytics_events for select
  using (
    app_id in (select id from public.apps where owner_id = auth.uid())
  );

-- Allow anon to insert (page views from logged-out visitors)
grant insert on public.app_analytics_events to anon;
grant insert on public.app_analytics_events to authenticated;
grant select on public.app_analytics_events to authenticated;

comment on table public.app_analytics_events is 'Private analytics: page views and link clicks. Only app owner can read.';
