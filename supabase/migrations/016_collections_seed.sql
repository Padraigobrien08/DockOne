-- Seed default staff collections: Staff picks, Best BYOK tools, Best dev utilities.
-- Idempotent: safe to run again.

insert into public.collections (slug, name, description, owner_id)
values
  ('staff-picks', 'Staff picks', 'Hand-picked apps our team loves. Editorial authority.', null),
  ('best-byok-tools', 'Best BYOK tools', 'Apps that use your own API keys (OpenAI, Anthropic). Best BYOK tools.', null),
  ('best-dev-utilities', 'Best dev utilities', 'Developer utilities and tools. Best dev utilities.', null)
on conflict (slug) do nothing;
