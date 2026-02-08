/**
 * DockOne shared types.
 * Aligned with Supabase schema: apps (name, tagline, slug, owner_id), profiles, app_tags, app_media.
 */

export type AppStatus = "pending" | "approved" | "rejected";

/** Creator-controlled lifecycle (separate from moderation status). Intent only, not outcomes. */
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

/** Semantic colours for lifecycle on cards: grey (neutral), purple (seeking input). */
export const APP_LIFECYCLE_CARD_CLASS: Record<AppLifecycle, string> = {
  wip: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200",
  looking_for_feedback: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  looking_for_users: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  dormant: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300",
};

/**
 * Subtle tinted overlay for the card image/background area only.
 * Dark, muted gradients keyed by lifecycle; readable in grayscale (luminance-based).
 */
export const APP_LIFECYCLE_IMAGE_OVERLAY: Record<AppLifecycle, string> = {
  wip: "linear-gradient(to bottom, transparent 45%, rgba(24,24,27,0.04) 100%)",
  looking_for_feedback:
    "linear-gradient(to bottom, transparent 45%, rgba(46,16,101,0.06) 100%)",
  looking_for_users:
    "linear-gradient(to bottom, transparent 45%, rgba(46,16,101,0.06) 100%)",
  dormant: "linear-gradient(to bottom, transparent 45%, rgba(9,9,11,0.07) 100%)",
};

/** Creator reputation stats (approved apps only). */
export interface CreatorStats {
  /** Total votes across all approved apps. */
  totalVotes: number;
  /** Number of approved apps. */
  approvedAppsCount: number;
  /** Number of approved apps with at least CREATOR_MIN_VOTES_FOR_HIGHLIGHT votes. */
  appsWithMinVotes: number;
  /** True if creator qualifies for "Rising creator" badge. */
  risingCreator: boolean;
}

/** Minimum votes on an app to count toward "apps with X+ votes" and rising consideration. */
export const CREATOR_MIN_VOTES_FOR_HIGHLIGHT = 5;

/** Owner snippet for list/detail. */
export interface AppOwner {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  /** True if creator has active Pro subscription. */
  isPro?: boolean;
}

export type AppVisibility = "public" | "unlisted";

/** Optional: where the project runs (progressive enhancement). */
export type AppRuntimeType = "browser" | "local" | "api" | "cli" | "hybrid";

/** Optional: runtime/usage requirement (progressive enhancement). */
export type AppRequirements =
  | "none"
  | "api_key_required"
  | "local_install"
  | "account_required";

export const APP_RUNTIME_LABELS: Record<AppRuntimeType, string> = {
  browser: "Browser",
  local: "Local",
  api: "API",
  cli: "CLI",
  hybrid: "Hybrid",
};

export const APP_REQUIREMENTS_LABELS: Record<AppRequirements, string> = {
  none: "None",
  api_key_required: "API key required",
  local_install: "Local install",
  account_required: "Account required",
};

/** Collection (staff or community). owner_id null = staff-only editable. */
export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Collection with its apps (approved public only). */
export interface CollectionWithApps extends Collection {
  apps: AppListItem[];
}

/** Single app row for the /apps list: name, tagline, slug, owner, tags, primary image. */
export interface AppListItem {
  id: string;
  name: string;
  tagline: string | null;
  slug: string;
  created_at: string;
  /** Set when fetched from list; used for "Updated X days ago" momentum hint. */
  updated_at?: string;
  owner: AppOwner;
  tags: string[];
  primary_image_url: string | null;
  byok_required: boolean;
  vote_count: number;
  /** Time-decayed trending score (excludes self-votes, boosts recent activity). Used for Trending sort. */
  trending_score: number;
  lifecycle: AppLifecycle;
  /** public = in browse; unlisted = direct link only (Pro). */
  visibility: AppVisibility;
}

export interface App {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  how_used: string | null;
  status: AppStatus;
  moderationState?: AppStatus | null;
  lifecycle: AppLifecycle;
  visibility: AppVisibility;
  app_url: string | null;
  repo_url: string | null;
  rejection_reason: string | null;
  byok_required: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
  whyThisExists?: string | null;
  whatItDoes?: string | null;
  whatItDoesNot?: string | null;
  runtimeType?: AppRuntimeType | null;
  requirements?: AppRequirements | null;
  primaryTag?: string | null;
}

export interface AppWithOwner extends App {
  owner: AppOwner;
}

/** Media row for detail: url + kind for carousel (screenshots). */
export interface AppMediaItem {
  id: string;
  url: string;
  kind: "screenshot" | "logo";
  sort_order: number;
}

/** Full app for detail page: description, links, all media. */
export interface AppDetail {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  /** Optional: how the creator actually uses it — first-person, real usage. */
  how_used: string | null;
  status: AppStatus;
  /** Internal only; do not display. Same as status, exposed for API clarity. */
  moderationState?: AppStatus | null;
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
  /** Progressive: why the creator built this. */
  whyThisExists?: string | null;
  /** Progressive: short structured "what it does". Prefer over description when present. */
  whatItDoes?: string | null;
  /** Progressive: what it does not do / out of scope. */
  whatItDoesNot?: string | null;
  /** Progressive: where it runs. */
  runtimeType?: AppRuntimeType | null;
  /** Progressive: runtime/usage requirement. */
  requirements?: AppRequirements | null;
  /** Progressive: single primary category/tag for display. */
  primaryTag?: string | null;
}

export interface Creator {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppScreenshot {
  id: string;
  app_id: string;
  url: string;
  alt: string | null;
  sort_order: number;
}

/** Report row for admin list: app, reporter, reason, date. */
export interface ReportForAdmin {
  id: string;
  app_id: string;
  app_slug: string;
  app_name: string;
  reporter_id: string;
  reporter_username: string | null;
  reason: string | null;
  created_at: string;
}

/** Quick feedback kind (one per user per app). */
export type FeedbackKind = "useful" | "confusing" | "promising" | "needs_work";

/** Aggregate feedback counts; visible only to app creator. */
export interface AppFeedbackCounts {
  useful: number;
  confusing: number;
  promising: number;
  needs_work: number;
}

/** Private analytics for app owner: page views, clicks, conversion, feedback. */
export interface AppAnalytics {
  pageViews: number;
  demoClicks: number;
  repoClicks: number;
  voteCount: number;
  /** Vote conversion rate (votes / page views * 100); 0 if no page views. */
  voteConversionRate: number;
  feedbackBreakdown: AppFeedbackCounts;
  /** Pro: page views in last 7 days. */
  pageViewsLast7Days?: number;
}

/** BYOK: keys live only in localStorage; never sent to server. */
export type LlmProviderKeyId = string;
