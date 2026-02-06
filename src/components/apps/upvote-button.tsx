"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { voteApp, unvoteApp } from "@/app/apps/[slug]/actions";

interface UpvoteButtonProps {
  appId: string;
  slug: string;
  voteCount: number;
  userHasVoted: boolean;
}

export function UpvoteButton({ appId, slug, voteCount: initialCount, userHasVoted: initialVoted }: UpvoteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      if (initialVoted) {
        await unvoteApp(appId, slug);
      } else {
        await voteApp(appId, slug);
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${
        initialVoted
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300"
          : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
      }`}
      aria-pressed={initialVoted}
    >
      <span aria-hidden>↑</span>
      <span>{initialCount}</span>
    </button>
  );
}
