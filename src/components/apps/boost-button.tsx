"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBoost } from "@/app/apps/[slug]/actions";

interface BoostButtonProps {
  appId: string;
  slug: string;
  className?: string;
}

/** Pro: use a boost slot to amplify recent-interest score for 24h. Limited slots per day. */
export function BoostButton({ appId, slug, className = "" }: BoostButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    setPending(true);
    const result = await useBoost(appId, slug);
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
        title="Amplifies recent interest score for 24h. Limited slots, rotates daily."
        className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800 hover:bg-sky-100 disabled:opacity-50 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200 dark:hover:bg-sky-900/40"
      >
        {pending ? "…" : "Boost for 24h"}
      </button>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Amplifies recent interest score; limited slots, rotates daily.
      </p>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
