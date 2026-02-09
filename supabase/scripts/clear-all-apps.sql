-- Clear all projects (seed + any others) so you can start fresh before promoting the MVP.
-- Run once in Supabase Dashboard → SQL Editor (or: supabase db execute -f supabase/scripts/clear-all-apps.sql).
--
-- This deletes all rows from public.apps. Related data is removed by foreign-key CASCADE:
--   app_tags, app_media, votes, collection_apps, reports, app_feedback, app_analytics_events, app_boosts, pro_featured_uses.
--
-- Storage: Files in the app-media bucket are NOT deleted automatically. To remove them:
--   Dashboard → Storage → app-media → delete each folder (or leave orphaned files; they won't show in the app).

delete from public.apps;
