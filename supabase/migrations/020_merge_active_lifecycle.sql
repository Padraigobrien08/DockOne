-- Merge "actively_building" into "wip" (same meaning: Active). Single status everywhere.

update public.apps set lifecycle = 'wip' where lifecycle = 'actively_building';

create type app_lifecycle_new as enum (
  'wip',
  'looking_for_feedback',
  'looking_for_users',
  'dormant',
  'shipped_elsewhere'
);

-- Drop default so the column type can be changed (default is tied to old enum).
alter table public.apps alter column lifecycle drop default;

alter table public.apps
  alter column lifecycle type app_lifecycle_new
  using (lifecycle::text::app_lifecycle_new);

drop type app_lifecycle;
alter type app_lifecycle_new rename to app_lifecycle;

alter table public.apps alter column lifecycle set default 'wip'::app_lifecycle;
