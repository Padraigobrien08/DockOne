# Project reference — statuses, types, browse, detail, submit, edit

Single place for the 6 core pieces plus pre-launch behavior: types/constants, project type/schema, browse page, project detail page, submit (step 1 + 2), edit page, and collections.

---

## 1. Types / constants (statuses, tags, lifecycle, intent)

**File:** `src/types/index.ts`

- **Moderation status:** `AppStatus = "pending" | "approved" | "rejected"` (aligned with DB `app_status` enum).
- **Lifecycle (DB):** `AppLifecycle = "wip" | "looking_for_feedback" | "looking_for_users" | "dormant"`. DB still has four values; UI collapses to two.
- **UI lifecycle:** `UiLifecycle = "active" | "archived"`. Helpers: `getUiLifecycle(lifecycle)`, `getUiLifecycleLabel(lifecycle)`, `getUiLifecycleCardClass(lifecycle)`, `getUiLifecycleImageOverlay(lifecycle)`. All “active-ish” DB states display as **Active**; `dormant` displays as **Archived**.
- **Legacy (deprecated):** `APP_LIFECYCLE_LABELS` (collapsed to Active/Archived), `APP_LIFECYCLE_CARD_CLASS`, `APP_LIFECYCLE_IMAGE_OVERLAY` — use the getters above in UI.
- **Intent tags (UI only):** `INTENT_TAGS = ["feedback", "early-users"] as const`. Recommended tags for creator intent; not an enum. Tags remain free-form in DB. Replaces “Seeking feedback” / “Looking for users” lifecycle intent in UI.
- **Visibility:** `AppVisibility = "public" | "unlisted"`.
- **Feedback:** `FeedbackKind = "useful" | "confusing" | "promising" | "needs_work"`.
- **Tags:** Free-form strings in `app_tags`; projects have `tags: string[]` and optional `primary_tag`. Intent tags `feedback` / `early-users` are merged with free-form tags in submit and edit.

---

## 2. Project type / interface and DB schema

**Types:** `src/types/index.ts`

- **List item:** `AppListItem` — id, name, tagline, slug, created_at, updated_at?, owner, tags, primary_image_url, byok_required, vote_count, trending_score, lifecycle, visibility.
- **Detail:** `AppDetail` — extends list-like fields with description, how_used, app_url, repo_url, demo_video_url, rejection_reason, media[], vote_count, user_has_voted, plus progressive: whyThisExists, whatItDoes, whatItDoesNot, runtimeType, requirements, primaryTag.
- **Base:** `App` — id, slug, name, tagline, description, how_used, status, lifecycle, visibility, app_url, repo_url, rejection_reason, byok_required, created_at, updated_at, owner_id, plus optional progressive fields.

**DB schema (apps table), from migrations:**

- **001_init.sql:** id, owner_id, slug, name, tagline, description, status (app_status enum), app_url, repo_url, demo_video_url, created_at, updated_at.
- **005:** byok_required. **004:** rejection_reason. **010:** lifecycle (app_lifecycle enum). **014:** visibility. **022:** how_used. **024:** why_this_exists, what_it_does, what_it_does_not, primary_tag, runtime_type, requirements.

Tags: **app_tags(app_id, tag)**. Media: **app_media(id, app_id, kind, url, sort_order)**.

---

## 3. Browse page component

**File:** `src/app/apps/page.tsx`

- Server component. Fetches: `getApprovedApps()`, `getFeaturedApps()`, `getActiveBoosts()`; builds `creatorStatsMap` via `computeCreatorStatsMap(apps)`.
- Renders: title “Projects”, intro, link to “Staff picks” (/collections), “Search, filter by tag, or sort to find projects.”, optional Featured section, then **AppsList**.

**AppsList** (`src/components/apps/apps-list.tsx`): **Refine by** = search input, sort dropdown, tag chips only (no lifecycle filter). Grid of **AppCard**s.

**AppCard** (`src/components/apps/app-card.tsx`): Status pill uses `getUiLifecycleLabel` / `getUiLifecycleCardClass` / `getUiLifecycleImageOverlay` — displays only **Active** or **Archived**. If tags include `feedback` or `early-users`, shows subtle tag-style chips “Feedback” / “Early users” (INTENT_TAG_LABELS). No lifecycle filter in list.

---

## 4. Project detail page component

**File:** `src/app/apps/[slug]/page.tsx`

- Server component. Loads app by slug (`getAppBySlug`), user, feedback counts, **Activity** data (owner), featured/boost state.
- **Header:** name, tagline, Open app / View repo (TrackedLink), metadata row with **lifecycle pill** (getUiLifecycleLabel → “Active” or “Archived”), creator, “Edit project”, tags. If tags include `feedback` or `early-users`, muted **intent hint** below metadata: “Creator is looking for feedback.” / “Creator is looking for early users.” (or both).
- **Primary artifact:** image or placeholder, optional demo video. **At a glance**, **More details** (expandable). **Send a signal** (FeedbackButtons, UpvoteButton, ReportButton).
- **Featured/Boost:** Gated by `SHOW_PROMO_FEATURES = false` (pre-launch). No FeaturedButton/BoostButton or Pro accent on links when false.
- **Activity:** Owner-only section; muted, observational counts (no conversion language or percentages). Trend-style copy (“First interest received”, “First app open”, etc.). Data pipeline unchanged; UI label is “Activity”.

