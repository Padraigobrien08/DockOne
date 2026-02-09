# DockOne

A home for software projects that work — without the pressure to productise.

DockOne lets creators publish working software (demos, tools, CLIs, side projects) with a short write-up, links, and optional media. Visitors browse, filter, and leave lightweight signals (feedback and interest) instead of comments or ratings. New submissions are moderated before they appear in the catalog; creators can edit their project at any time.

---

## Stack

- **Next.js 16** (App Router, React 19, Turbopack in dev)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Auth, Postgres, Storage)
- **Vercel** (recommended for deploy)

---

## Features

### Browse projects

- **Projects list** (`/apps`) — Grid of approved projects with image, name, tagline, creator, tags, and lifecycle status (Active, Seeking feedback, Looking for users, Archived).
- **Search** — Client-side filter by name, tagline, or tags.
- **Filter by tag** — Click a tag to show only projects with that tag.
- **Sort** — Newest, Recent interest (trending), or A–Z.
- **Lifecycle filter** — Hidden pre-launch; cards still show lifecycle status.
- **Featured** — Pro creators can feature a project for 24h; featured projects appear at the top of the list (when configured).
- **Boosted** — Pro creators can boost a project to amplify its trending score for 24h (limited slots per day).

### Project detail page

Each project has a dedicated page (`/apps/[slug]`) with:

- **Header** — Project name, one-line tagline, primary actions (Open app, View repo), and metadata (lifecycle status, creator link, unlisted pill if applicable, tags).
- **Project image** — Optional screenshot with reduced vertical dominance and a short caption; if missing, a neutral placeholder invites visitors to try the app.
- **Demo video** — Optional YouTube link; when set, an embedded player is shown below the image.
- **At a glance** — Always-visible summary: what it does (1–2 sentences), where it runs (browser / local / API / CLI / hybrid or inferred), who it’s for (optional).
- **More details** — Expandable section with structured write-up: what it does, what it doesn’t do, why it exists (all optional; empty state: “More details coming soon.”).
- **Send a signal to the creator** — Primary interaction block: lightweight feedback buttons (Useful, Confusing, Promising, Needs work), upvote (interest), and report. No comments or rankings.
- **Activity** — Owner-only section at the bottom: trend-style copy (e.g. “First interest received”, “First app open”) and muted counts; conversion percentages are hidden from non-creators.

Unlisted projects are only reachable by direct link and are not indexed. BYOK projects show a banner linking users to Settings to add their own API key.

### Publish a project

- **Submit flow** (`/submit`) — Two steps, authenticated only.
  - **Step 1 — Basics:** Project name, tagline, project URL (required), repo URL, tags (up to 10), visibility (public or unlisted for Pro), and BYOK checkbox. Lifecycle dropdown is hidden pre-launch (value defaults to wip).
  - **Step 2 — Description & media:** Description (Markdown), how this is used, optional demo video (YouTube URL), screenshots (up to 5, JPEG/PNG/WebP, 5MB each), and optional logo.
- New submissions are created with status **pending** and redirect to the project page with a “Pending approval” banner. They do not appear in the browse list until approved.

### Edit a project

- **Edit page** (`/apps/[slug]/edit`) — Owner-only. Link appears in the project metadata row (“Edit project”).
- Same fields as publish: name, tagline, URLs, tags, visibility, BYOK, description, how used, demo video, and progressive fields (what it does, what it doesn’t do, why it exists, where it runs, requirements, primary tag). Lifecycle dropdown is hidden pre-launch; value is preserved via hidden input.
- Optional **replace screenshots** and **replace logo** file inputs; leave empty to keep current media. Saving updates the app row and tags, optionally replaces media, then redirects to the project page.

### Moderation

- **Admin** (`/admin`) — Accessible only to users listed in the `admins` table.
- **Pending projects** — List of apps with status `pending`; each row has Approve and Reject. Reject supports an optional reason (shown to the creator on the project page).
- **Reports** — List of user-submitted reports (app, reporter, reason, date) for review.
- **Staff collections** — Curate staff picks and add/remove projects by slug.

Approved projects appear in the browse list and on creator profiles. Rejected projects remain visible only to the owner, with the rejection reason shown.

### Collections

- **Collections list** (`/collections`) — Staff picks only; community collections are hidden pre-launch.
- **Collection page** (`/collections/[slug]`) — Title, description, and list of approved projects in that collection.
- **Staff collections** — Editable only by admins; add or remove projects by slug from the admin page.
- **Community collections** — Not shown in the UI before launch; code and data remain for future use.

### Signals and feedback

- **Quiet feedback** — On each project, visitors can choose: Useful, Confusing, Promising, Needs work. One selection per user per project; no comments.
- **Upvote (interest)** — “Signal interest” records a vote; count is used for trending and creator stats.
- **Report** — Users can report a project with an optional reason; admins see reports in `/admin`.

Feedback and votes are stored per user; creators see aggregate counts and trend-style copy in the Activity section (owner-only).

### BYOK (Bring your own key)

