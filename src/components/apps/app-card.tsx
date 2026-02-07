import Link from "next/link";
import Image from "next/image";
import { getTagVariant } from "@/lib/tag-variants";
import { APP_LIFECYCLE_LABELS, APP_LIFECYCLE_CARD_CLASS, APP_LIFECYCLE_IMAGE_OVERLAY } from "@/types";
import type { AppListItem, AppLifecycle, CreatorStats } from "@/types";

interface AppCardProps {
  app: AppListItem;
  /** Creator reputation stats; when present and risingCreator, show badge. */
  creatorStats?: CreatorStats | null;
  /** True if app has an active boost (amplifies trending score). */
  isBoosted?: boolean;
  /** Heading level for the app name (default 2). Use 3 when card is under an h2 section, e.g. landing. */
  headingLevel?: 2 | 3;
  /** When set, show this label instead of per-app momentum hint (e.g. "New this week" for curated sections). */
  overrideMomentumHint?: string;
  /** "landing" = minimal pills, hide interested count, subtle tags. Overrides defaults for statusPills/metadataStyle/tagsStyle when set. */
  context?: "default" | "landing";
  /** "minimal" = only one pill on image (momentum, e.g. "New this week"); hide lifecycle pill. Default = both pills. */
  statusPills?: "default" | "minimal";
  /** "landing" = hide "X interested", quieter creator row (smaller, lower opacity). Default = full metadata. */
  metadataStyle?: "default" | "landing";
  /** "subtle" = tag chips feel like metadata (lower contrast, slightly smaller). Default = standard. */
  tagsStyle?: "default" | "subtle";
  /** "premium" = bottom gradient fade, subtle unifying overlay, consistent object-cover. Default = standard. */
  imageStyle?: "default" | "premium";
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

export function AppCard({ app, creatorStats, isBoosted, headingLevel = 2, overrideMomentumHint, context = "default", statusPills, metadataStyle, tagsStyle, imageStyle = "default" }: AppCardProps) {
  const displayName = app.owner.display_name || app.owner.username;
  const lifecycle = (app.lifecycle ?? "wip") as AppLifecycle;
  const HeadingTag = headingLevel === 3 ? "h3" : "h2";

  const effectiveStatusPills = statusPills ?? (context === "landing" ? "minimal" : "default");
  const effectiveMetadataStyle = metadataStyle ?? (context === "landing" ? "landing" : "default");
  const effectiveTagsStyle = tagsStyle ?? (context === "landing" ? "subtle" : "default");

  const momentumHint = overrideMomentumHint ?? getMomentumHint(app);
  const displayMomentumHint =
    context === "landing" && effectiveStatusPills === "minimal"
      ? momentumHint === "New this week"
        ? "New this week"
        : null
      : momentumHint;

  return (
    <div className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
      <Link href={`/apps/${app.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900">
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {app.primary_image_url ? (
            <Image
              src={app.primary_image_url}
              alt=""
              width={400}
              height={225}
              className="h-full w-full object-cover object-center transition group-hover:scale-[1.02]"
            />
          ) : (
            <div
              className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-200 dark:from-zinc-800 dark:via-zinc-800/95 dark:to-zinc-900"
              aria-hidden
            >
              <span
                className="select-none font-light tracking-tight text-zinc-300/50 dark:text-zinc-600/50"
                style={{ fontSize: "clamp(3rem, 20vw, 5rem)" }}
                aria-hidden
              >
                {(app.name.charAt(0) || "?").toUpperCase()}
              </span>
            </div>
          )}
          {/* Lifecycle-based tint on image/background only; dark, muted, grayscale-safe */}
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{ background: APP_LIFECYCLE_IMAGE_OVERLAY[lifecycle] }}
            aria-hidden
          />
          {imageStyle === "premium" && app.primary_image_url && (
            <>
              <div
                className="pointer-events-none absolute inset-0 z-[1] bg-black/5"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-2/5 bg-gradient-to-t from-black/40 to-transparent"
                aria-hidden
              />
            </>
          )}
          {displayMomentumHint && (
            <span
              className="absolute left-3 top-3 z-10 rounded-full bg-white/60 px-1.5 py-0.5 text-[11px] font-normal text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-500"
              aria-label={`Momentum: ${displayMomentumHint}`}
            >
              {displayMomentumHint}
            </span>
          )}
          {effectiveStatusPills !== "minimal" && (
            <span
              className={`absolute right-3 top-3 z-10 rounded-full px-2.5 py-1 text-xs font-semibold ${APP_LIFECYCLE_CARD_CLASS[lifecycle]}`}
              aria-label={`Status: ${APP_LIFECYCLE_LABELS[lifecycle]}`}
            >
              {APP_LIFECYCLE_LABELS[lifecycle]}
            </span>
          )}
        </div>
        <div className="p-4 pb-3">
          <HeadingTag className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 md:text-2xl group-hover:underline">
            {app.name}
          </HeadingTag>
          {app.tagline && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {app.tagline}
            </p>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col border-t border-zinc-100 px-4 py-3 pb-4 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/u/${app.owner.username}`}
            className={
              effectiveMetadataStyle === "landing"
                ? "flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-400 dark:text-zinc-600 dark:hover:text-zinc-500"
                : "flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400"
            }
          >
            {app.owner.avatar_url ? (
              <Image
                src={app.owner.avatar_url}
                alt=""
                width={effectiveMetadataStyle === "landing" ? 16 : 16}
                height={effectiveMetadataStyle === "landing" ? 16 : 16}
                className="rounded-full"
              />
            ) : (
              <span className="h-4 w-4 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            )}
            <span>{displayName}</span>
          </Link>
          {app.owner.isPro && (
            <span className="rounded-full bg-emerald-100/80 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              Pro
            </span>
          )}
          {creatorStats?.risingCreator && (
            <span className="rounded-full bg-amber-100/80 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
              Rising
            </span>
          )}
          {effectiveMetadataStyle !== "landing" && typeof app.vote_count === "number" && app.vote_count > 0 && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 tabular-nums">
              {app.vote_count} interested
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {isBoosted && (
            <span className="rounded bg-sky-100/60 px-1.5 py-0.5 text-[10px] font-normal text-sky-600/90 dark:bg-sky-900/40 dark:text-sky-300/90">
              Boosted
            </span>
          )}
          {app.visibility === "unlisted" && (
            <span className="rounded bg-zinc-200/60 px-1.5 py-0.5 text-[10px] font-normal text-zinc-500 dark:bg-zinc-700/80 dark:text-zinc-400">
              Unlisted
            </span>
          )}
          {app.byok_required && (
            <span className="rounded bg-violet-100/50 px-1.5 py-0.5 text-[10px] font-normal text-violet-600/80 dark:bg-violet-950/30 dark:text-violet-400/80">
              BYOK
            </span>
          )}
          {app.tags.slice(0, 5).map((tag) => {
            const variant = getTagVariant(tag);
            const subtle = effectiveTagsStyle === "subtle";
            const base = "px-1.5 py-0.5 text-[10px] font-normal";
            const stateClass =
              "rounded-sm border-l border-zinc-400/25 pl-1.5 pr-1.5 dark:border-zinc-500/25 text-zinc-500/90 dark:text-zinc-500";
            const requirementClass =
              "rounded-sm bg-violet-50/40 dark:bg-violet-950/15 text-violet-600/80 dark:text-violet-400/80";
            const defaultClass =
              "rounded-sm bg-zinc-100/70 dark:bg-zinc-800/50 text-zinc-500/90 dark:text-zinc-500";
            const variantClass =
              variant === "state"
                ? stateClass
                : variant === "requirement"
                  ? requirementClass
                  : defaultClass;
            return (
              <span key={tag} className={[base, variantClass].filter(Boolean).join(" ").trim()}>
                {tag}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
