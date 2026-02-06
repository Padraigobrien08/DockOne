"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setAppFeedback } from "@/app/apps/[slug]/actions";
import type { AppFeedbackCounts, FeedbackKind } from "@/types";

const FEEDBACK_OPTIONS: { kind: FeedbackKind; label: string; emoji: string }[] = [
  { kind: "useful", label: "Useful", emoji: "👍" },
  { kind: "confusing", label: "Confusing", emoji: "🤔" },
  { kind: "promising", label: "Promising", emoji: "🔥" },
  { kind: "needs_work", label: "Needs work", emoji: "🧪" },
];

interface FeedbackButtonsProps {
  appId: string;
  slug: string;
  isOwner: boolean;
  counts: AppFeedbackCounts | null;
  currentUserKind: FeedbackKind | null;
}

export function FeedbackButtons({
  appId,
  slug,
  isOwner,
  counts,
  currentUserKind,
}: FeedbackButtonsProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleClick(kind: FeedbackKind) {
    setError(null);
    startTransition(async () => {
      const result = await setAppFeedback(appId, kind, slug);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Quick feedback
      </p>
      {error && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {error === "Sign in to leave feedback" ? (
            <>
              <Link href="/auth/sign-in" className="underline hover:no-underline">
                Sign in
              </Link>{" "}
              to leave feedback.
            </>
          ) : (
            error
          )}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {FEEDBACK_OPTIONS.map(({ kind, label, emoji }) => {
          const count = isOwner && counts ? counts[kind] : 0;
          const isSelected = currentUserKind === kind;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => handleClick(kind)}
              disabled={isPending}
              title={label}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                isSelected
                  ? "border-zinc-400 bg-zinc-100 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              aria-pressed={isSelected}
            >
              <span aria-hidden>{emoji}</span>
              <span>{label}</span>
              {isOwner && count > 0 && (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
