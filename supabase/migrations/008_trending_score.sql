-- Time-decayed trending score: rewards momentum, penalises self-votes, reduces gaming.
-- score = votes_weighted / (age_in_hours ^ decay)
-- - Self-votes (voter = app owner) excluded from votes_weighted.
-- - Recent votes (last 24h) weighted 1.5x to boost momentum.
-- - age_in_hours = time since app created; decay (default 0.5) controls how fast old apps fall.

create or replace function public.get_approved_apps_trending_score(p_decay float default 0.5)
returns table (app_id uuid, score float)
language sql
stable
security definer
set search_path = public
as $$
  with app_votes as (
    select
      a.id as app_id,
      a.created_at,
      a.owner_id,
      count(*) filter (where v.user_id <> a.owner_id and v.created_at > now() - interval '24 hours') as recent_other,
      count(*) filter (where v.user_id <> a.owner_id and v.created_at <= now() - interval '24 hours') as old_other
    from public.apps a
    left join public.votes v on v.app_id = a.id
    where a.status = 'approved'
    group by a.id, a.created_at, a.owner_id
  ),
  scored as (
    select
      app_votes.app_id,
      (
        (coalesce(app_votes.recent_other, 0) * 1.5 + coalesce(app_votes.old_other, 0))
        / nullif(greatest(extract(epoch from (now() - app_votes.created_at)) / 3600.0, 0.1) ^ p_decay, 0)
      )::float as score
    from app_votes
  )
  select scored.app_id, scored.score
  from scored
  order by score desc nulls last;
$$;

comment on function public.get_approved_apps_trending_score(float) is
  'Returns (app_id, score) for approved apps. Score = weighted_votes / age_hours^decay; self-votes excluded; recent votes boosted.';

grant execute on function public.get_approved_apps_trending_score(float) to anon, authenticated;
