"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/profile";
import { log } from "@/lib/logger";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");
  const isAdmin = await getIsAdmin(user.id);
  if (!isAdmin) redirect("/");
  return { supabase, userId: user.id };
}

export async function approveApp(appId: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("apps")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", appId);

  if (error) return { error: error.message };
  log("app_approved", { app_id: appId });
  revalidatePath("/admin");
  revalidatePath("/apps");
  return {};
}

export async function rejectApp(appId: string, reason: string | null) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("apps")
    .update({ status: "rejected", rejection_reason: reason || null })
    .eq("id", appId);

  if (error) return { error: error.message };
  log("app_rejected", { app_id: appId });
  revalidatePath("/admin");
  revalidatePath("/apps");
  return {};
}
