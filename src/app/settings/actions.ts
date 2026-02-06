"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateDigestOptIn(optedIn: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ digest_opted_in: optedIn })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return {};
}
