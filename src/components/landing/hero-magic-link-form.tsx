"use client";

import { useState } from "react";
import { createClientAsync } from "@/lib/supabase/client";

const EMAIL_INPUT_ID = "hero-magic-link-email";
const HELPER_ID = "hero-magic-link-helper";
const ERROR_ID = "hero-magic-link-error";
const SUCCESS_ID = "hero-magic-link-success";

export function HeroMagicLinkForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div
        id={SUCCESS_ID}
        role="status"
        aria-live="polite"
        className="rounded-lg border border-emerald-800/60 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200"
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
      className="flex flex-col gap-3"
      aria-label="Sign in with magic link"
      noValidate
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
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
          className="min-w-0 flex-1 rounded-l-lg border border-zinc-600 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-60 sm:rounded-r-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-60 disabled:pointer-events-none sm:rounded-l-none"
        >
          {loading ? "Sending…" : "Send magic link"}
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
      </div>
    </form>
  );
}
