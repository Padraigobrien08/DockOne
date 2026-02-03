import { NextResponse } from "next/server";

/**
 * Legacy callback path. Redirect to /auth/callback so the code is exchanged.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";
  const code = searchParams.get("code");
  const params = new URLSearchParams();
  if (code) params.set("code", code);
  if (next !== "/") params.set("next", next);
  const qs = params.toString();
  return NextResponse.redirect(new URL(`/auth/callback${qs ? `?${qs}` : ""}`, request.url));
}
