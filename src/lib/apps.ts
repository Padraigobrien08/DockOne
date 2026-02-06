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
  lifecycle: string;
  visibility?: string;
  profiles: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    subscription_tier?: string | null;
    pro_until?: string | null;
  } | null;
  app_tags: { tag: string }[];
  app_media: { url: string; sort_order: number; kind: string }[];
};

type DetailRow = {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  status: string;
  lifecycle: string;
  visibility?: string;
  app_url: string | null;
  repo_url: string | null;
  demo_video_url: string | null;
  rejection_reason: string | null;
  byok_required: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
  slug: string;
  profiles: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    subscription_tier?: string | null;
    pro_until?: string | null;
  } | null;
  app_tags: { tag: string }[];
  app_media: { id: string; url: string; sort_order: number; kind: string }[];
};

function ownerIsPro(p: Row["profiles"]): boolean {
  if (!p) return false;
  if (p.subscription_tier !== "pro") return false;
  if (!p.pro_until) return true;
  return new Date(p.pro_until) > new Date();
}

function primaryImageUrl(media: Row["app_media"]): string | null {
  if (!media?.length) return null;
  const sorted = [...media].sort((a, b) => {
    const orderA = a.kind === "logo" ? 0 : 1;
    const orderB = b.kind === "logo" ? 0 : 1;
    return orderA !== orderB ? orderA - orderB : a.sort_order - b.sort_order;
  });
  return sorted[0].url;
}

async function getVoteCountsByAppIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  appIds: string[]
): Promise<Map<string, number>> {
  if (appIds.length === 0) return new Map();
  const { data } = await supabase.from("votes").select("app_id").in("app_id", appIds);
  const rows = (data ?? []) as { app_id: string }[];
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.app_id, (counts.get(row.app_id) ?? 0) + 1);
  }
  return counts;
}

/** Fetch approved apps for the list (public only). */
export async function getApprovedApps(): Promise<AppListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apps")
    .select(
      "id, name, tagline, slug, created_at, owner_id, byok_required, lifecycle, visibility, profiles!owner_id(id, username, display_name, avatar_url, subscription_tier, pro_until), app_tags(tag), app_media(url, sort_order, kind)"
    )
    .eq("status", "approved")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (error) return [];

  const rows = (data ?? []) as unknown as Row[];
  const appIds = rows.map((r) => r.id);
  const [voteCounts, trendingRows] = await Promise.all([
    getVoteCountsByAppIds(supabase, appIds),
    supabase.rpc("get_approved_apps_trending_score", { p_decay: 0.5 }),
  ]);
  const trendingByAppId = new Map(
    ((trendingRows.data ?? []) as { app_id: string; score: number }[]).map((r) => [r.app_id, r.score])
  );

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
          isPro: ownerIsPro(row.profiles),
        }
      : { id: row.owner_id, username: "unknown", display_name: null, avatar_url: null, isPro: false },
    tags: (row.app_tags ?? []).map((t) => t.tag),
    primary_image_url: primaryImageUrl(row.app_media ?? []),
    byok_required: row.byok_required ?? false,
    vote_count: voteCounts.get(row.id) ?? 0,
    trending_score: trendingByAppId.get(row.id) ?? 0,
    lifecycle: (row.lifecycle ?? "wip") as AppListItem["lifecycle"],
    visibility: (row.visibility ?? "public") as AppListItem["visibility"],
  }));
}

/** Fetch approved public apps by ids (for collections). Order of result follows order of appIds. */
export async function getApprovedAppsByIds(appIds: string[]): Promise<AppListItem[]> {
  if (appIds.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apps")
    .select(
      "id, name, tagline, slug, created_at, owner_id, byok_required, lifecycle, visibility, profiles!owner_id(id, username, display_name, avatar_url, subscription_tier, pro_until), app_tags(tag), app_media(url, sort_order, kind)"
    )
    .eq("status", "approved")
    .eq("visibility", "public")
    .in("id", appIds);

  if (error) return [];
  const rows = (data ?? []) as unknown as Row[];
  const ids = rows.map((r) => r.id);
  const [voteCounts, trendingRows] = await Promise.all([
    getVoteCountsByAppIds(supabase, ids),
    supabase.rpc("get_approved_apps_trending_score", { p_decay: 0.5 }),
  ]);
  const trendingByAppId = new Map(
    ((trendingRows.data ?? []) as { app_id: string; score: number }[]).map((r) => [r.app_id, r.score])
  );
  const list = rows.map((row) => ({
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
          isPro: ownerIsPro(row.profiles),
        }
      : { id: row.owner_id, username: "unknown", display_name: null, avatar_url: null, isPro: false },
    tags: (row.app_tags ?? []).map((t) => t.tag),
    primary_image_url: primaryImageUrl(row.app_media ?? []),
    byok_required: row.byok_required ?? false,
    vote_count: voteCounts.get(row.id) ?? 0,
    trending_score: trendingByAppId.get(row.id) ?? 0,
    lifecycle: (row.lifecycle ?? "wip") as AppListItem["lifecycle"],
    visibility: (row.visibility ?? "public") as AppListItem["visibility"],
  }));
  const byId = new Map(list.map((a) => [a.id, a]));
  return appIds.map((id) => byId.get(id)).filter(Boolean) as AppListItem[];
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
      "id, name, tagline, description, status, lifecycle, visibility, app_url, repo_url, demo_video_url, rejection_reason, byok_required, created_at, updated_at, owner_id, slug, profiles!owner_id(id, username, display_name, avatar_url, subscription_tier, pro_until), app_tags(tag), app_media(id, url, sort_order, kind)"
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

  const [voteCounts, userVote] = await Promise.all([
    getVoteCountsByAppIds(supabase, [row.id]),
    userId
      ? supabase.from("votes").select("app_id").eq("app_id", row.id).eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    id: row.id,
    slug: row.slug,
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
          isPro: ownerIsPro(row.profiles),
        }
      : { id: row.owner_id, username: "unknown", display_name: null, avatar_url: null, isPro: false },
    tags: (row.app_tags ?? []).map((t) => t.tag),
    media,
    vote_count: voteCounts.get(row.id) ?? 0,
    user_has_voted: !!userVote.data,
    lifecycle: (row.lifecycle ?? "wip") as AppDetail["lifecycle"],
    visibility: (row.visibility ?? "public") as AppDetail["visibility"],
  };
}

