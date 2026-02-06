-- Private apps / unlisted previews (Pro). Unlisted = not in browse, shareable direct link.
-- For investors, early testers, hiring. Pro creators only.

alter table public.apps
  add column if not exists visibility text not null default 'public'
    check (visibility in ('public', 'unlisted'));

create index if not exists apps_visibility_idx on public.apps(visibility);

comment on column public.apps.visibility is 'public = in browse; unlisted = direct link only (Pro).';
