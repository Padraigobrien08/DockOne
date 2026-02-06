import { createClient } from "@/lib/supabase/server";
import type { AppFeedbackCounts, FeedbackKind } from "@/types";

/** Get aggregate feedback counts for an app. Returns only if viewer is the app owner. */
export async function getFeedbackCountsForOwner(
  appId: string,
  ownerId: string,
  viewerId: string | null
): Promise<AppFeedbackCounts | null> {
  if (!viewerId || viewerId !== ownerId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_feedback")
    .select("kind")
    .eq("app_id", appId);

  if (error) return null;

  const rows = (data ?? []) as { kind: FeedbackKind }[];
  const counts: AppFeedbackCounts = {
    useful: 0,
    confusing: 0,
    promising: 0,
    needs_work: 0,
  };
  for (const row of rows) {
    if (row.kind in counts) counts[row.kind]++;
  }
  return counts;
}

/** Get current user's feedback for an app (so we can highlight selected button). */
export async function getCurrentUserFeedback(
  appId: string,
  userId: string | null
): Promise<FeedbackKind | null> {
  if (!userId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_feedback")
    .select("kind")
    .eq("app_id", appId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return (data as { kind: FeedbackKind }).kind;
}
