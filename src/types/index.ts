/**
 * DockOne shared types.
 * Aligned with Supabase schema: apps (name, tagline, slug, owner_id), profiles, app_tags, app_media.
 */

export type AppStatus = "pending" | "approved" | "rejected";

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
}

export interface App {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  status: AppStatus;
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

/** BYOK: keys live only in localStorage; never sent to server. */
export type LlmProviderKeyId = string;
