import Link from "next/link";
import Image from "next/image";
import type { AppListItem } from "@/types";

interface AppCardProps {
  app: AppListItem;
}

export function AppCard({ app }: AppCardProps) {
  const displayName = app.owner.display_name || app.owner.username;

  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
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
      <div className="flex flex-1 flex-col p-4">
        <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 group-hover:underline">
          {app.name}
        </h2>
        {app.tagline && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
            {app.tagline}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
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
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {displayName}
            </span>
          </div>
        </div>
        {app.tags.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {app.tags.slice(0, 5).map((tag) => (
              <li
                key={tag}
                className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
