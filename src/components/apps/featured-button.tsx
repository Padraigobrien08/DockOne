"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFeaturedToken } from "@/app/apps/[slug]/actions";

interface FeaturedButtonProps {
  appId: string;
  slug: string;
  className?: string;
}

/** Pro "Featured for 24h" token: use 1/month to feature this app. */
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
      >
        {pending ? "…" : "⭐ Feature for 24h"}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
