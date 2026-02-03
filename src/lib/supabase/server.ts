import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

/**
 * Supabase server client for Server Components, Server Actions, and Route Handlers.
 * Uses cookies for auth; create one client per request via createClient().
 *
 * Env vars (set in .env.local and in Vercel → Project → Settings → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL    — Project URL from Supabase dashboard
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY — anon/public key from Supabase API settings
 */

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll from Server Component (e.g. no middleware refresh).
            // Safe to ignore if you refresh sessions in middleware/proxy.
          }
        },
      },
    }
  );
}

/**
 * Get the current user in server code (Server Components, Server Actions, Route Handlers).
 * Returns null if not authenticated.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}
