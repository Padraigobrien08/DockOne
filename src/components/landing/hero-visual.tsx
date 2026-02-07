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

function ProjectCardPreview({ item }: { item: PreviewItem }) {
  const label = APP_LIFECYCLE_LABELS[item.lifecycle];
  const pillClass = APP_LIFECYCLE_CARD_CLASS[item.lifecycle];

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 px-3 py-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${pillClass}`}
          aria-hidden
        >
          {label}
        </span>
        {item.vote_count > 0 && (
          <span className="text-[10px] tabular-nums text-zinc-500" aria-hidden>
            {item.vote_count} interested
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-zinc-100">
          {item.name}
        </p>
        {item.tagline && (
          <p className="mt-0.5 truncate text-xs text-zinc-400">
            {item.tagline}
          </p>
        )}
      </div>
    </div>
  );
}

interface HeroVisualProps {
  /** Top 3 newest approved projects; when provided, previews use real data. */
  projects?: AppListItem[];
}

export function HeroVisual({ projects }: HeroVisualProps) {
  const previews: PreviewItem[] =
    projects && projects.length >= 3
      ? projects.slice(0, 3).map(toPreview)
      : MOCK_PREVIEWS;

  return (
    <div
      className="hero-visual-float relative flex min-h-[220px] w-full items-center justify-center overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/50 md:min-h-[240px]"
      aria-hidden
    >
      {/* Very subtle purple radial glow (reduced spread to avoid emptiness) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.04) 0%, transparent 50%)",
        }}
      />

      {/* Stacked ProjectCardPreview cards */}
      <div className="relative h-[180px] w-[180px] md:h-[200px] md:w-[200px] lg:w-[220px]">
        {/* Back card: rotated, blurred */}
        <div
          className="absolute left-0 top-1 w-[150px] origin-bottom-left md:left-2 md:w-[170px]"
          style={{
            transform: "rotate(-8deg) translateY(4px)",
            filter: "blur(2px)",
            opacity: 0.75,
          }}
        >
          <ProjectCardPreview item={previews[0]} />
        </div>

        {/* Middle card: slight rotation, no blur */}
        <div
          className="absolute left-3 top-3 z-10 w-[150px] origin-bottom-left md:left-5 md:w-[170px]"
          style={{
            transform: "rotate(-2deg) translateY(2px)",
            opacity: 0.92,
          }}
        >
          <ProjectCardPreview item={previews[1]} />
        </div>

        {/* Front card: crisp */}
        <div
          className="absolute right-0 top-0 z-20 w-[150px] origin-top-right shadow-xl md:right-0 md:w-[170px]"
          style={{ transform: "rotate(4deg)" }}
        >
          <ProjectCardPreview item={previews[2]} />
        </div>
      </div>
    </div>
  );
}
