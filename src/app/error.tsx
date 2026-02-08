"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in dev; consider error reporting service in production
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Something went wrong
          </h1>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            An unexpected error occurred. Please try again.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
              Error ID: {error.digest}
            </p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-3 text-base font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-5 py-3 text-base font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Go home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
