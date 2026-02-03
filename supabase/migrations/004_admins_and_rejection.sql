-- Admins table (gates /admin and status updates). Add rejection_reason to apps.
-- Manage admins via Dashboard or SQL: insert into public.admins (user_id) values ('uuid');

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create index if not exists admins_user_id_idx on public.admins(user_id);

alter table public.apps add column if not exists rejection_reason text;

-- Migrate existing profile-based admins into admins table
insert into public.admins (user_id)
select id from public.profiles where is_admin = true
on conflict (user_id) do nothing;

-- RLS: users can only see their own row (to know if they are admin)
alter table public.admins enable row level security;

create policy "admins_select_own"
  on public.admins for select
  using (user_id = auth.uid());

-- No insert/update/delete from app; manage admins via Dashboard/SQL.

grant select on public.admins to authenticated;

-- Switch is_admin() to use admins table so RLS policies still work
create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$ language sql security definer stable set search_path = public;
