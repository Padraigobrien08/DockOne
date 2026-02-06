import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

/**
 * Ensure a profiles row exists for the user (server-side).
 * Call after successful auth (e.g. in callback). Idempotent.
 */
export async function ensureProfile(supabase: SupabaseClient, user: User): Promise<void> {
  const { data } = await supabase.from("profiles").select("id").eq("id", user.id).single();

  const defaultUsername = `user_${user.id.replace(/-/g, "").slice(0, 12)}`;
  const email = (user as User & { email?: string }).email ?? null;

  if (data) {
    await supabase.from("profiles").update({ email }).eq("id", user.id);
    return;
  }

  await supabase.from("profiles").insert({
    id: user.id,
    username: defaultUsername,
    email,
  });
}
