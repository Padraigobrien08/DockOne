-- Votes: allow read for vote counts; authenticated users can add/remove their own vote.

drop policy if exists "votes_no_select" on public.votes;
drop policy if exists "votes_no_modify" on public.votes;
drop policy if exists "votes_select" on public.votes;
drop policy if exists "votes_insert_own" on public.votes;
drop policy if exists "votes_delete_own" on public.votes;

create policy "votes_select"
  on public.votes for select
  using (true);

create policy "votes_insert_own"
  on public.votes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "votes_delete_own"
  on public.votes for delete
  to authenticated
  using (auth.uid() = user_id);

grant select on public.votes to anon, authenticated;
grant insert, delete on public.votes to authenticated;
