-- Progressive enhancement: optional project fields. All nullable; existing projects unchanged.

alter table public.apps
  add column if not exists why_this_exists text,
  add column if not exists what_it_does text,
  add column if not exists what_it_does_not text,
  add column if not exists primary_tag text;

do $$ begin
  create type app_runtime_type as enum ('browser', 'local', 'api', 'cli', 'hybrid');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type app_requirements as enum ('none', 'api_key_required', 'local_install', 'account_required');
exception when duplicate_object then null;
end $$;

alter table public.apps
  add column if not exists runtime_type app_runtime_type,
  add column if not exists requirements app_requirements;

comment on column public.apps.why_this_exists is 'Optional: why the creator built this.';
comment on column public.apps.what_it_does is 'Optional: short structured "what it does".';
comment on column public.apps.what_it_does_not is 'Optional: what it does not do / out of scope.';
comment on column public.apps.runtime_type is 'Optional: where it runs (browser, local, api, cli, hybrid).';
comment on column public.apps.requirements is 'Optional: runtime/usage requirement.';
comment on column public.apps.primary_tag is 'Optional: single primary category/tag for display.';
