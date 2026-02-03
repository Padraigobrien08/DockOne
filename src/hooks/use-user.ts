"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Client-side hook: current Supabase user and loading state.
 * Use in Client Components only.
 *
 * Returns { user, loading } — user is null when signed out or while loading.
 */
export function useUser(): { user: User | null; loading: boolean } {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getInitial = async () => {
      const {
        data: { user: initialUser },
      } = await supabase.auth.getUser();
      setUser(initialUser ?? null);
      setLoading(false);
    };

    getInitial();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, loading };
}
