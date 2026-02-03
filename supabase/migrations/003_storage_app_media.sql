-- RLS for app-media bucket. Create bucket in Dashboard: Storage → New bucket → id: app-media, Public: on.
-- Path: app-media/{app_id}/{filename}. Only the app owner can upload/update/delete under their app_id folder.

create policy "app_media_public_read"
  on storage.objects for select
  using (bucket_id = 'app-media');

create policy "app_media_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'app-media'
    and (select owner_id from public.apps where id = ((storage.foldername(name))[1])::uuid) = auth.uid()
  );

create policy "app_media_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'app-media'
    and (select owner_id from public.apps where id = ((storage.foldername(name))[1])::uuid) = auth.uid()
  );

create policy "app_media_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'app-media'
    and (select owner_id from public.apps where id = ((storage.foldername(name))[1])::uuid) = auth.uid()
  );
