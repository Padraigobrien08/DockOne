import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";

/**
 * Supabase server client for Server Components, Server Actions, and Route Handlers.
 * Uses cookies for auth; create one client per request via createClient().
 *
 * Env vars (set in .env and in Vercel → Project → Settings → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL    — Project URL from Supabase dashboard
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY — anon/public key from Supabase API settings
 *
 * When env vars are missing, returns a no-op client so the app can run (e.g. local preview).
 * Auth returns no user; DB queries return empty. Set env for full functionality.
 */

function mockChain(res: { data?: unknown; error: null; count?: number } = { data: [], error: null, count: 0 }) {
  const p = Promise.resolve(res) as Promise<{ data: unknown; error: null; count?: number }> & {
    eq: typeof mockChain;
    gte: typeof mockChain;
    order: typeof mockChain;
    single: () => Promise<{ data: null; error: null }>;
    maybeSingle: () => Promise<{ data: null; error: null }>;
  };
  p.eq = mockChain;
  p.gte = mockChain;
  p.order = mockChain;
  p.single = () => Promise.resolve({ data: null, error: null });
  p.maybeSingle = () => Promise.resolve({ data: null, error: null });
  return p;
}
const mockFrom = () => ({
  select: (_cols?: string) => mockChain({ data: [], error: null }),
  insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
  update: () => ({ eq: () => Promise.resolve({ error: null }) }),
});

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
      from: mockFrom,
      storage: { from: () => ({ upload: () => Promise.resolve({ error: null }), getPublicUrl: () => ({ data: { publicUrl: "" } }) }) },
    } as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
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
  });
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
