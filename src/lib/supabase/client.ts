import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase browser client for Client Components.
 * Single instance; safe to call from any client component.
 *
 * Env vars (set in .env.local and in Vercel → Project → Settings → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL    — Project URL from Supabase dashboard
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY — anon/public key from Supabase API settings
 *
 * When env vars are missing, returns a no-op client so the app can run (e.g. local preview).
 */

let client: SupabaseClient | undefined;

function mockBrowserClient(): SupabaseClient {
  const noop = () => Promise.resolve({ data: { user: null }, error: null });
  const noopSub = () => ({ data: { subscription: { unsubscribe: () => {} } } });
  return {
    auth: {
      getUser: noop,
      getSession: noop,
      onAuthStateChange: () => noopSub(),
      signInWithOtp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local" } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({ select: () => ({ eq: () => Promise.resolve({ data: [], error: null }) } }) },
    storage: { from: () => ({ upload: () => Promise.resolve({ error: null }), getPublicUrl: () => ({ data: { publicUrl: "" } }) }) },
  } as unknown as SupabaseClient;
}

export function createClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    client = mockBrowserClient();
    return client;
  }
  client = createBrowserClient(url, key);
  return client;
}
