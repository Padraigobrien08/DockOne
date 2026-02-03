# Supabase migrations

## Applying the initial schema

### Option A: Supabase Dashboard (SQL Editor)

1. Open your project: [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **SQL Editor**.
3. Open `supabase/migrations/001_init.sql` in your editor, copy its full contents, and paste into the SQL Editor.
4. Click **Run**. All tables, indexes, triggers, and RLS policies will be created.

If anything already exists (e.g. you re-run), you’ll get errors. Use a fresh project or drop objects in reverse order before re-running.

### Option B: Supabase CLI

1. Install the CLI: `npm i -g supabase` (or see [Supabase CLI](https://supabase.com/docs/guides/cli)).
2. Link the project: `supabase link --project-ref YOUR_REF` (ref from dashboard URL).
3. Run migrations: `supabase db push`.

Migrations run in order; already-applied migrations are skipped.

---

## Post-migration

- **Profiles** are not auto-created. Your app should create a row in `public.profiles` on first sign-in (e.g. in the auth callback or a “complete profile” flow), with `id = auth.uid()` and a unique `username`.
- **Admins**: Admin access is gated by the `admins` table (migration `004_admins_and_rejection.sql`). Add a user via SQL: `insert into public.admins (user_id) values ('user-uuid');`. Only users in `admins` can access `/admin` and change `apps.status`. Existing `profiles.is_admin = true` users are migrated into `admins` when you run the migration.
- **Votes**: The `votes` table and RLS are in place but policies currently deny all access. When you’re ready, add SELECT/INSERT/DELETE policies and remove the “no access” policies.
- **Storage**: After running migrations, create these buckets in the Dashboard (**Storage** → **New bucket**), then run the corresponding migration (or `supabase db push`):
  - `avatars`: Public on. RLS in `002_storage_avatars.sql` — users upload under `avatars/{user_id}/`.
  - `app-media`: Public on. RLS in `003_storage_app_media.sql` — app owners upload under `app-media/{app_id}/`.
