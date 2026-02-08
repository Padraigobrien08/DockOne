-- Backfill seed projects with progressive fields so the new UI isn't blank.
-- Short, plain copy (DockOne voice). Idempotent: safe to run again.

update public.apps a
set
  what_it_does = (array[
    'Does one thing. Keeps it simple.',
    'Runs locally. No backend.',
    'Wraps an API so you can use it without thinking.',
    'Scratches an itch. Still using it.',
    'Dev utility. Saves time on a repeated task.',
    'Browser or CLI. One command, done.',
    'Early stage. Feedback welcome.',
    'No product theatre. Just the useful part.',
    'Local-first. Your data stays on your machine.',
    'Integrates with Slack, Discord, or GitHub.',
    'Formats, converts, or transforms data. Simple and fast.',
    'Manages env, secrets, or config. One place to look.',
    'Generates docs or README from source.',
    'Deploy, preview, or stage with minimal setup.',
    'Lightweight feedback or uptime check.',
    'Analytics or audit trail. No bloat.',
    'Auth or magic links. Minimal flow.',
    'Payments or checkout. Stripe-friendly.',
    'Digest or notifications. Less noise.',
    'Search or full-text. Fits your stack.'
  ])[1 + (regexp_replace(a.slug, '^seed-', '')::int - 1) % 20],
  runtime_type = (array['browser', 'local', 'api', 'cli', 'hybrid']::app_runtime_type[])[1 + (regexp_replace(a.slug, '^seed-', '')::int - 1) % 5],
  requirements = (array['none', 'api_key_required', 'local_install', 'account_required']::app_requirements[])[1 + (regexp_replace(a.slug, '^seed-', '')::int - 1) % 4],
  primary_tag = (array['cli', 'demo', 'byok', 'wip', 'starter', 'llm'])[1 + (regexp_replace(a.slug, '^seed-', '')::int - 1) % 6]
where a.slug ~ '^seed-[0-9]+$';

-- why_this_exists for at least 2 projects (evaluate layout)
update public.apps set why_this_exists = 'Built it for myself. Sharing in case it helps.'
where slug = 'seed-1';

update public.apps set why_this_exists = 'Scratching an itch. Others might have the same one.'
where slug = 'seed-2';
