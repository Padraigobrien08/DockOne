import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase browser client for Client Components.
 * Single instance; safe to call from any client component.
 *
 * Env vars (set in .env.local and in Vercel → Project → Settings → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL    — Project URL from Supabase dashboard
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY — anon/public key from Supabase API settings
 */

let client: SupabaseClient | undefined;

export function createClient() {
  if (client) return client;
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return client;
}
