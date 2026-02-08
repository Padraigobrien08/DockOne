"use client";

import type { AppAnalytics } from "@/types";

const FEEDBACK_LABELS: Record<keyof AppAnalytics["feedbackBreakdown"], string> = {
  useful: "👍 Useful",
  confusing: "🤔 Confusing",
  promising: "🔥 Promising",
  needs_work: "🧪 Needs work",
};

interface AppAnalyticsSectionProps {
  analytics: AppAnalytics;
  /** Pro: show early signals (7-day views). */
  isPro?: boolean;
  /** Creator only: show conversion rate. Hidden from non-creators. */
  showConversion?: boolean;
  className?: string;
}

/** Muted numbers for subdued Activity section. */
function formatSignal(value: number): string {
  return value === 0 ? "—" : String(value);
}

export function AppAnalyticsSection({
  analytics,
  isPro,
  showConversion = false,
  className = "",
}: AppAnalyticsSectionProps) {
  const {
    pageViews,
    demoClicks,
    repoClicks,
    voteCount,
    voteConversionRate,
    feedbackBreakdown,
    pageViewsLast7Days,
  } = analytics;
  const totalFeedback = Object.values(feedbackBreakdown).reduce((a, b) => a + b, 0);
  const isNew =
    pageViews === 0 && demoClicks === 0 && repoClicks === 0 && voteCount === 0 && totalFeedback === 0;

  return (
    <section className={className} aria-labelledby="activity-heading">
      <h2
        id="activity-heading"
        className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
      >
        Activity
      </h2>
      {isNew ? (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">Activity will show here.</p>
      ) : (
        <>
          <div className="mt-3 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
            {voteCount >= 1 && <p>First interest received</p>}
            {demoClicks >= 1 && <p>{demoClicks === 1 ? "First app open" : "App opened"}</p>}
            {repoClicks >= 1 && <p>{repoClicks === 1 ? "First repo click" : "Repo clicked"}</p>}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span>{formatSignal(pageViews)} views</span>
            <span>{formatSignal(demoClicks)} app opens</span>
            <span>{formatSignal(repoClicks)} repo clicks</span>
            {showConversion && pageViews > 0 && (
              <span>{voteConversionRate}% interest</span>
            )}
          </div>
          {totalFeedback > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              {(Object.entries(feedbackBreakdown) as [keyof AppAnalytics["feedbackBreakdown"], number][]).map(
                ([kind, count]) =>
                  count > 0 ? (
                    <li key={kind}>
                      {FEEDBACK_LABELS[kind]}: {count}
                    </li>
                  ) : null
              )}
            </ul>
          )}
        </>
      )}

      {isPro && typeof pageViewsLast7Days === "number" && (
        <div className="mt-4 rounded border border-zinc-200/80 bg-zinc-50/50 px-3 py-2 dark:border-zinc-700/80 dark:bg-zinc-800/30">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Last 7 days: {pageViewsLast7Days === 0 ? "—" : pageViewsLast7Days} views
          </p>
        </div>
      )}
      {!isPro && (
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          Planned: early signals, priority review, and more.
        </p>
      )}
    </section>
  );
}
