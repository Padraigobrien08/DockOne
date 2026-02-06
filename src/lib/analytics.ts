import { createClient } from "@/lib/supabase/server";
import { getFeedbackCountsForOwner } from "@/lib/feedback";
import type { AppAnalytics, AppFeedbackCounts } from "@/types";

type EventType = "page_view" | "demo_click" | "repo_click";

/** Record a page view (call from app detail page; skip when viewer is owner to avoid self-inflation). */
export async function recordPageView(appId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("app_analytics_events").insert({
    app_id: appId,
    event_type: "page_view",
  });
}

/** Get private analytics for an app. Returns null if viewer is not the app owner. */
export async function getAppAnalytics(
  appId: string,
  ownerId: string,
  viewerId: string | null
): Promise<AppAnalytics | null> {
  if (!viewerId || viewerId !== ownerId) return null;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const supabase = await createClient();
  const [eventsRes, eventsLast7Res, voteCountRes, feedbackCounts] = await Promise.all([
    supabase
      .from("app_analytics_events")
      .select("event_type")
      .eq("app_id", appId),
    supabase
      .from("app_analytics_events")
      .select("event_type")
      .eq("app_id", appId)
      .eq("event_type", "page_view")
      .gte("created_at", sevenDaysAgo),
    supabase.from("votes").select("app_id", { count: "exact", head: true }).eq("app_id", appId),
    getFeedbackCountsForOwner(appId, ownerId, viewerId),
  ]);

  const rows = (eventsRes.data ?? []) as { event_type: EventType }[];
  let pageViews = 0;
  let demoClicks = 0;
  let repoClicks = 0;
  for (const row of rows) {
    if (row.event_type === "page_view") pageViews++;
    else if (row.event_type === "demo_click") demoClicks++;
    else if (row.event_type === "repo_click") repoClicks++;
  }
  const pageViewsLast7Days = (eventsLast7Res.data ?? []).length;

  const voteCount = voteCountRes.count ?? 0;
  const voteConversionRate =
    pageViews > 0 ? Math.round((voteCount / pageViews) * 1000) / 10 : 0;
  const feedbackBreakdown: AppFeedbackCounts = feedbackCounts ?? {
    useful: 0,
    confusing: 0,
    promising: 0,
    needs_work: 0,
  };

  return {
    pageViews,
    demoClicks,
    repoClicks,
    voteCount,
    voteConversionRate,
    feedbackBreakdown,
    pageViewsLast7Days,
  };
}
