import { createClient } from "@/lib/supabase/server";
import type { AppOwner } from "@/types";

export interface ProfilePublic {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  /** True if creator has active Pro subscription. */
  isPro: boolean;
}

function isProActive(tier: string | null, proUntil: string | null): boolean {
  if (tier !== "pro") return false;
  if (!proUntil) return true;
  return new Date(proUntil) > new Date();
}

/** Fetch public profile by username. Returns null if not found. */
export async function getProfileByUsername(username: string): Promise<ProfilePublic | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, subscription_tier, pro_until")
    .eq("username", username)
    .single();

  if (error || !data) return null;
  const row = data as ProfilePublic & { subscription_tier: string; pro_until: string | null };
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    bio: row.bio,
    isPro: isProActive(row.subscription_tier ?? "free", row.pro_until ?? null),
  };
}

/** Check if user is in admins table (for /admin access, status updates). */
export async function getIsAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

/** Check if user has active Pro subscription. */
export async function getIsPro(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("subscription_tier, pro_until")
    .eq("id", userId)
    .single();
  if (error || !data) return false;
  const row = data as { subscription_tier: string; pro_until: string | null };
  return isProActive(row.subscription_tier ?? "free", row.pro_until ?? null);
}

/** Pro "Featured for 24h" token: has this user already used one this month? */
export async function hasUsedFeaturedTokenThisMonth(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from("pro_featured_uses")
    .select("id")
    .eq("user_id", userId)
    .gte("featured_at", startOfMonth.toISOString())
    .limit(1);
  if (error) return true; // assume used to avoid double-grant
  return (data?.length ?? 0) > 0;
}

/** Resolve owner snippet by id (for links). */
export async function getOwnerById(ownerId: string): Promise<AppOwner | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, subscription_tier, pro_until")
    .eq("id", ownerId)
    .single();

  if (error || !data) return null;
  const row = data as AppOwner & { subscription_tier: string; pro_until: string | null };
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    isPro: isProActive(row.subscription_tier ?? "free", row.pro_until ?? null),
  };
}
