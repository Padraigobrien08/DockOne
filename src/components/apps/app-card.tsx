import Link from "next/link";
import Image from "next/image";
import { APP_LIFECYCLE_LABELS } from "@/types";
import type { AppListItem, CreatorStats } from "@/types";

interface AppCardProps {
  app: AppListItem;
  /** Creator reputation stats; when present and risingCreator, show badge. */
  creatorStats?: CreatorStats | null;
}

export function AppCard({ app, creatorStats }: AppCardProps) {
  const displayName = app.owner.display_name || app.owner.username;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <Link href={`/apps/${app.slug}`} className="block">
        <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-800">
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
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 group-hover:underline">
            {app.name}
          </h2>
          {app.tagline && (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
              {app.tagline}
            </p>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/u/${app.owner.username}`}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
          >
            {app.owner.avatar_url ? (
              <Image
                src={app.owner.avatar_url}
                alt=""
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <span className="h-5 w-5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            )}
            <span>{displayName}</span>
          </Link>
          {creatorStats?.risingCreator && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              Rising
            </span>
          )}
          {typeof app.vote_count === "number" && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              ↑ {app.vote_count}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
            {APP_LIFECYCLE_LABELS[app.lifecycle]}
          </span>
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
