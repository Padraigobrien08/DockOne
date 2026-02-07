import {
  APP_LIFECYCLE_LABELS,
  APP_LIFECYCLE_CARD_CLASS,
  type AppLifecycle,
} from "@/types";
import type { AppListItem } from "@/types";

const MOCK_PREVIEWS = [
  { name: "CLI for the thing", tagline: "One command, done.", vote_count: 8, lifecycle: "wip" as AppLifecycle },
  { name: "Side project that stuck", tagline: "Still using it.", vote_count: 14, lifecycle: "wip" as AppLifecycle },
  { name: "Tool I actually use", tagline: "No product theatre.", vote_count: 6, lifecycle: "wip" as AppLifecycle },
];

type PreviewItem = {
  name: string;
  tagline: string | null;
  vote_count: number;
  lifecycle: AppLifecycle;
};

function toPreview(app: AppListItem): PreviewItem {
  return {
    name: app.name,
    tagline: app.tagline ?? null,
    vote_count: app.vote_count ?? 0,
    lifecycle: (app.lifecycle ?? "wip") as AppLifecycle,
  };
}

function normalizePreview(item: PreviewItem): PreviewItem {
  const tagline =
    item.tagline && /unfinished/i.test(item.tagline) ? "Simple todo project" : item.tagline;
  return { ...item, tagline: tagline ?? item.tagline };
}

function ProjectCardPreview({ item, compact = false }: { item: PreviewItem; compact?: boolean }) {
  const label = APP_LIFECYCLE_LABELS[item.lifecycle];
  const pillClass = APP_LIFECYCLE_CARD_CLASS[item.lifecycle];

  return (
    <div
      className={`overflow-hidden rounded-lg border border-zinc-600/90 bg-zinc-800/95 shadow-lg backdrop-blur-sm ${
        compact ? "px-2.5 py-2" : "px-3 py-2.5"
      }`}
    >
      <div className={`flex items-center justify-between gap-2 border-b border-zinc-600/80 ${compact ? "pb-1.5" : "pb-2"}`}>
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${pillClass}`}
          aria-hidden
        >
          {label}
        </span>
        {item.vote_count > 0 && (
          <span className="text-[10px] tabular-nums text-zinc-400" aria-hidden>
            {item.vote_count}
          </span>
        )}
      </div>
      <div className={compact ? "pt-1.5" : "pt-2"}>
        <p className={`truncate font-semibold text-white ${compact ? "text-xs" : "text-sm"}`}>
          {item.name}
        </p>
        {item.tagline && (
          <p className={`mt-0.5 truncate text-zinc-300 ${compact ? "text-[10px]" : "text-xs"}`}>
            {item.tagline}
          </p>
        )}
      </div>
    </div>
  );
}

interface HeroVisualProps {
  /** Top 3 approved projects; when provided, previews use real data. */
  projects?: AppListItem[];
}

export function HeroVisual({ projects }: HeroVisualProps) {
  const rawPreviews: PreviewItem[] =
    projects && projects.length >= 3
      ? projects.slice(0, 3).map(toPreview)
      : MOCK_PREVIEWS;
  const previews = rawPreviews.map(normalizePreview);

  return (
    <div
      className="group relative flex min-h-[280px] w-full cursor-default items-center justify-center md:min-h-[360px] md:translate-x-[5rem] md:translate-y-[3.5rem] lg:min-h-[400px] lg:translate-x-[5.5rem] lg:translate-y-[4rem]"
      aria-hidden
    >
      {/* Card stack: stronger hover lift/scale (CSS only) */}
      <div className="hero-visual-stack relative flex items-center justify-center transition-transform duration-300 ease-out group-hover:translate-y-[-10px] group-hover:scale-[1.08] motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:scale-100 md:h-[320px] md:w-[320px] lg:h-[360px] lg:w-[360px]">
        {/* Mobile: single front card, larger */}
        <div className="w-[240px] md:hidden">
          <ProjectCardPreview item={previews[2]} compact />
        </div>

        {/* Desktop: 3-card stack with perspective and depth, larger */}
        <>
          {/* Back: blurred, rotated */}
          <div
            className="absolute left-0 top-3 hidden w-[210px] origin-bottom-left lg:left-3 lg:w-[230px] md:block"
            style={{
              transform: "rotate(-10deg) translateY(6px)",
              filter: "blur(1.5px)",
              opacity: 0.7,
            }}
          >
            <ProjectCardPreview item={previews[0]} compact />
          </div>
          {/* Middle: slight rotation, soft */}
          <div
            className="absolute left-6 top-6 z-10 hidden w-[210px] origin-bottom-left lg:left-8 lg:w-[230px] md:block"
            style={{
              transform: "rotate(-3deg) translateY(2px)",
              filter: "blur(0.5px)",
              opacity: 0.85,
            }}
          >
            <ProjectCardPreview item={previews[1]} compact />
          </div>
          {/* Front: crisp */}
          <div
            className="absolute right-0 top-0 z-20 hidden w-[210px] origin-top-right shadow-xl lg:right-0 lg:w-[230px] md:block"
            style={{ transform: "rotate(5deg)" }}
          >
            <ProjectCardPreview item={previews[2]} compact />
          </div>
        </>
      </div>
    </div>
  );
}
