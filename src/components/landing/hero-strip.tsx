import { Container } from "@/components/ui/container";
import { ProofStrip } from "@/components/landing/proof-strip";

export interface HeroStripProps {
  /** Number of approved projects (from same data as browse). */
  projectCount: number;
  /** Number of unique creators (from same data as browse). */
  creatorCount: number;
  /** e.g. "Updated daily" or a date string. */
  updatedLabel?: string;
}

/**
 * Thin full-width strip under the hero: border styling, container width, two-cluster layout.
 * Used on the landing page only.
 */
export function HeroStrip({
  projectCount,
  creatorCount,
  updatedLabel = "Updated daily",
}: HeroStripProps) {
  return (
    <section
      className="w-full border-t border-b border-zinc-600/25 py-3 dark:border-zinc-500/20"
      aria-label="Stats and trust"
    >
      <Container size="wide">
        <ProofStrip
          projectCount={projectCount}
          creatorCount={creatorCount}
          updatedLabel={updatedLabel}
        />
      </Container>
    </section>
  );
}
