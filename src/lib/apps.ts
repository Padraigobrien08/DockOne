import { createClient } from "@/lib/supabase/server";
import type { AppListItem } from "@/types";

type Row = {
  id: string;
  name: string;
  tagline: string | null;
  slug: string;
  created_at: string;
  owner_id: string;
  profiles: { id: string; username: string; display_name: string | null; avatar_url: string | null } | null;
  app_tags: { tag: string }[];
  app_media: { url: string; sort_order: number; kind: string }[];
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
      "id, name, tagline, slug, created_at, owner_id, profiles!owner_id(id, username, display_name, avatar_url), app_tags(tag), app_media(url, sort_order, kind)"
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
  }));
}
