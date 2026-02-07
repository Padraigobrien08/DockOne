import Link from "next/link";
import Image from "next/image";
import { APP_LIFECYCLE_LABELS, APP_LIFECYCLE_CARD_CLASS } from "@/types";
import type { AppListItem, AppLifecycle, CreatorStats } from "@/types";

interface AppCardProps {
  app: AppListItem;
  /** Creator reputation stats; when present and risingCreator, show badge. */
  creatorStats?: CreatorStats | null;
  /** True if app has an active boost (amplifies trending score). */
  isBoosted?: boolean;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * MS_PER_DAY;

function getMomentumHint(app: AppListItem): string | null {
  const now = Date.now();
  const createdMs = new Date(app.created_at).getTime();
  const updatedMs = app.updated_at ? new Date(app.updated_at).getTime() : createdMs;

  if (now - createdMs < ONE_WEEK_MS) return "New this week";
  if (now - updatedMs < ONE_WEEK_MS) {
    const daysAgo = Math.floor((now - updatedMs) / MS_PER_DAY);
    if (daysAgo === 0) return "Updated today";
    if (daysAgo === 1) return "Updated 1 day ago";
    return `Updated ${daysAgo} days ago`;
  }
  if (app.trending_score > 0) return "Trending";
  return null;
}

export function AppCard({ app, creatorStats, isBoosted }: AppCardProps) {
  const displayName = app.owner.display_name || app.owner.username;
  const lifecycle = (app.lifecycle ?? "wip") as AppLifecycle;
  const momentumHint = getMomentumHint(app);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <Link href={`/apps/${app.slug}`} className="block">
        <div className="relative aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
          {momentumHint && (
            <span
              className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-zinc-600 shadow-sm dark:bg-zinc-900/90 dark:text-zinc-300"
              aria-label={`Momentum: ${momentumHint}`}
            >
              {momentumHint}
            </span>
          )}
          <span
            className={`absolute right-3 top-3 z-10 rounded-full px-2 py-1 text-xs font-medium ${APP_LIFECYCLE_CARD_CLASS[lifecycle]}`}
            aria-label={`Status: ${APP_LIFECYCLE_LABELS[lifecycle]}`}
          >
            {APP_LIFECYCLE_LABELS[lifecycle]}
          </span>
          {app.primary_image_url ? (
            <Image
              src={app.primary_image_url}
              alt=""
              width={400}
              height={225}
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400 dark:text-zinc-500">
              No image
            </div>
          )}
        </div>
        <div className="p-4">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:underline">
            {app.name}
          </h2>
          {app.tagline && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {app.tagline}
            </p>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/u/${app.owner.username}`}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            {app.owner.avatar_url ? (
              <Image
                src={app.owner.avatar_url}
                alt=""
                width={18}
                height={18}
                className="rounded-full"
              />
            ) : (
              <span className="h-[18px] w-[18px] rounded-full bg-zinc-300 dark:bg-zinc-600" />
            )}
            <span>{displayName}</span>
          </Link>
          {app.owner.isPro && (
            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              Pro
            </span>
          )}
          {creatorStats?.risingCreator && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              Rising
            </span>
          )}
          {typeof app.vote_count === "number" && (
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
              ↑ {app.vote_count}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {isBoosted && (
            <span className="rounded bg-sky-100 px-1.5 py-0.5 text-xs font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
              Boosted
            </span>
          )}
          {app.visibility === "unlisted" && (
            <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200">
              Unlisted
            </span>
          )}
          {app.byok_required && (
            <span className="rounded bg-violet-100 px-1.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              BYOK
            </span>
          )}
          {app.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
