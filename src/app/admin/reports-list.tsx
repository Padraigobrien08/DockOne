"use client";

import Link from "next/link";
import type { ReportForAdmin } from "@/types";

interface ReportsListProps {
  reports: ReportForAdmin[];
}

/** Fixed locale so server and client render the same string (avoids hydration mismatch). */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ReportsList({ reports }: ReportsListProps) {
  if (reports.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        No reports yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {reports.map((r) => (
        <li
          key={r.id}
          className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
        >
          <div className="min-w-0 flex-1">
            <Link
              href={`/apps/${r.app_slug}`}
              className="font-medium text-zinc-900 underline hover:no-underline dark:text-zinc-50"
            >
              {r.app_name}
            </Link>
            <span className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">
              by @{r.reporter_username ?? r.reporter_id.slice(0, 8)}
            </span>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {formatDate(r.created_at)}
          </div>
          {r.reason && (
            <p className="w-full text-sm text-zinc-600 dark:text-zinc-400 sm:mt-1">
              {r.reason}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
