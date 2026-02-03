"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { approveApp, rejectApp } from "./actions";
import type { AppListItem } from "@/types";

interface PendingListProps {
  apps: AppListItem[];
}

export function PendingList({ apps }: PendingListProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleApprove(appId: string) {
    setError(null);
    setPendingId(appId);
    const result = await approveApp(appId);
    setPendingId(null);
    if (result.error) setError(result.error);
  }

  async function handleReject(appId: string) {
    if (rejectingId !== appId) {
      setRejectingId(appId);
      setReason("");
      setError(null);
      return;
    }
    setError(null);
    setPendingId(appId);
    const result = await rejectApp(appId, reason.trim() || null);
    setPendingId(null);
    setRejectingId(null);
    setReason("");
    if (result.error) setError(result.error);
  }

  if (apps.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-zinc-50 py-8 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        No pending apps.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </p>
      )}
      <ul className="space-y-4">
        {apps.map((app) => (
          <li
            key={app.id}
            className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-start sm:gap-6"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  {app.primary_image_url ? (
                    <Image
                      src={app.primary_image_url}
                      alt=""
                      width={112}
                      height={64}
                      className="h-16 w-28 object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-zinc-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/apps/${app.slug}`}
                    className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    {app.name}
                  </Link>
                  {app.tagline && (
                    <p className="mt-0.5 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {app.tagline}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    by {app.owner.display_name || app.owner.username} ·{" "}
                    <Link href={`/u/${app.owner.username}`} className="hover:underline">
                      @{app.owner.username}
                    </Link>
                  </p>
                  {app.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {app.tags.slice(0, 5).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {rejectingId === app.id && (
                <div className="mt-3">
                  <label htmlFor={`reason-${app.id}`} className="sr-only">
                    Rejection reason (optional)
                  </label>
                  <input
                    id={`reason-${app.id}`}
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Optional reason for rejection"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <button
                type="button"
                onClick={() => handleApprove(app.id)}
                disabled={!!pendingId}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {pendingId === app.id ? "…" : "Approve"}
              </button>
              <button
                type="button"
                onClick={() => handleReject(app.id)}
                disabled={!!pendingId}
                className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-red-900/20"
              >
                {pendingId === app.id
                  ? "…"
                  : rejectingId === app.id
                    ? "Reject (confirm)"
                    : "Reject"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
