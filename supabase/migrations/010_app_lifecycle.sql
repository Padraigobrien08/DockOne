-- Creator-controlled lifecycle: WIP (Active), Looking for feedback, etc.
-- Separate from moderation status (pending/approved/rejected). Owner can update.
-- Note: "actively_building" merged into "wip" (020); "shipped_elsewhere" removed (021).

create type app_lifecycle as enum (
  'wip',
  'actively_building',
  'looking_for_feedback',
  'looking_for_users',
  'dormant',
  'shipped_elsewhere'
);

alter table public.apps
  add column if not exists lifecycle app_lifecycle not null default 'wip';

create index if not exists apps_lifecycle_idx on public.apps(lifecycle);

comment on column public.apps.lifecycle is 'Creator-controlled: WIP, actively building, looking for feedback/users, dormant, shipped elsewhere.';
