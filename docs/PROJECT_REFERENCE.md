# Project reference — statuses, types, browse, detail, submit, edit

Single place for the 6 core pieces: types/constants, project type/schema, browse page, project detail page, submit (step 1 + 2), and edit page.

---

## 1. Types / constants (statuses, tags, lifecycle)

**File:** `src/types/index.ts`

- **Moderation status:** `AppStatus = "pending" | "approved" | "rejected"` (aligned with DB `app_status` enum).
- **Lifecycle (creator intent):** `AppLifecycle = "wip" | "looking_for_feedback" | "looking_for_users" | "dormant"`.
- **Constants:** `APP_LIFECYCLE_LABELS`, `APP_LIFECYCLE_CARD_CLASS`, `APP_LIFECYCLE_IMAGE_OVERLAY`, `APP_RUNTIME_LABELS`, `APP_REQUIREMENTS_LABELS`.
- **Visibility:** `AppVisibility = "public" | "unlisted"`.
- **Feedback:** `FeedbackKind = "useful" | "confusing" | "promising" | "needs_work"`.
- **Tags:** Free-form strings; stored in `app_tags` table, no enum. Projects have `tags: string[]` (list/card/detail) and optional `primary_tag` (progressive).

Relevant excerpt:

```ts
export type AppStatus = "pending" | "approved" | "rejected";

export type AppLifecycle =
  | "wip"
  | "looking_for_feedback"
  | "looking_for_users"
  | "dormant";

export const APP_LIFECYCLE_LABELS: Record<AppLifecycle, string> = {
  wip: "Active",
  looking_for_feedback: "Seeking feedback",
  looking_for_users: "Looking for users",
  dormant: "Archived",
};
// + APP_LIFECYCLE_CARD_CLASS, APP_LIFECYCLE_IMAGE_OVERLAY, APP_RUNTIME_LABELS, APP_REQUIREMENTS_LABELS
```

---

## 2. Project type / interface and DB schema

**Types:** `src/types/index.ts`

- **List item:** `AppListItem` — id, name, tagline, slug, created_at, updated_at?, owner, tags, primary_image_url, byok_required, vote_count, trending_score, lifecycle, visibility.
- **Detail:** `AppDetail` — extends list-like fields with description, how_used, app_url, repo_url, demo_video_url, rejection_reason, media[], vote_count, user_has_voted, plus progressive: whyThisExists, whatItDoes, whatItDoesNot, runtimeType, requirements, primaryTag.
- **Base:** `App` — id, slug, name, tagline, description, how_used, status, lifecycle, visibility, app_url, repo_url, rejection_reason, byok_required, created_at, updated_at, owner_id, plus optional progressive fields.

**DB schema (apps table), from migrations:**

- **001_init.sql:** id, owner_id, slug, name, tagline, description, status (app_status enum: pending, approved, rejected), app_url, repo_url, demo_video_url, created_at, updated_at.
- **005:** byok_required (boolean, default false).
- **004:** rejection_reason (text).
- **010:** lifecycle (app_lifecycle enum: wip, looking_for_feedback, looking_for_users, dormant) — see 021 for current enum after removals.
- **014:** visibility (text, check in ('public','unlisted'), default 'public').
- **022:** how_used (text).
- **024:** why_this_exists, what_it_does, what_it_does_not, primary_tag (text); runtime_type (app_runtime_type), requirements (app_requirements) (enums as in 024).

Tags live in **app_tags(app_id, tag)**; media in **app_media(id, app_id, kind, url, sort_order)**.

---

## 3. Browse page component

**File:** `src/app/apps/page.tsx`

- Server component. Fetches: `getApprovedApps()`, `getFeaturedApps()`, `getActiveBoosts()`; builds `creatorStatsMap` via `computeCreatorStatsMap(apps)`.
- Renders: title “Projects”, short intro, link to “Staff picks” (/collections), copy “Search, filter by tag, or sort to find projects.”, optional Featured section (grid of AppCard), then **AppsList** with apps, creatorStatsMap, boostMap.
- **AppsList** (`src/components/apps/apps-list.tsx`): search input, “Refine by” (Sort + tag pills only; lifecycle filter hidden pre-launch), grid of **AppCard**s.

---

## 4. Project detail page component

**File:** `src/app/apps/[slug]/page.tsx`

- Server component. Loads app by slug (`getAppBySlug`), user, feedback counts, analytics (owner), featured/boost state.
- Renders: back link, pending/rejection banners if applicable, BYOK/unlisted notices, **header** (name, tagline, Open app / View repo, metadata row with lifecycle pill, creator, “Edit project”, tags), **primary artifact** (image or placeholder + optional demo video), **At a glance** (what it does, where it runs, who it’s for), **More details** (expandable: what it does / doesn’t do / why it exists, runtime/requirements), **Send a signal** (FeedbackButtons, UpvoteButton, ReportButton), optional FeaturedButton/BoostButton (owner + Pro), **Activity** (owner-only, trend-style copy + counts; uses AppAnalyticsSection pattern elsewhere).

---

## 5. Submit step 1 + step 2 components

**File:** `src/components/submit/submit-form.tsx` (single component, two steps)

- **Step 1 (Basics):** Form with client-side “Next: Description & media”. Fields: name*, tagline, project URL*, repo URL, tags (comma/space), lifecycle (hidden when `SHOW_LIFECYCLE_DROPDOWN` is false; value stays `wip`), visibility (public/unlisted, only if `isPro`), BYOK checkbox. Step 1 does not submit to server; it only advances to step 2.
- **Step 2 (Description & media):** Form `action={formAction}` (submitApp). Hidden inputs pass through: name, tagline, app_url, repo_url, tags, byok_required, **lifecycle**, visibility, demo_video_url. Visible fields: description (Markdown), how_used, demo_video_url (optional), screenshots (file, up to 5), logo (optional). Buttons: Back, “Publish project”.

Submit page wrapper: `src/app/submit/page.tsx` — gets user, `getIsPro(user.id)`, renders `<SubmitForm isPro={isPro} />`.

---

## 6. Edit page component

**File (page):** `src/app/apps/[slug]/edit/page.tsx`

- Server component. Requires auth; loads app by slug; ensures current user is owner; fetches `getIsPro(user.id)`; renders **EditAppForm** with `app` and `isPro`.

**File (form):** `src/components/apps/edit-app-form.tsx`

- Single form, `action={formAction}` (updateApp). Fields: name*, tagline, app_url*, repo_url, demo_video_url, tags, **lifecycle** (hidden input only, value `app.lifecycle` — dropdown hidden pre-launch), visibility (select only if `isPro`), BYOK checkbox; then description, how_used, progressive fields (what it does, what it doesn’t do, why it exists, runtime_type, requirements, primary_tag); optional replace screenshots / replace logo. Submit button saves and redirects.

---

## Quick file index

| # | What              | Primary path(s) |
|---|-------------------|------------------|
| 1 | Statuses/tags/types | `src/types/index.ts` |
| 2 | Project type + DB  | `src/types/index.ts` (App, AppDetail, AppListItem); `supabase/migrations/001_init.sql` + 004, 005, 010, 014, 021, 022, 024 |
| 3 | Browse page        | `src/app/apps/page.tsx`, `src/components/apps/apps-list.tsx` |
| 4 | Project detail     | `src/app/apps/[slug]/page.tsx` |
| 5 | Submit step 1 & 2   | `src/components/submit/submit-form.tsx`, `src/app/submit/page.tsx` |
| 6 | Edit page           | `src/app/apps/[slug]/edit/page.tsx`, `src/components/apps/edit-app-form.tsx` |