---

## 5. Submit step 1 + step 2 components

**File:** `src/components/submit/submit-form.tsx` (single component, two steps)

- **Step 1 (Basics):** Client-side “Next: Description & media”. Fields: name*, tagline, project URL*, repo URL, **tags** (free-form input), **“What are you looking for?”** (optional) — checkboxes “Feedback” and “Early users” that add tags `feedback` / `early-users`; multi-select; merged with free-form tags (no duplicates, lowercase, trim). No lifecycle in form state. Visibility (public/unlisted) only if `isPro`. BYOK checkbox.
- **Step 2 (Description & media):** Form `action={formAction}` (submitApp). Hidden inputs: name, tagline, app_url, repo_url, **tags** (value = `mergeIntentAndFreeFormTags(intentSelections, tags).join(", ")`), byok_required, **lifecycle = "wip"** (hardcoded; no lifecycle state), visibility, demo_video_url. Visible: description (Markdown), how_used, demo_video_url, screenshots (up to 5), logo. Buttons: Back, “Publish project”.

Submit page: `src/app/submit/page.tsx` — gets user, `getIsPro(user.id)`, renders `<SubmitForm isPro={isPro} />`.

---

## 6. Edit page component

**File (page):** `src/app/apps/[slug]/edit/page.tsx`

- Server component. Auth required; loads app by slug; ensures current user is owner; fetches `getIsPro(user.id)`; renders **EditAppForm** with `app` and `isPro`.

**File (form):** `src/components/apps/edit-app-form.tsx`

- Single form, `action={formAction}` (updateApp). **Tags:** controlled input; value merged with intent toggles. **Intent (optional):** two checkboxes — “Looking for feedback”, “Looking for early users” — toggle tags `feedback` / `early-users` in the tags string (no separate DB field). **Lifecycle:** hidden input only, value `app.lifecycle` (preserved; no dropdown). Visibility (select only if `isPro`), BYOK; then description, how_used, progressive fields (what it does, what it doesn’t do, why it exists, runtime_type, requirements, primary_tag); replace screenshots/logo optional.

---

## 7. Collections (staff picks only)

**Index:** `src/app/collections/page.tsx`

- Fetches `getCollections()`; **pre-launch:** `collections = allCollections.filter((c) => !c.owner_id)` — only staff picks shown. Copy: “Staff picks. Projects worth exploring.” No “community collections” in UI; no create/edit community affordances.

**Detail:** `src/app/collections/[slug]/page.tsx`

- Loads collection by slug. **Pre-launch:** if `collection.owner_id` is set (community collection), `notFound()` — only staff picks are reachable. Metadata returns `{}` for community collections.

Backend/schema unchanged; visibility and 404 are app-layer only.

---

## 8. Pre-launch / MVP behavior (summary)

- **Lifecycle UI:** Only “Active” / “Archived” shown (getUiLifecycleLabel). No lifecycle filter on browse; submit lifecycle hardcoded to `wip`; edit preserves existing lifecycle via hidden input.
- **Intent:** Expressed via tags `feedback` and `early-users` (INTENT_TAGS). Submit “What are you looking for?” and edit “Intent” toggles merge into tags. Cards and detail show intent chips/hint when those tags exist.
- **Pro / monetisation:** `SHOW_PROMO_FEATURES = false` on detail page — no Featured/Boost buttons, no Pro accent on TrackedLinks.
- **Activity:** Label “Activity” (not “Analytics”); no conversion language or percentages; counts muted and observational.
- **Collections:** Staff picks only on index and detail; community collections 404; no UI to create or edit community collections.

---

## Quick file index

| # | What              | Primary path(s) |
|---|-------------------|------------------|
| 1 | Statuses/tags/types / intent | `src/types/index.ts` |
| 2 | Project type + DB  | `src/types/index.ts`; `supabase/migrations/` (001, 004, 005, 010, 014, 021, 022, 024) |
| 3 | Browse page        | `src/app/apps/page.tsx`, `src/components/apps/apps-list.tsx`, `src/components/apps/app-card.tsx` |
| 4 | Project detail     | `src/app/apps/[slug]/page.tsx` |
| 5 | Submit step 1 & 2   | `src/components/submit/submit-form.tsx`, `src/app/submit/page.tsx` |
| 6 | Edit page           | `src/app/apps/[slug]/edit/page.tsx`, `src/components/apps/edit-app-form.tsx` |
| 7 | Collections        | `src/app/collections/page.tsx`, `src/app/collections/[slug]/page.tsx` |
