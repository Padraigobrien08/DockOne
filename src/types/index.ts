/**
 * DockOne shared types.
 * Aligned with Supabase schema: apps (name, tagline, slug, owner_id), profiles, app_tags, app_media.
 */

export type AppStatus = "pending" | "approved" | "rejected";

/** Creator-controlled lifecycle (separate from moderation status). */
export type AppLifecycle =
  | "wip"
  | "actively_building"
  | "looking_for_feedback"
  | "looking_for_users"
  | "dormant"
  | "shipped_elsewhere";

export const APP_LIFECYCLE_LABELS: Record<AppLifecycle, string> = {
  wip: "WIP",
  actively_building: "Actively building",
  looking_for_feedback: "Looking for feedback",
  looking_for_users: "Looking for users",
  dormant: "Dormant",
  shipped_elsewhere: "Shipped elsewhere",
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
}

/** Single app row for the /apps list: name, tagline, slug, owner, tags, primary image. */
export interface AppListItem {
  id: string;
  name: string;
  tagline: string | null;
  slug: string;
  created_at: string;
  owner: AppOwner;
  tags: string[];
  primary_image_url: string | null;
  byok_required: boolean;
  vote_count: number;
  /** Time-decayed trending score (excludes self-votes, boosts recent activity). Used for Trending sort. */
  trending_score: number;
  lifecycle: AppLifecycle;
}

export interface App {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  status: AppStatus;
  lifecycle: AppLifecycle;
  app_url: string | null;
  repo_url: string | null;
  rejection_reason: string | null;
  byok_required: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
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
  status: AppStatus;
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
}

/** BYOK: keys live only in localStorage; never sent to server. */
export type LlmProviderKeyId = string;
