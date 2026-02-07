"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFeaturedToken } from "@/app/apps/[slug]/actions";

interface FeaturedButtonProps {
  appId: string;
  slug: string;
  className?: string;
}

/** Pro featured token: 1/month to feature this project for 24h. */
export function FeaturedButton({ appId, slug, className = "" }: FeaturedButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setPending(true);
    const result = await useFeaturedToken(appId, slug);
    setPending(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        title="Featured token (limited use). One per month."
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
      >
        {pending ? "…" : "Featured for 24h"}
      </button>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Featured token — 1 per month.</p>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
