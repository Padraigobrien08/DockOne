-- Contact messages table for landing page contact form.
-- Stores messages from the ContactSection component (email optional, message required).

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  email text,
  message text not null,
  created_at timestamptz not null default now()
);

create index contact_messages_created_at_idx on public.contact_messages(created_at desc);

-- Allow anyone to insert (public form)
grant insert on public.contact_messages to anon, authenticated;

-- Only admins can read (for moderation/replies)
create policy "contact_messages_select_admin"
  on public.contact_messages for select
  using (public.is_admin());
