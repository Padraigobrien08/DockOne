-- Remove "Graduated" (shipped_elsewhere) status. Statuses reflect creator intent only.

update public.apps set lifecycle = 'dormant' where lifecycle = 'shipped_elsewhere';

create type app_lifecycle_new as enum (
  'wip',
  'looking_for_feedback',
  'looking_for_users',
  'dormant'
);

alter table public.apps alter column lifecycle drop default;

alter table public.apps
  alter column lifecycle type app_lifecycle_new
  using (lifecycle::text::app_lifecycle_new);

drop type app_lifecycle;
alter type app_lifecycle_new rename to app_lifecycle;

alter table public.apps alter column lifecycle set default 'wip'::app_lifecycle;
