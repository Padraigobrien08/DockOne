"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getIsPro, hasUsedFeaturedTokenThisMonth } from "@/lib/profile";
import {
  MAX_ACTIVE_BOOSTS,
  BOOST_DURATION_HOURS,
  BOOST_MULTIPLIER_DEFAULT,
  countActiveBoosts,
  appHasActiveBoost,
} from "@/lib/boosts";
import type { FeedbackKind } from "@/types";

export async function setAppFeedback(
  appId: string,
  kind: FeedbackKind,
  slug: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to leave feedback" };

  const { error } = await supabase
    .from("app_feedback")
    .upsert(
      { app_id: appId, user_id: user.id, kind, updated_at: new Date().toISOString() },
      { onConflict: "app_id,user_id" }
    );
  if (error) return { error: error.message };
  revalidatePath(`/apps/${slug}`);
  return {};
}

export async function submitReport(appId: string, reason: string | null): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to report" };

  const { error } = await supabase
    .from("reports")
    .insert({ app_id: appId, reporter_id: user.id, reason: reason?.trim() || null });
  if (error) return { error: error.message };
  return {};
}

export async function voteApp(appId: string, slug: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to vote" };

  const { error } = await supabase.from("votes").insert({ app_id: appId, user_id: user.id });
  if (error) {
    if (error.code === "23505") return {}; // already voted
    return { error: error.message };
  }
  revalidatePath("/apps");
  revalidatePath(`/apps/${slug}`);
  return {};
}

export async function unvoteApp(appId: string, slug: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to vote" };

  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("app_id", appId)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/apps");
  revalidatePath(`/apps/${slug}`);
  return {};
}

/** Record a link click (demo/repo) for private analytics. No auth required. */
export async function recordAppEvent(
  appId: string,
  eventType: "demo_click" | "repo_click"
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("app_analytics_events").insert({
    app_id: appId,
    event_type: eventType,
  });
}

/** Use Pro "Featured for 24h" token (1/month). Creator must be Pro and app owner. */
export async function useFeaturedToken(appId: string, slug: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to feature" };

  const isPro = await getIsPro(user.id);
  if (!isPro) return { error: "Creator Pro required to feature apps" };

  const { data: app } = await supabase
    .from("apps")
    .select("owner_id")
    .eq("id", appId)
    .single();
  if (!app || app.owner_id !== user.id) return { error: "You can only feature your own apps" };

  const used = await hasUsedFeaturedTokenThisMonth(user.id);
  if (used) return { error: "You already used your featured token this month" };

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const { error } = await supabase.from("pro_featured_uses").insert({
    user_id: user.id,
    app_id: appId,
    featured_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  });
  if (error) return { error: error.message };
  revalidatePath("/apps");
  revalidatePath(`/apps/${slug}`);
  return {};
}

/** Use a boost slot (Pro only). Boosts amplify trending score for 24h; limited slots per day. */
export async function useBoost(appId: string, slug: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to boost" };

  const isPro = await getIsPro(user.id);
  if (!isPro) return { error: "Creator Pro required to boost apps" };

  const { data: app } = await supabase
    .from("apps")
    .select("owner_id")
    .eq("id", appId)
    .single();
  if (!app || app.owner_id !== user.id) return { error: "You can only boost your own apps" };

  const [activeCount, alreadyBoosted] = await Promise.all([
    countActiveBoosts(),
    appHasActiveBoost(appId),
  ]);
  if (activeCount >= MAX_ACTIVE_BOOSTS)
    return { error: "Boost slots are full for today. Try again when a slot frees up." };
  if (alreadyBoosted) return { error: "This app is already boosted" };

  const now = new Date();
  const endsAt = new Date(now.getTime() + BOOST_DURATION_HOURS * 60 * 60 * 1000);
  const { error } = await supabase.from("app_boosts").insert({
    app_id: appId,
    starts_at: now.toISOString(),
    ends_at: endsAt.toISOString(),
    multiplier: BOOST_MULTIPLIER_DEFAULT,
  });
  if (error) return { error: error.message };
  revalidatePath("/apps");
  revalidatePath(`/apps/${slug}`);
  return {};
}
