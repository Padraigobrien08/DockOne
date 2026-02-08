"use client";

import { useState, useEffect } from "react";
import { createClientAsync } from "@/lib/supabase/client";

const EMAIL_INPUT_ID = "hero-magic-link-email";
const HELPER_ID = "hero-magic-link-helper";
const ERROR_ID = "hero-magic-link-error";
const SUCCESS_ID = "hero-magic-link-success";
const RATE_LIMIT_COOLDOWN_SEC = 60;

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate limit") || m.includes("wait") || m.includes("seconds"))
    return "Too many attempts. Please wait a minute before requesting another link.";
  return message;
}

function isRateLimitError(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("rate limit") || m.includes("wait") || /\d+\s*seconds?/.test(m);
}

export function HeroMagicLinkForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const t = setInterval(() => setCooldownSec((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldownSec]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const value = email.trim();
    if (!value) return;
    setLoading(true);
    const supabase = await createClientAsync();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: value,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : undefined,
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

  async function handleGoogleSignIn() {
    setError(null);
    const supabase = await createClientAsync();
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { data, error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
    if (err) {
      setError(err.message);
      return;
    }
    if (data?.url) window.location.href = data.url;
  }

  if (sent) {
    return (
      <div
        id={SUCCESS_ID}
        role="status"
        aria-live="polite"
        className="w-full rounded-lg border border-emerald-800/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200"
      >
        <p className="font-medium">Check your inbox.</p>
        <p className="mt-1 text-emerald-300/90">
          We sent a sign-in link to <span className="font-medium">{email.trim()}</span>. Click it to continue.
        </p>
      </div>
    );
  }

  const describedBy = error ? `${ERROR_ID} ${HELPER_ID}` : HELPER_ID;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-3"
      aria-label="Sign in with magic link"
      noValidate
    >
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-0">
        <label htmlFor={EMAIL_INPUT_ID} className="sr-only">
          Email address
        </label>
        <input
          id={EMAIL_INPUT_ID}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={loading}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          className="min-w-0 flex-1 rounded-lg border border-zinc-700/70 bg-zinc-800/40 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-60 sm:rounded-r-none"
        />
        <button
          type="submit"
          disabled={loading || cooldownSec > 0}
          className="w-full rounded-lg bg-violet-600 px-5 py-3.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-60 disabled:pointer-events-none sm:w-auto sm:rounded-l-none"
        >
          {loading ? "Sending…" : cooldownSec > 0 ? `Wait ${cooldownSec}s` : "Send magic link"}
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <p id={HELPER_ID} className="text-xs text-zinc-500 dark:text-zinc-400">
          No password. Just a sign-in link.
        </p>
        {error && (
          <p
            id={ERROR_ID}
            role="alert"
            className="text-sm text-red-400"
            aria-live="assertive"
          >
            {error}
          </p>
        )}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs text-zinc-500">Or</span>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="text-sm font-medium text-violet-400 hover:text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </form>
  );
}
