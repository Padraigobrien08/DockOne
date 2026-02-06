"use client";

import { useState } from "react";
import Link from "next/link";
import {
  addAppToCollectionBySlug,
  removeAppFromCollection,
} from "./actions";
import type { CollectionWithApps } from "@/types";

interface AdminCollectionsListProps {
  collections: CollectionWithApps[];
}

export function AdminCollectionsList({ collections }: AdminCollectionsListProps) {
  const [adding, setAdding] = useState<{ collectionId: string; slug: string } | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(collectionId: string, slug: string) {
    if (!slug.trim()) return;
    setError(null);
    setAdding({ collectionId, slug });
    const result = await addAppToCollectionBySlug(collectionId, slug.trim());
    setAdding(null);
    if (result.error) setError(result.error);
    else window.location.reload();
  }

  async function handleRemove(collectionId: string, appId: string) {
    setError(null);
    setRemoving(`${collectionId}-${appId}`);
    const result = await removeAppFromCollection(collectionId, appId);
    setRemoving(null);
    if (result.error) setError(result.error);
    else window.location.reload();
  }

  if (collections.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-zinc-50 py-6 text-center text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        No staff collections yet. Run migration 016 to seed Staff picks, Best BYOK tools, Best dev
        utilities.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </p>
      )}
      {collections.map((c) => (
        <div
          key={c.id}
          className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/collections/${c.slug}`}
              className="font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
            >
              {c.name}
            </Link>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">/collections/{c.slug}</span>
          </div>
          {c.description && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{c.description}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="App slug (e.g. hello-world)"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const form = e.currentTarget.form;
                  const slug = (form?.querySelector('input[name="slug"]') as HTMLInputElement)?.value;
                  if (slug) handleAdd(c.id, slug);
                }
              }}
              name="slug"
              id={`slug-${c.id}`}
            />
            <button
              type="button"
              onClick={() => {
                const slug = (document.getElementById(`slug-${c.id}`) as HTMLInputElement)?.value;
                if (slug) handleAdd(c.id, slug);
              }}
              disabled={!!adding}
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {adding?.collectionId === c.id ? "…" : "Add"}
            </button>
          </div>
          <ul className="mt-4 space-y-2">
            {c.apps.length === 0 ? (
              <li className="text-sm text-zinc-500 dark:text-zinc-400">No apps yet.</li>
            ) : (
              c.apps.map((app) => (
                <li
                  key={app.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800/50"
                >
                  <Link
                    href={`/apps/${app.slug}`}
                    className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    {app.name}
                  </Link>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{app.slug}</span>
                  <button
                    type="button"
                    onClick={() => handleRemove(c.id, app.id)}
                    disabled={!!removing}
                    className="rounded border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-red-900/20"
                  >
                    {removing === `${c.id}-${app.id}` ? "…" : "Remove"}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
