"use client";

import { createClientAsync } from "@/lib/supabase/client";

/**
 * Button that starts Google OAuth sign-in (redirects to Google).
 * Use in header or anywhere you want a visible "Sign in with Google" entry point.
 */
export function SignInWithGoogleButton({
  children = "Sign in with Google",
  className,
  onClick,
}: {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  async function handleClick() {
    onClick?.();
    const supabase = await createClientAsync();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
    if (!error && data?.url) window.location.href = data.url;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  );
}
