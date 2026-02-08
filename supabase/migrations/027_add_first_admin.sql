-- Add your first admin so you can access /admin (pending projects, reports, collections).
-- Replace YOUR_EMAIL@example.com below with the email you use to sign in, then run this migration
-- (e.g. npx supabase db push) or run the SQL in Supabase Dashboard → SQL Editor.
insert into public.admins (user_id)
select id from auth.users where email = 'YOUR_EMAIL@example.com' limit 1
on conflict (user_id) do nothing;
