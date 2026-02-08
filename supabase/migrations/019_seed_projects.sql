-- Seed many approved projects so you can see the Projects page with a full list.
-- Requires at least one profile (signed-up user). Idempotent: safe to run again (skips existing slugs).
-- Each seed has name, tagline, app_url, and description so project detail pages have content.

insert into public.apps (
  owner_id,
  slug,
  name,
  tagline,
  status,
  lifecycle,
  visibility,
  byok_required,
  app_url,
  description
)
select
  (select id from public.profiles order by created_at asc limit 1),
  'seed-' || i,
  (array[
    'CLI for the thing', 'Side project that stuck', 'Tool I actually use',
    'Small script that grew', 'Weekend build', 'One command, done',
    'No product theatre', 'Just the useful part', 'Dev utility',
    'API wrapper', 'Dashboard for X', 'Cron job with a UI',
    'Browser extension', 'VS Code plugin', 'Slack bot',
    'Discord helper', 'GitHub action', 'Local-first app',
    'RAG experiment', 'Prompt playground', 'LLM pipeline',
    'Data formatter', 'Markdown to X', 'CSV wrangler',
    'Env manager', 'Secret rotator', 'Config generator',
    'Doc generator', 'Changelog from commits', 'README from code',
    'Deploy helper', 'Preview URLs', 'Staging on demand',
    'Feedback widget', 'Uptime check', 'Error digest',
    'Analytics lite', 'Event logger', 'Audit trail',
    'Auth helper', 'OAuth flow', 'Magic link demo',
    'Payment stripe', 'Checkout flow', 'Invoice PDF',
    'Email digest', 'Notification hub', 'Inbox zero helper',
    'Search inside', 'Full-text index', 'Filter builder',
    'Export to Notion', 'Sync with Airtable', 'Google Sheet add-on'
  ])[1 + (i % 42)],
  (array[
    'One command, done.', 'Still using it.', 'No product theatre.',
    'The 20% that does 80%.', 'Scratching my own itch.', 'Fits in a README.',
    'No backend required.', 'Runs in the browser.', 'Local-first.',
    'BYOK. Your keys, your data.', 'Uses your API key.', 'Bring your own key.',
    'Demo included.', 'Try it now.', 'WIP but usable.',
    'Actively maintained.', 'Seeking feedback.', 'Early stage.',
    'Archived for now.', 'Paused.', 'On hold.'
  ])[1 + (i % 21)],
  'approved'::app_status,
  (array['wip', 'looking_for_feedback', 'looking_for_users', 'dormant']::app_lifecycle[])[1 + (i % 4)],
  'public',
  (i % 4 = 0),
  'https://example.com',
  (array[
    'A small tool in progress. Does one thing and does it simply.',
    'Built to scratch an itch. Still using it day to day.',
    'Runs locally. No backend. Fits in a README.',
    'Wraps an API or script so you can use it without thinking.',
    'Early stage — feedback welcome. Try it and say what works.',
    'Focused on the 20% that does 80% of the work.',
    'No product theatre. Just the useful part.',
    'Dev utility: saves time on a repeated task.',
    'Browser or VS Code. One command, done.',
    'Integrates with Slack, Discord, or GitHub.',
    'Local-first. Your data stays on your machine.',
    'Experiment with RAG, prompts, or LLM pipelines.',
    'Formats, converts, or transforms data. Simple and fast.',
    'Manages env, secrets, or config. One place to look.',
    'Generates docs, changelogs, or README from source.',
    'Deploy, preview, or stage with minimal setup.',
    'Feedback, uptime, or error tracking. Lightweight.',
    'Analytics, events, or audit trail. No bloat.',
    'Auth, OAuth, or magic links. Minimal flow.',
    'Payments, checkout, or invoices. Stripe-friendly.',
    'Digest, notifications, or inbox. Less noise.',
    'Search, filter, or full-text. Fits your stack.',
    'Export to Notion, Airtable, or Sheets. One-way or sync.'
  ])[1 + (i % 22)]
from generate_series(1, 50) i
where exists (select 1 from public.profiles limit 1)
on conflict (slug) do nothing;

-- Tags for seed projects: mix of state (demo, wip, starter) and requirement (byok, llm)
insert into public.app_tags (app_id, tag)
select a.id, tag
from public.apps a
cross join lateral unnest(
  case (abs(hashtext(a.slug)) % 5)
    when 0 then array['demo', 'wip']::text[]
    when 1 then array['wip', 'starter']::text[]
    when 2 then array['byok', 'llm']::text[]
    when 3 then array['demo', 'byok']::text[]
    else array['starter', 'cli']::text[]
  end
) as t(tag)
where a.slug like 'seed-%'
on conflict (app_id, tag) do nothing;
