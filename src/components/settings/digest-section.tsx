"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateDigestOptIn } from "@/app/settings/actions";

type Props = {
  digestOptedIn: boolean;
  hasEmail: boolean;
};

export function DigestSection({ digestOptedIn, hasEmail }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      const result = await updateDigestOptIn(checked);
      if (result?.error) return;
      router.refresh();
    });
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Weekly digest</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        &quot;This week on DockOne&quot; — new projects, rising creators. One email per week.
      </p>
      {!hasEmail ? (
        <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
          Add an email to your account to receive the digest. Email is synced when you sign in with
          email or an OAuth provider that provides one.
        </p>
      ) : (
        <label className="mt-4 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={digestOptedIn}
            disabled={pending}
            onChange={(e) => handleChange(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            Send me the weekly digest
          </span>
        </label>
      )}
    </section>
  );
}
