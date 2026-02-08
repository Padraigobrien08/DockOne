-- Backfill app_url and description for existing seed projects so detail pages have content.

update public.apps
set
  app_url = coalesce(app_url, 'https://example.com'),
  description = coalesce(description, 'A small tool in progress. Does one thing and does it simply.')
where slug like 'seed-%'
  and (app_url is null or description is null);
