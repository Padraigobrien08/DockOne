const PILLS = [
  "Keys stay local (BYOK)",
  "Moderated",
  "No growth pressure",
] as const;

interface ProofStripProps {
  /** Number of approved projects (from same data as browse). */
  projectCount: number;
  /** Number of unique creators (from same data as browse). */
  creatorCount: number;
  /** e.g. "Updated daily" or a date string. */
  updatedLabel?: string;
}

export function ProofStrip({
  projectCount,
  creatorCount,
  updatedLabel = "Updated daily",
}: ProofStripProps) {
  return (
    <div
      className="flex flex-col items-center gap-3 py-4 md:flex-row md:items-baseline md:justify-between md:gap-4 md:py-5"
      aria-label="Proof strip"
    >
      {/* Left: inline stats, same baseline */}
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-zinc-300 md:justify-start">
        <span>{projectCount} projects</span>
        <span className="text-zinc-600" aria-hidden>
          ·
        </span>
        <span>{creatorCount} creators</span>
        <span className="text-zinc-600" aria-hidden>
          ·
        </span>
        <span>{updatedLabel}</span>
      </div>

      {/* Right: pill badges, same baseline */}
      <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
        {PILLS.map((label) => (
          <span
            key={label}
            className="rounded-full border border-zinc-700/70 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
