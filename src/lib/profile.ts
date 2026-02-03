import { createClient } from "@/lib/supabase/server";
import type { AppOwner } from "@/types";

export interface ProfilePublic {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

/** Fetch public profile by username. Returns null if not found. */
export async function getProfileByUsername(
  username: string
): Promise<ProfilePublic | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("username", username)
    .single();

  if (error || !data) return null;
  return data as ProfilePublic;
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

/** Resolve owner snippet by id (for links). */
export async function getOwnerById(
  ownerId: string
): Promise<AppOwner | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .eq("id", ownerId)
    .single();

  if (error || !data) return null;
  return data as AppOwner;
}
