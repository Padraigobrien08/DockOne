# Project Detail Page: Fields, Model, and Gap Analysis

## 1. Project fields currently used on the detail page

| Field / concept | Where used |
|-----------------|------------|
| **name** | Page title (h1) |
| **tagline** | One-line description under title |
| **lifecycle** | Status pill (Active, Seeking feedback, Looking for users, Archived); drives LIFECYCLE_INTENT copy and “Help the creator” section |
| **app_url** | Open app CTA (header + primary artifact when demo); sticky CTA; tracked link |
| **repo_url** | “View repo” link |
| **demo_video_url** | “Demo” link |
| **description** | “What it does” section (markdown) and/or primary artifact when no screenshot/demo |
| **how_used** | “How this is used” section and/or primary artifact (explanation) |
| **media** (screenshots) | Primary artifact (first screenshot only) when present |
| **status** | Pending banner (owner); rejection banner + reason (owner); **Approved** badge (owner/admin only via `showStatusBadge`) |
| **rejection_reason** | Shown to owner when status = rejected |
| **byok_required** | BYOK banner + Settings link |
| **visibility** | “Unlisted” pill in creator row; metadata (robots) when unlisted |
| **owner** (id, username, display_name, avatar_url, isPro) | Creator link, avatar, display name |
| **tags** | Tag list in creator row (state/requirement/default styling) |
| **vote_count** | Passed to UpvoteButton (not displayed after feedback refactor) |
| **user_has_voted** | UpvoteButton pressed state |
| **id, slug** | Routing, feedback, analytics, report, boost, featured |
| **created_at, updated_at** | Not shown on detail page (used elsewhere for momentum) |

**Fetched but only for logic (not displayed as content):**  
`feedbackCounts`, `currentUserFeedback` (feedback section); `analytics` (owner analytics section); `featuredTokenUsed`, `boostMap`, `activeBoostCount` (featured/boost buttons).

---

## 2. Current project type and DB model

### TypeScript: `AppDetail` (`src/types/index.ts`)

```ts
export type AppStatus = "pending" | "approved" | "rejected";

export type AppLifecycle =
  | "wip"
  | "looking_for_feedback"
  | "looking_for_users"
  | "dormant";

export type AppVisibility = "public" | "unlisted";

export interface AppDetail {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  how_used: string | null;
  status: AppStatus;
  visibility: AppVisibility;
  app_url: string | null;
  repo_url: string | null;
  demo_video_url: string | null;
  rejection_reason: string | null;
  byok_required: boolean;
  created_at: string;
  updated_at: string;
  owner: AppOwner;
  tags: string[];
  media: AppMediaItem[];
  vote_count: number;
  user_has_voted: boolean;
  lifecycle: AppLifecycle;
}
```

### DB: `public.apps` (Supabase, from migrations)

| Column | Type | Notes |
|--------|------|--------|
| id | uuid | PK |
| owner_id | uuid | FK → profiles |
| slug | text | unique |
| name | text | not null |
| tagline | text | |
| description | text | |
| status | app_status | enum: pending, approved, rejected; default pending |
| app_url | text | |
| repo_url | text | |
| demo_video_url | text | |
| created_at, updated_at | timestamptz | |
| byok_required | boolean | default false (005) |
| rejection_reason | text | (004) |
| lifecycle | app_lifecycle | wip, looking_for_feedback, looking_for_users, dormant (010, 020, 021) |
| visibility | text | default 'public' (014) |
| how_used | text | (022) |

Related tables: `app_tags` (tag), `app_media` (url, kind, sort_order), `profiles` (owner), plus votes, app_feedback, app_analytics_events, etc.

---

## 3. Gap vs target model and removals

### Target fields to add (missing today)

| Target field | Purpose | Current gap |
|--------------|--------|-------------|
| **why_this_exists** | Creator’s short “why I built this” / motivation. | No field; only tagline + description + how_used. |
| **runtime_type** | e.g. “Web app”, “CLI”, “VS Code”, “Slack bot”. | No field; only tags (e.g. “cli”, “wip”) which are freeform. |
| **requirements** | Runtime or usage requirements (e.g. “Node 18+”, “OpenAI key”). | Partially covered by BYOK only; no structured requirements. |
| **what_it_does** | Structured short “what it does” (could be same as description or a dedicated short field). | We use `description` for “What it does”; target may want a dedicated short field. |
| **what_it_does_not** | Explicit “out of scope” / what it doesn’t do. | No field. |
| **primary_tag** | Single primary category/tag for display and filtering. | We have `tags[]` only; no designated primary. |
| **visibility** | public / unlisted. | **Present**: `visibility` in type and DB; shown as “Unlisted” pill. |
| **moderation_state** | Internal only (pending/approved/rejected + reason). | **Present** as `status` + `rejection_reason`; currently exposed to owner/admin as “Pending”, “Approved”, “Rejected” badge. |
| **signals** | Quiet feedback (helpful / not for me, useful-to-me). | **Present**: FeedbackButtons (helpful/not for me), UpvoteButton (useful to me), no counts shown. |

So: **Add** — `why_this_exists`, `runtime_type`, `requirements`, optional dedicated `what_it_does` / `what_it_does_not`, `primary_tag`. **Already aligned** — visibility, moderation_state (as status), signals (quiet feedback).

### Fields / UI to remove

| Item | Where it lives | Action |
|------|----------------|--------|
| **“Approved” UI exposure** | `STATUS_LABEL["approved"]` = “Approved”; shown when `showStatusBadge` (owner or admin). | Stop showing “Approved” to anyone; treat moderation as internal only. Optionally keep “Pending” / “Rejected” for owner only. |

---

## 4. Summary

- **Currently used on detail page:** name, tagline, lifecycle, app_url, repo_url, demo_video_url, description, how_used, media (first screenshot), status, rejection_reason, byok_required, visibility, owner, tags, vote_count, user_has_voted, id, slug.
- **Backing model:** TypeScript `AppDetail` and Supabase `public.apps` (+ app_tags, app_media, profiles) as above.
- **Missing vs target:** why_this_exists, runtime_type, requirements, what_it_does_not, primary_tag; what_it_does could stay as description or become a dedicated short field.
- **Already aligned:** visibility, moderation_state (status), signals (quiet feedback).
- **To remove:** any “Approved” badge — hide from UI so moderation stays internal. (Graduated concept and graduated_url have been removed.)
