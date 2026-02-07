const RIGHT_ITEMS = [
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

function Separator({ className = "" }: { className?: string }) {
  return (
    <span className={`text-zinc-500 dark:text-zinc-400 ${className}`} aria-hidden>
      ·
    </span>
  );
}

function PipeSeparator({ className = "" }: { className?: string }) {
  return (
    <span className={`text-zinc-500 dark:text-zinc-400 ${className}`} aria-hidden>
      |
    </span>
  );
}

export function ProofStrip({
  projectCount,
  creatorCount,
  updatedLabel = "Updated daily",
}: ProofStripProps) {
  const projectLabel = projectCount === 1 ? "project" : "projects";
  const creatorLabel = creatorCount === 1 ? "creator" : "creators";

  return (
    <div
      className="flex flex-col gap-2 py-3 text-sm text-zinc-300 md:flex-row md:flex-wrap md:items-baseline md:justify-between md:gap-x-4 md:gap-y-1 md:py-3.5"
      aria-label="Proof strip"
    >
      {/* Left: project(s) · creator(s) · updated */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span>{projectCount} {projectLabel}</span>
        <Separator />
        <span>{creatorCount} {creatorLabel}</span>
        <Separator />
        <span>{updatedLabel}</span>
      </div>

      {/* Right: BYOK | Moderated | No growth pressure */}
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {RIGHT_ITEMS.map((label, i) => (
          <span key={label} className="flex items-center gap-x-2">
            {i > 0 && <PipeSeparator />}
            <span>{label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
