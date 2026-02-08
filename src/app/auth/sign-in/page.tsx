"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClientAsync } from "@/lib/supabase/client";
import { Container } from "@/components/ui/container";

const RATE_LIMIT_COOLDOWN_SEC = 60;

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already used") || m.includes("token already used"))
    return "That sign-in link was already used. Request a new link below, or go home — you may already be signed in.";
  if (m.includes("rate limit") || m.includes("wait") || m.includes("seconds"))
    return "Too many attempts. Please wait a minute before requesting another link.";
  return message;
}

function isRateLimitError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("rate limit") || m.includes("wait") || /\d+\s*seconds?/.test(m);
}

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldownSec, setCooldownSec] = useState(0);

  const urlError = searchParams.get("error");
  useEffect(() => {
    if (urlError) {
      setError(friendlyError(urlError));
      if (isRateLimitError(urlError)) setCooldownSec(RATE_LIMIT_COOLDOWN_SEC);
    }
  }, [urlError]);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const t = setInterval(() => {
      setCooldownSec((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownSec]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = await createClientAsync();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
      },
    });
    setLoading(false);
    if (err) {
      setError(friendlyError(err.message));
      if (isRateLimitError(err.message)) setCooldownSec(RATE_LIMIT_COOLDOWN_SEC);
      return;
    }
    setSent(true);
  }

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-sm">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            We’ll send you a magic link — no password.
          </p>

          {sent ? (
            <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-700 dark:text-zinc-300">
                Check your inbox for a sign-in link. Click it to finish.
              </p>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                You can close this tab.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
                />
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <button
                type="submit"
                disabled={loading || cooldownSec > 0}
                className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {loading ? "Sending…" : cooldownSec > 0 ? `Wait ${cooldownSec}s` : "Send magic link"}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <Link
              href="/"
              className="text-zinc-700 underline hover:no-underline dark:text-zinc-300"
            >
              Back to home
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
