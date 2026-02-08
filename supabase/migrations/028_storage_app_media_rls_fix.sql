-- Fix app-media storage RLS: use SECURITY DEFINER to check ownership so policy works
-- when Storage runs in a context where apps RLS might hide the row. Also use split_part
-- for path parsing so object name format (e.g. app_id/filename) is handled reliably.

create or replace function public.user_owns_app(app_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.apps
    where id = app_id and owner_id = auth.uid()
  );
$$;

-- Drop and recreate owner policies using the definer function and robust path parsing
drop policy if exists "app_media_owner_insert" on storage.objects;
drop policy if exists "app_media_owner_update" on storage.objects;
drop policy if exists "app_media_owner_delete" on storage.objects;

create policy "app_media_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'app-media'
    and public.user_owns_app((split_part(ltrim(name, '/'), '/', 1))::uuid)
  );

create policy "app_media_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'app-media'
    and public.user_owns_app((split_part(ltrim(name, '/'), '/', 1))::uuid)
  );

create policy "app_media_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'app-media'
    and public.user_owns_app((split_part(ltrim(name, '/'), '/', 1))::uuid)
  );
