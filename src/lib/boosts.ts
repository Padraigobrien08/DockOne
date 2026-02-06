import { createClient } from "@/lib/supabase/server";

/** Max number of apps that can have an active boost at once (daily inventory). */
export const MAX_ACTIVE_BOOSTS = 5;

/** Default boost duration in hours. */
export const BOOST_DURATION_HOURS = 24;

/** Default multiplier: 0.5 = 50% lift (score * 1.5). */
export const BOOST_MULTIPLIER_DEFAULT = 0.5;

/**
 * Fetch active boosts (ends_at > now()). Returns app_id -> multiplier for use in trending sort.
 * Boosts amplify score: display_score = trending_score * (1 + multiplier).
 */
export async function getActiveBoosts(): Promise<Map<string, number>> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("app_boosts")
    .select("app_id, multiplier")
    .gt("ends_at", now);

  if (error) return new Map();
  const rows = (data ?? []) as { app_id: string; multiplier: number }[];
  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.app_id, Number(row.multiplier) || 0);
  }
  return map;
}

/** Count of currently active boosts (for slot limit). */
export async function countActiveBoosts(): Promise<number> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { count, error } = await supabase
    .from("app_boosts")
    .select("id", { count: "exact", head: true })
    .gt("ends_at", now);
  if (error) return MAX_ACTIVE_BOOSTS; // assume full to avoid over-grant
  return count ?? 0;
}

/** Whether this app currently has an active boost. */
export async function appHasActiveBoost(appId: string): Promise<boolean> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("app_boosts")
    .select("id")
    .eq("app_id", appId)
    .gt("ends_at", now)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}
