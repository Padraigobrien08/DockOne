-- Weekly digest: opt-in and email for "This week on DockOne".
-- Retention loop, zero marginal cost growth.

alter table public.profiles
  add column if not exists email text,
  add column if not exists digest_opted_in boolean not null default false;

create index if not exists profiles_digest_opted_in_idx on public.profiles(digest_opted_in) where digest_opted_in = true;

comment on column public.profiles.email is 'Synced from auth on login; used for weekly digest.';
comment on column public.profiles.digest_opted_in is 'Opt-in for weekly digest email.';
