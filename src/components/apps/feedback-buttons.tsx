"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setAppFeedback, clearAppFeedback } from "@/app/apps/[slug]/actions";
import type { AppFeedbackCounts, FeedbackKind } from "@/types";

/** Quiet signal options — not a review system; no scores or rankings. */
const FEEDBACK_OPTIONS: { kind: FeedbackKind; label: string }[] = [
  { kind: "useful", label: "Useful" },
  { kind: "confusing", label: "Confusing" },
  { kind: "promising", label: "Promising" },
  { kind: "needs_work", label: "Needs work" },
];

const UNDO_WINDOW_MS = 10_000;

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
  const [showSent, setShowSent] = useState(false);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  function handleClick(kind: FeedbackKind) {
    setError(null);
    setShowSent(false);
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    startTransition(async () => {
      const result = await setAppFeedback(appId, kind, slug);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      setShowSent(true);
      undoTimeoutRef.current = setTimeout(() => {
        setShowSent(false);
        undoTimeoutRef.current = null;
      }, UNDO_WINDOW_MS);
    });
  }

  function handleUndo() {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    setShowSent(false);
    startTransition(async () => {
      const result = await clearAppFeedback(appId, slug);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          {error === "Sign in to leave feedback" ? (
            <>
              <Link href="/auth/sign-in" className="underline hover:no-underline">
                Sign in
              </Link>{" "}
              to send a signal.
            </>
          ) : (
            error
          )}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {FEEDBACK_OPTIONS.map(({ kind, label }) => {
          const isSelected = currentUserKind === kind;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => handleClick(kind)}
              disabled={isPending}
              title={label}
              className={`inline-flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                isSelected
                  ? "border-zinc-400 bg-zinc-100 text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50"
                  : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
              aria-pressed={isSelected}
            >
              {label}
            </button>
          );
        })}
        {showSent && (
          <span className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span>Sent</span>
            <button
              type="button"
              onClick={handleUndo}
              disabled={isPending}
              className="underline hover:no-underline disabled:opacity-50"
            >
              Undo
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
