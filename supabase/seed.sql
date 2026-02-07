-- Seed apps for DockOne. Run in Supabase SQL Editor after:
-- 1. Running migrations (001 through 005)
-- 2. Signing in at least once so a profile exists
--
-- Idempotent: safe to run multiple times (skips apps that already exist by slug).

do $$
declare
  owner_id uuid;
  app1_id uuid;
  app2_id uuid;
  app3_id uuid;
begin
  select id into owner_id from public.profiles limit 1;
  if owner_id is null then
    raise notice 'No profile found. Sign in once at /auth/sign-in, then run this seed again.';
    return;
  end if;

  -- App 1: Hello World
  insert into public.apps (owner_id, slug, name, tagline, description, status, app_url, repo_url, byok_required)
  values (
    owner_id,
    'hello-world',
    'Hello World',
    'A minimal demo app',
    '## What it does

Shows a greeting. Nothing fancy — just enough to see the app detail page and markdown.',
    'approved',
    'https://example.com',
    'https://github.com/example/hello',
    false
  )
  on conflict (slug) do nothing
  returning id into app1_id;

  if app1_id is not null then
    insert into public.app_tags (app_id, tag) values (app1_id, 'demo'), (app1_id, 'starter') on conflict do nothing;
    insert into public.app_media (app_id, kind, url, sort_order) values (app1_id, 'screenshot', 'https://picsum.photos/seed/hello/800/450', 0);
  end if;

  -- App 2: Todo WIP
  insert into public.apps (owner_id, slug, name, tagline, description, status, app_url, repo_url, byok_required)
  values (
    owner_id,
    'todo-wip',
    'Todo WIP',
    'Simple todo list project',
    'Work in progress. Add, complete, and delete items. Local storage only for now.',
    'approved',
    'https://example.com/todo',
    null,
    false
  )
  on conflict (slug) do nothing
  returning id into app2_id;

  if app2_id is not null then
    insert into public.app_tags (app_id, tag) values (app2_id, 'demo'), (app2_id, 'todo'), (app2_id, 'wip') on conflict do nothing;
    insert into public.app_media (app_id, kind, url, sort_order) values (app2_id, 'screenshot', 'https://picsum.photos/seed/todo/800/450', 0);
  end if;

  -- App 3: BYOK Demo
  insert into public.apps (owner_id, slug, name, tagline, description, status, app_url, repo_url, byok_required)
  values (
    owner_id,
    'byok-demo',
    'BYOK Demo',
    'Uses your API key',
    'This app uses an LLM. Add your OpenAI or Anthropic key in **Settings** so it can run. Keys stay in your browser.',
    'approved',
    'https://example.com',
    null,
    true
  )
  on conflict (slug) do nothing
  returning id into app3_id;

  if app3_id is not null then
    insert into public.app_tags (app_id, tag) values (app3_id, 'demo'), (app3_id, 'byok'), (app3_id, 'llm') on conflict do nothing;
    insert into public.app_media (app_id, kind, url, sort_order) values (app3_id, 'logo', 'https://picsum.photos/seed/byok/200/200', 0);
    insert into public.app_media (app_id, kind, url, sort_order) values (app3_id, 'screenshot', 'https://picsum.photos/seed/byok2/800/450', 1);
  end if;

  raise notice 'Seed complete. Browse /apps to see the demo apps.';
end $$;
