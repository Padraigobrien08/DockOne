-- Collections & curation: staff picks, community collections, "Best BYOK", "Best dev utilities".
-- Editorial authority, SEO, repeat visits.

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  owner_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists collections_slug_idx on public.collections(slug);
create index if not exists collections_owner_id_idx on public.collections(owner_id);
create index if not exists collections_updated_at_idx on public.collections(updated_at desc);

comment on table public.collections is 'Staff picks and community-curated collections. owner_id null = staff-only editable.';

create table if not exists public.collection_apps (
  collection_id uuid not null references public.collections(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  sort_order int not null default 0,
  primary key (collection_id, app_id)
);

create index if not exists collection_apps_collection_id_idx on public.collection_apps(collection_id);
create index if not exists collection_apps_app_id_idx on public.collection_apps(app_id);

alter table public.collections enable row level security;
alter table public.collection_apps enable row level security;

drop policy if exists "collections_select" on public.collections;
drop policy if exists "collections_insert" on public.collections;
drop policy if exists "collections_update" on public.collections;
drop policy if exists "collections_delete" on public.collections;

create policy "collections_select" on public.collections for select using (true);
create policy "collections_insert" on public.collections for insert
  with check (owner_id = auth.uid() or (owner_id is null and public.is_admin()));
create policy "collections_update" on public.collections for update
  using (owner_id = auth.uid() or (owner_id is null and public.is_admin()));
create policy "collections_delete" on public.collections for delete
  using (owner_id = auth.uid() or (owner_id is null and public.is_admin()));

drop policy if exists "collection_apps_select" on public.collection_apps;
drop policy if exists "collection_apps_insert" on public.collection_apps;
drop policy if exists "collection_apps_delete" on public.collection_apps;

create policy "collection_apps_select" on public.collection_apps for select using (true);
create policy "collection_apps_insert" on public.collection_apps for insert
  with check (
    collection_id in (
      select id from public.collections
      where owner_id = auth.uid() or (owner_id is null and public.is_admin())
    )
  );
create policy "collection_apps_delete" on public.collection_apps for delete
  using (
    collection_id in (
      select id from public.collections
      where owner_id = auth.uid() or (owner_id is null and public.is_admin())
    )
  );

grant select on public.collections to anon, authenticated;
grant insert, update, delete on public.collections to authenticated;
grant select on public.collection_apps to anon, authenticated;
grant insert, delete on public.collection_apps to authenticated;
