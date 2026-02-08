import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase browser client for Client Components.
 * Single instance; safe to call from any client component.
 *
 * Env vars (set in .env and in Vercel → Project → Settings → Environment Variables):
 *   NEXT_PUBLIC_SUPABASE_URL    — Project URL from Supabase dashboard
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY — anon/public key from Supabase API settings
 *
 * When env vars are missing, returns a no-op client so the app can run (e.g. local preview).
 */

const MOCK_ERROR_MSG =
  "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env and restart the dev server.";

let client: SupabaseClient | undefined;

function mockBrowserClient(): SupabaseClient {
  const noop = () => Promise.resolve({ data: { user: null }, error: null });
  const noopSub = () => ({ data: { subscription: { unsubscribe: () => {} } } });
  const emptyRes = () => Promise.resolve({ data: [] as unknown[], error: null });
  const mockFrom = () => ({
    select: () => ({ eq: emptyRes, gte: emptyRes, order: emptyRes }),
  });
  return {
    auth: {
      getUser: noop,
      getSession: noop,
      onAuthStateChange: () => noopSub(),
      signInWithOtp: () =>
        Promise.resolve({
          data: { user: null, session: null },
          error: { message: MOCK_ERROR_MSG },
        }),
      signInWithOAuth: () =>
        Promise.resolve({
          data: { provider: null, url: null },
          error: { message: MOCK_ERROR_MSG },
        }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: mockFrom,
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
  } as unknown as SupabaseClient;
}

function getSupabaseEnv(): { url: string; key: string } {
  if (typeof window !== "undefined" && (window as unknown as { __SUPABASE_ENV__?: { url: string; key: string } }).__SUPABASE_ENV__) {
    const env = (window as unknown as { __SUPABASE_ENV__: { url: string; key: string } }).__SUPABASE_ENV__;
    if (env.url && env.key) return env;
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

export function createClient(): SupabaseClient {
  if (client) return client;
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    client = mockBrowserClient();
    return client;
  }
  client = createBrowserClient(url, key);
  return client;
}

/**
 * Like createClient() but fetches config from /api/supabase-config when env
 * vars are missing in the browser. Use this for auth flows so sign-in works
 * even when NEXT_PUBLIC_* are not inlined (e.g. dev cache).
 */
export async function createClientAsync(): Promise<SupabaseClient> {
  const env = getSupabaseEnv();
  if (env.url && env.key) return createClient();

  if (typeof window === "undefined") return createClient();

  let data: { url?: string; key?: string };
  try {
    const res = await fetch("/api/supabase-config");
    data = (await res.json()) as { url?: string; key?: string };
    if (!res.ok) {
      console.error("[DockOne] /api/supabase-config returned", res.status);
    }
  } catch (err) {
    console.error("[DockOne] Failed to fetch /api/supabase-config", err);
    return createClient();
  }

  const url = (data?.url ?? "").trim().replace(/\r$/, "");
  const key = (data?.key ?? "").trim().replace(/\r$/, "");
  if (url && key) {
    (window as unknown as { __SUPABASE_ENV__: { url: string; key: string } }).__SUPABASE_ENV__ = {
      url,
      key,
    };
    client = undefined;
    return createClient();
  }
  return createClient();
}
