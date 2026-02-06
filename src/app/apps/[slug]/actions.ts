"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
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
