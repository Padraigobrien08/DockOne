"use client";

import { useMemo, useState } from "react";
import type { AppListItem, AppLifecycle } from "@/types";
import type { CreatorStats } from "@/types";
import { AppCard } from "./app-card";

type SortKey = "newest" | "trending" | "alphabetical";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "trending", label: "Recent interest" },
  { value: "alphabetical", label: "A–Z" },
];

const LIFECYCLE_FILTER_OPTIONS: { value: AppLifecycle | ""; label: string }[] = [
  { value: "", label: "Any status" },
  { value: "wip", label: "Active" },
  { value: "actively_building", label: "Actively building" },
  { value: "looking_for_feedback", label: "Seeking feedback" },
  { value: "looking_for_users", label: "Looking for users" },
  { value: "dormant", label: "Archived" },
  { value: "shipped_elsewhere", label: "Graduated" },
];

function filterApps(
  apps: AppListItem[],
  query: string,
  tagFilter: string | null,
  lifecycleFilter: AppLifecycle | null
): AppListItem[] {
  const q = query.trim().toLowerCase();
  let out = apps;
  if (q) {
    out = out.filter(
      (app) =>
        app.name.toLowerCase().includes(q) ||
        (app.tagline?.toLowerCase().includes(q) ?? false) ||
        app.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (tagFilter) {
    out = out.filter((app) => app.tags.includes(tagFilter));
  }
  if (lifecycleFilter) {
    out = out.filter((app) => app.lifecycle === lifecycleFilter);
  }
  return out;
}

/** Boost amplifies score: display_score = trending_score * (1 + multiplier). */
function boostedScore(score: number, multiplier: number): number {
  return score * (1 + multiplier);
}

function sortApps(
  apps: AppListItem[],
  sort: SortKey,
  boostMap?: Map<string, number>
): AppListItem[] {
  const copy = [...apps];
  switch (sort) {
    case "newest":
      return copy.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "trending": {
      return copy.sort((a, b) => {
        const aBoost = boostMap?.get(a.id) ?? 0;
        const bBoost = boostMap?.get(b.id) ?? 0;
        const aScore = boostedScore(a.trending_score ?? 0, aBoost);
        const bScore = boostedScore(b.trending_score ?? 0, bBoost);
        return bScore - aScore || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }
    case "alphabetical":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));
    default:
      return copy;
  }
}

function topTags(apps: AppListItem[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const app of apps) {
    for (const tag of app.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}

interface AppsListProps {
  apps: AppListItem[];
  /** Map of owner id → creator stats; used to show Rising creator on cards. */
  creatorStatsMap?: Map<string, CreatorStats>;
  /** Map of app id → boost multiplier; used for trending sort and Boosted badge. */
  boostMap?: Map<string, number>;
}

export function AppsList({ apps, creatorStatsMap, boostMap }: AppsListProps) {
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [lifecycleFilter, setLifecycleFilter] = useState<AppLifecycle | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");

  const filtered = useMemo(
    () => sortApps(filterApps(apps, query, tagFilter, lifecycleFilter), sort, boostMap),
    [apps, query, tagFilter, lifecycleFilter, sort, boostMap]
  );
  const tags = useMemo(() => topTags(apps, 16), [apps]);

  return (
    <div className="space-y-5">
      {/* Primary: search */}
      <input
        type="search"
        placeholder="Search by name, tagline, or tag…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-xl rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-base text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
        aria-label="Search projects"
      />

      {/* Secondary: refine by — optional filters */}
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Refine by
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="lifecycle" className="text-xs text-zinc-500 dark:text-zinc-500">
              Status
            </label>
            <select
              id="lifecycle"
              value={lifecycleFilter ?? ""}
              onChange={(e) =>
                setLifecycleFilter((e.target.value as AppLifecycle | "") || null)
              }
              className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            >
              {LIFECYCLE_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value || "any"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-xs text-zinc-500 dark:text-zinc-500">
              Sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`rounded-full px-2.5 py-1 text-xs transition ${
                  tagFilter === tag
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
                }`}
              >
                {tag}
              </button>
            ))}
            </div>
          )}
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-500">
          Project status reflects what the creator is looking for — feedback, users, or quiet use.
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-zinc-500 dark:text-zinc-400">
          No projects match your filters.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((app) => (
            <li key={app.id}>
              <AppCard
                app={app}
                creatorStats={creatorStatsMap?.get(app.owner.id)}
                isBoosted={boostMap?.has(app.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
