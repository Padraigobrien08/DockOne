-- Contact messages table for landing page contact form.
-- Stores messages from the ContactSection component (email optional, message required).
-- Includes user_id (if logged in), ip_hash, and user_agent for rate limiting and tracking.
-- Idempotent: safe to run if table already exists.

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text,
  message text not null
);

-- Add new columns if they don't exist (for existing tables)
alter table public.contact_messages
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists ip_hash text,
  add column if not exists user_agent text;

-- Create indexes if they don't exist
create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);
create index if not exists contact_messages_user_id_idx on public.contact_messages(user_id) where user_id is not null;
create index if not exists contact_messages_ip_rate_limit_idx on public.contact_messages(ip_hash, created_at desc) where ip_hash is not null;
create index if not exists contact_messages_ua_rate_limit_idx on public.contact_messages(user_agent, created_at desc) where user_agent is not null;

-- Enable RLS (idempotent)
alter table public.contact_messages enable row level security;

-- Grant permissions (idempotent)
grant insert on public.contact_messages to anon, authenticated;

-- Drop and recreate policies (ensures they match current requirements)
drop policy if exists "contact_messages_insert_anon_authenticated" on public.contact_messages;
drop policy if exists "contact_messages_select_admin" on public.contact_messages;
drop policy if exists "contact_messages_update_admin" on public.contact_messages;
drop policy if exists "contact_messages_delete_admin" on public.contact_messages;

create policy "contact_messages_insert_anon_authenticated"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

create policy "contact_messages_select_admin"
  on public.contact_messages for select
  using (public.is_admin());

create policy "contact_messages_update_admin"
  on public.contact_messages for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_messages_delete_admin"
  on public.contact_messages for delete
  using (public.is_admin());
