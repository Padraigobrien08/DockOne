import { createClient } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/profile";
import type { AppListItem, AppDetail } from "@/types";

type Row = {
  id: string;
  name: string;
  tagline: string | null;
  slug: string;
  created_at: string;
  owner_id: string;
  byok_required: boolean;
  profiles: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null;
  app_tags: { tag: string }[];
  app_media: { url: string; sort_order: number; kind: string }[];
};

type DetailRow = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  status: string;
  app_url: string | null;
  repo_url: string | null;
  demo_video_url: string | null;
  rejection_reason: string | null;
  byok_required: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
  slug: string;
  profiles: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null;
  app_tags: { tag: string }[];
  app_media: { id: string; url: string; sort_order: number; kind: string }[];
};

function primaryImageUrl(media: Row["app_media"]): string | null {
  if (!media?.length) return null;
  const sorted = [...media].sort((a, b) => {
    const orderA = a.kind === "logo" ? 0 : 1;
    const orderB = b.kind === "logo" ? 0 : 1;
    return orderA !== orderB ? orderA - orderB : a.sort_order - b.sort_order;
  });
  return sorted[0].url;
}

/** Fetch approved apps for the list: name, tagline, slug, owner, tags, primary image. */
export async function getApprovedApps(): Promise<AppListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apps")
    .select(
      "id, name, tagline, slug, created_at, owner_id, byok_required, profiles!owner_id(id, username, display_name, avatar_url), app_tags(tag), app_media(url, sort_order, kind)"
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) return [];

  const rows = (data ?? []) as unknown as Row[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    slug: row.slug,
    created_at: row.created_at,
    owner: row.profiles
      ? {
          id: row.profiles.id,
          username: row.profiles.username,
          display_name: row.profiles.display_name,
          avatar_url: row.profiles.avatar_url,
        }
      : { id: row.owner_id, username: "unknown", display_name: null, avatar_url: null },
    tags: (row.app_tags ?? []).map((t) => t.tag),
    primary_image_url: primaryImageUrl(row.app_media ?? []),
    byok_required: row.byok_required ?? false,
  }));
}

/** Fetch app by slug. Approved only, or pending/rejected if current user is owner or admin. */
export async function getAppBySlug(
  slug: string,
  userId?: string | null
): Promise<AppDetail | null> {
  const supabase = await createClient();
  const query = supabase
    .from("apps")
    .select(
      "id, name, tagline, description, status, app_url, repo_url, demo_video_url, rejection_reason, byok_required, created_at, updated_at, owner_id, slug, profiles!owner_id(id, username, display_name, avatar_url), app_tags(tag), app_media(id, url, sort_order, kind)"
    )
    .eq("slug", slug);

  const { data: rows, error } = await query.maybeSingle();
  if (error || !rows) return null;

  const row = rows as unknown as DetailRow;
  const status = row.status as AppDetail["status"];
  const isApproved = status === "approved";
  const isOwner = userId && row.owner_id === userId;
  const isAdmin = userId ? await getIsAdmin(userId) : false;
  if (!isApproved && !isOwner && !isAdmin) return null;

  const media = (row.app_media ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => ({
      id: m.id,
      url: m.url,
      kind: m.kind as AppDetail["media"][0]["kind"],
      sort_order: m.sort_order,
    }));

  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    status,
    app_url: row.app_url,
    repo_url: row.repo_url,
    demo_video_url: row.demo_video_url,
    rejection_reason: row.rejection_reason ?? null,
    byok_required: row.byok_required ?? false,
    created_at: row.created_at,
    updated_at: row.updated_at,
    owner: row.profiles
      ? {
          id: row.profiles.id,
          username: row.profiles.username,
          display_name: row.profiles.display_name,
          avatar_url: row.profiles.avatar_url,
        }
      : { id: row.owner_id, username: "unknown", display_name: null, avatar_url: null },
    tags: (row.app_tags ?? []).map((t) => t.tag),
    media,
  };
}

/** Fetch approved apps by owner (for /u/[username] profile). */
export async function getApprovedAppsByOwnerId(
  ownerId: string
): Promise<AppListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apps")
    .select(
      "id, name, tagline, slug, created_at, owner_id, byok_required, profiles!owner_id(id, username, display_name, avatar_url), app_tags(tag), app_media(url, sort_order, kind)"
    )
    .eq("owner_id", ownerId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) return [];

  const rows = (data ?? []) as unknown as Row[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    slug: row.slug,
    created_at: row.created_at,
    owner: row.profiles
      ? {
          id: row.profiles.id,
          username: row.profiles.username,
          display_name: row.profiles.display_name,
          avatar_url: row.profiles.avatar_url,
        }
      : { id: row.owner_id, username: "unknown", display_name: null, avatar_url: null },
    tags: (row.app_tags ?? []).map((t) => t.tag),
    primary_image_url: primaryImageUrl(row.app_media ?? []),
    byok_required: row.byok_required ?? false,
  }));
}

/** Fetch pending apps for admin moderation. */
export async function getPendingApps(): Promise<AppListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apps")
    .select(
      "id, name, tagline, slug, created_at, owner_id, byok_required, profiles!owner_id(id, username, display_name, avatar_url), app_tags(tag), app_media(url, sort_order, kind)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return [];

  const rows = (data ?? []) as unknown as Row[];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    slug: row.slug,
    created_at: row.created_at,
    owner: row.profiles
      ? {
          id: row.profiles.id,
          username: row.profiles.username,
          display_name: row.profiles.display_name,
          avatar_url: row.profiles.avatar_url,
        }
      : { id: row.owner_id, username: "unknown", display_name: null, avatar_url: null },
    tags: (row.app_tags ?? []).map((t) => t.tag),
    primary_image_url: primaryImageUrl(row.app_media ?? []),
    byok_required: row.byok_required ?? false,
  }));
}