/** Fetch approved apps by owner (for /u/[username] profile). When viewerId !== ownerId, only public apps. */
export async function getApprovedAppsByOwnerId(
  ownerId: string,
  viewerId?: string | null
): Promise<AppListItem[]> {
  const supabase = await createClient();
  const query = supabase
    .from("apps")
    .select(
      "id, name, tagline, slug, created_at, owner_id, byok_required, lifecycle, visibility, profiles!owner_id(id, username, display_name, avatar_url, subscription_tier, pro_until), app_tags(tag), app_media(url, sort_order, kind)"
    )
    .eq("owner_id", ownerId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (viewerId !== ownerId) {
    query.eq("visibility", "public");
  }
  const { data, error } = await query;

  if (error) return [];

  const rows = (data ?? []) as unknown as Row[];
  const appIds = rows.map((r) => r.id);
  const voteCounts = await getVoteCountsByAppIds(supabase, appIds);

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
          isPro: ownerIsPro(row.profiles),
        }
      : { id: row.owner_id, username: "unknown", display_name: null, avatar_url: null, isPro: false },
    tags: (row.app_tags ?? []).map((t) => t.tag),
    primary_image_url: primaryImageUrl(row.app_media ?? []),
    byok_required: row.byok_required ?? false,
    vote_count: voteCounts.get(row.id) ?? 0,
    trending_score: 0,
    lifecycle: (row.lifecycle ?? "wip") as AppListItem["lifecycle"],
    visibility: (row.visibility ?? "public") as AppListItem["visibility"],
  }));
}

/** Fetch pending apps for admin moderation. */
export async function getPendingApps(): Promise<AppListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("apps")
    .select(
      "id, name, tagline, slug, created_at, owner_id, byok_required, lifecycle, visibility, profiles!owner_id(id, username, display_name, avatar_url, subscription_tier, pro_until), app_tags(tag), app_media(url, sort_order, kind)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) return [];

  const rows = (data ?? []) as unknown as Row[];
  const list = rows.map((row) => ({
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
          isPro: ownerIsPro(row.profiles),
        }
      : { id: row.owner_id, username: "unknown", display_name: null, avatar_url: null, isPro: false },
    tags: (row.app_tags ?? []).map((t) => t.tag),
    primary_image_url: primaryImageUrl(row.app_media ?? []),
    byok_required: row.byok_required ?? false,
    vote_count: 0,
    trending_score: 0,
    lifecycle: (row.lifecycle ?? "wip") as AppListItem["lifecycle"],
    visibility: (row.visibility ?? "public") as AppListItem["visibility"],
  }));
  // Priority queue: Pro creators first, then newest
  list.sort(
    (a, b) =>
      (a.owner.isPro ? 0 : 1) - (b.owner.isPro ? 0 : 1) ||
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  return list;
}

/** Fetch apps currently featured (Pro "Featured for 24h" active). */
export async function getFeaturedApps(): Promise<AppListItem[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data: featuredRows, error } = await supabase
    .from("pro_featured_uses")
    .select("app_id")
    .gt("expires_at", now)
    .order("featured_at", { ascending: false });

  if (error || !featuredRows?.length) return [];
  const featuredIds = (featuredRows as { app_id: string }[]).map((r) => r.app_id);
  const all = await getApprovedApps();
  const byId = new Map(all.map((a) => [a.id, a]));
  const ordered: AppListItem[] = [];
  for (const id of featuredIds) {
    const app = byId.get(id);
    if (app) ordered.push(app);
  }
  return ordered;
}
