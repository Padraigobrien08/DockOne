-- Optional first-person "how this is used" — real usage, not features or plans.

alter table public.apps
  add column if not exists how_used text;

comment on column public.apps.how_used is 'Optional: how the creator actually uses it — first-person, real usage. Not documentation or feature list.';
