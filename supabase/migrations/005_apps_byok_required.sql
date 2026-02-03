-- BYOK flag: app may require user to supply API keys (stored in browser only).
alter table public.apps add column if not exists byok_required boolean not null default false;