- If a project is marked **BYOK**, a banner on the project page directs users to **Settings** to add their OpenAI or Anthropic API key.
- Keys are stored only in the browser (`localStorage`); they are never sent to the server. The app is designed so that LLM-backed projects use the key client-side only.

### Creator profiles

- **Public profile** (`/u/[username]`) — Display name, avatar, bio (optional), and list of approved public projects. Stats include vote count and “Rising creator” style badges when applicable.
- **Profile editing** (`/me`) — Signed-in users can edit their username, display name, bio, and avatar.

### Creator Pro

- **Featured** — Pro creators can feature one project for 24h per month (token); featured projects appear in a dedicated section on the browse page when configured.
- **Boost** — Pro creators can boost a project to amplify its trending score for 24h; limited boost slots per day.
- **Unlisted projects** — Pro creators can set visibility to “Unlisted”; the project is only accessible by direct link and is not listed in browse or on the creator’s public profile.
- **Early signals** — Owner-only Activity section can show additional signals (e.g. 7-day views) when Pro is enabled.

Pro status is determined by the creator’s profile (e.g. `subscription_tier` and `pro_until` in the database). Pre-launch: Pro upgrade CTAs are downgraded in copy (e.g. “Creator Pro includes…” → “Planned”, “Advanced analytics” → “Early signals”).

---

## Setup

```bash
npm install
cp .env.example .env   # add Supabase URL and anon key
npm run dev
```

- **Environment variables** — In `.env`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. See `.env.example`.
- **Supabase** — Create a project, run all migrations in `supabase/migrations/`, and configure storage buckets (`app-media`, `avatars`) and auth. See **[supabase/README.md](supabase/README.md)** (or SETUP.md if present) for step-by-step setup.
- **Auth** — Sign-in is magic link (email) and **Google**. Middleware refreshes the session on each request so you stay logged in across navigations and after the JWT would otherwise expire.
- **Google sign-in** — To enable: Supabase Dashboard → **Authentication** → **Providers** → **Google**; add your OAuth Client ID and Secret from [Google Cloud Console](https://console.cloud.google.com/apis/credentials). In **Redirect URLs** add `https://your-domain.com/auth/callback` (and `http://localhost:3000/auth/callback` for local dev).
- **New public URL** — After adding a production domain, follow **[docs/AUTH_PUBLIC_URL.md](docs/AUTH_PUBLIC_URL.md)** to get magic link and Google auth working again.

---

## Project structure

```
src/
├── app/
│   ├── (auth)/          # Legacy auth routes
│   ├── admin/           # Moderation: pending apps, reports, staff collections
│   ├── apps/            # Browse (page.tsx) + [slug] detail + [slug]/edit
│   ├── auth/            # Sign-in, callback
│   ├── collections/     # Collections list + [slug]
│   ├── me/              # Edit profile (auth)
│   ├── settings/        # BYOK keys, digest opt-in
│   ├── submit/          # Publish flow (auth)
│   ├── u/[username]/    # Public creator profile
│   ├── api/             # Cron (e.g. weekly digest), supabase-config
│   ├── not-found.tsx    # Global 404
│   ├── error.tsx        # Global error boundary
│   ├── layout.tsx, page.tsx, globals.css
├── components/
│   ├── apps/            # App card, list, feedback, report, edit form, etc.
│   ├── auth/            # Sign-out
│   ├── landing/         # Hero, proof strip, thesis
│   ├── layout/          # Header, footer
│   ├── settings/        # API keys section, digest section
│   ├── submit/          # Submit form
│   └── ui/              # Container, section
├── lib/                 # Apps, auth, collections, feedback, profile, slug, etc.
└── types/               # Shared types and constants
```

---

## Deploy

### Prerequisites

1. **Supabase project** — Migrations applied, storage buckets `app-media` and `avatars` created, auth enabled.
2. **Environment variables** — In Vercel (or your host):  
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Steps

1. **Deploy** — Connect the repo to Vercel (or run `next build` and host the output).
2. **Migrations** — Ensure all files in `supabase/migrations/` are applied (e.g. via Supabase Dashboard → SQL Editor or `supabase db push`).
3. **First admin** — Add your user to the `admins` table so you can access `/admin`:
   - Edit `supabase/migrations/027_add_first_admin.sql` with your sign-in email, then run it; or
   - In Supabase Dashboard → SQL Editor:
     ```sql
     insert into public.admins (user_id)
     select id from auth.users where email = 'your-email@example.com' limit 1
     on conflict (user_id) do nothing;
     ```
4. **Verify** — Sign in and open `/admin` to confirm moderation access.

### Optional

- **Server Actions body size** — Submit (and edit) support large payloads (e.g. multiple screenshots). If you see a 413 body size error, increase the limit in `next.config.ts` under `experimental.serverActions.bodySizeLimit` (e.g. `"32mb"`).
- **Weekly digest** — To send the “This week on DockOne” email, call `/api/cron/weekly-digest` on a schedule (e.g. Vercel Cron weekly).

---

## License

Private / unlicensed unless otherwise specified.
