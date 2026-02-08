import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ensureProfile } from "@/lib/supabase/ensure-profile";

/**
 * Auth callback: exchange code for session, ensure profile exists, redirect.
 * We create the redirect response first and attach session cookies to it so the
 * browser receives them; using cookies() from next/headers in a Route Handler
 * does not reliably attach cookies to a custom NextResponse.redirect().
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/sign-in`);
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(`${origin}/auth/sign-in`);
  }

  // Build the success redirect response so we can attach cookies to it
  const successRedirectUrl = `${origin}${next}`;
  let response = NextResponse.redirect(successRedirectUrl);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
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

  return response;
}
