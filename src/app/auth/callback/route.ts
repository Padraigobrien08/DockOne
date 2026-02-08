import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/ensure-profile";

/**
 * Auth callback: exchange code for session, ensure profile exists, redirect.
 * Configure Supabase Auth redirect URL to: {site}/auth/callback
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Token/code already used (e.g. magic link clicked twice) — don't leave user on sign-in with error
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("already used") || msg.includes("token already used")) {
        return NextResponse.redirect(`${origin}/?auth_message=link_used`);
      }
      return NextResponse.redirect(
        `${origin}/auth/sign-in?error=${encodeURIComponent(error.message)}`
      );
    }
    if (data.user) {
      await ensureProfile(supabase, data.user);
    }
    return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/auth/sign-in`);
}
