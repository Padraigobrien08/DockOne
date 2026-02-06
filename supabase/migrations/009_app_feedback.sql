-- Quick feedback: Useful, Confusing, Promising, Needs work.
-- One feedback per user per app (user can change). Counts visible only to app creator.

create type app_feedback_kind as enum ('useful', 'confusing', 'promising', 'needs_work');

create table public.app_feedback (
  app_id uuid not null references public.apps(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind app_feedback_kind not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (app_id, user_id)
);

create index app_feedback_app_id_idx on public.app_feedback(app_id);

alter table public.app_feedback enable row level security;

-- Creators can read feedback for their own apps (to see aggregate counts)
create policy "app_feedback_select_owner"
  on public.app_feedback for select
  using (
    exists (
      select 1 from public.apps a
      where a.id = app_id and a.owner_id = auth.uid()
    )
  );

-- Authenticated users can insert/update/delete their own feedback
create policy "app_feedback_insert_own"
  on public.app_feedback for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "app_feedback_update_own"
  on public.app_feedback for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "app_feedback_delete_own"
  on public.app_feedback for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_app_feedback_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger app_feedback_updated_at
  before update on public.app_feedback
  for each row execute function public.set_app_feedback_updated_at();

grant select, insert, update, delete on public.app_feedback to authenticated;
