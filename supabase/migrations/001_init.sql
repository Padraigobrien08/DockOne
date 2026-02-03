-- DockOne initial schema: profiles, apps, app_tags, app_media, votes.
-- Apply in Supabase: SQL Editor or via Supabase CLI (see notes at end).

-- Enums
create type app_status as enum ('pending', 'approved', 'rejected');

create type app_media_kind as enum ('screenshot', 'logo');

-- Profiles (1:1 with auth.users; create via app on first login)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create index profiles_username_idx on public.profiles(username);

-- Apps
create table public.apps (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  name text not null,
  tagline text,
  description text,
  status app_status not null default 'pending',
  app_url text,
  repo_url text,
  demo_video_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index apps_owner_id_idx on public.apps(owner_id);
create index apps_status_idx on public.apps(status);
create index apps_slug_idx on public.apps(slug);

-- App tags (unique per app)
create table public.app_tags (
  app_id uuid not null references public.apps(id) on delete cascade,
  tag text not null,
  primary key (app_id, tag)
);

create index app_tags_tag_idx on public.app_tags(tag);

-- App media
create table public.app_media (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.apps(id) on delete cascade,
  kind app_media_kind not null,
  url text not null,
  sort_order int not null default 0
);

create index app_media_app_id_idx on public.app_media(app_id);

-- Votes (future-ready; not exposed yet)
create table public.votes (
  app_id uuid not null references public.apps(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (app_id, user_id)
);

create index votes_app_id_idx on public.votes(app_id);

-- updated_at trigger for apps
create or replace function public.set_apps_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger apps_updated_at
  before update on public.apps
  for each row execute function public.set_apps_updated_at();

-- Helper: is current user an admin? (table-based; set profiles.is_admin in Supabase or via admin)
create or replace function public.is_admin()
returns boolean as $$
  select coalesce(
    (select is_admin from public.profiles where id = auth.uid()),
    false
  );
$$ language sql security definer stable set search_path = public;

-- RLS: enable on all tables
alter table public.profiles enable row level security;
alter table public.apps enable row level security;
alter table public.app_tags enable row level security;
alter table public.app_media enable row level security;
alter table public.votes enable row level security;

-- Profiles: public read; users manage own row
create policy "profiles_select_public"
  on public.profiles for select using (true);

create policy "profiles_insert_own"
  on public.profiles for insert with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id);

-- Apps: public reads approved; owners read own; authenticated insert with status=pending; owner or admin update
create policy "apps_select_approved_or_owner"
  on public.apps for select using (
    status = 'approved' or owner_id = auth.uid()
  );

create policy "apps_insert_authenticated_pending"
  on public.apps for insert
  with check (
    auth.role() = 'authenticated'
    and owner_id = auth.uid()
    and status = 'pending'
  );

-- Owner can update only non-status columns (status unchanged). Admin can update anything.
create policy "apps_update_owner_no_status_change"
  on public.apps for update
  using (owner_id = auth.uid() and status in ('pending', 'approved'))
  with check (
    owner_id = auth.uid()
    and status = (select a.status from public.apps a where a.id = apps.id)
  );

create policy "apps_update_admin"
  on public.apps for update
  using (public.is_admin())
  with check (public.is_admin());

-- App tags: visible when app visible; owner can insert/delete when app pending or approved
create policy "app_tags_select_visible"
  on public.app_tags for select using (
    exists (
      select 1 from public.apps a
      where a.id = app_id
        and (a.status = 'approved' or a.owner_id = auth.uid())
    )
  );

create policy "app_tags_insert_owner"
  on public.app_tags for insert
  with check (
    exists (
      select 1 from public.apps a
      where a.id = app_id and a.owner_id = auth.uid()
        and a.status in ('pending', 'approved')
    )
  );

create policy "app_tags_delete_owner"
  on public.app_tags for delete using (
    exists (
      select 1 from public.apps a
      where a.id = app_id and a.owner_id = auth.uid()
    )
  );

-- App media: same visibility as apps; owner can insert/update/delete when app pending or approved
create policy "app_media_select_visible"
  on public.app_media for select using (
    exists (
      select 1 from public.apps a
      where a.id = app_id
        and (a.status = 'approved' or a.owner_id = auth.uid())
    )
  );

create policy "app_media_insert_owner"
  on public.app_media for insert
  with check (
    exists (
      select 1 from public.apps a
      where a.id = app_id and a.owner_id = auth.uid()
        and a.status in ('pending', 'approved')
    )
  );

create policy "app_media_update_owner"
  on public.app_media for update using (
    exists (
      select 1 from public.apps a
      where a.id = app_id and a.owner_id = auth.uid()
    )
  );

create policy "app_media_delete_owner"
  on public.app_media for delete using (
    exists (
      select 1 from public.apps a
      where a.id = app_id and a.owner_id = auth.uid()
    )
  );

-- Votes: future-ready; no access until you add policies
create policy "votes_no_select"
  on public.votes for select using (false);

create policy "votes_no_modify"
  on public.votes for all using (false) with check (false);

-- Optional: grant usage so anon/authenticated can use tables (Supabase usually sets this)
grant usage on schema public to anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant select on public.apps to anon, authenticated;
grant select on public.app_tags to anon, authenticated;
grant select on public.app_media to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, select, update on public.apps to authenticated;
grant insert, select, delete on public.app_tags to authenticated;
grant insert, select, update, delete on public.app_media to authenticated;
