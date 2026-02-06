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
  /** Pro: show advanced analytics (7-day views). */
  isPro?: boolean;
  className?: string;
}

/** Private analytics for app owner: page views, clicks, conversion, feedback. */
export function AppAnalyticsSection({
  analytics,
  isPro,
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

  return (
    <section className={className}>
      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        Analytics <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">(private)</span>
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{pageViews}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Page views</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{demoClicks}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Demo / app clicks</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{repoClicks}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Repo clicks</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
          <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {pageViews > 0 ? `${voteConversionRate}%` : "—"}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Vote conversion ({voteCount} votes)
          </p>
        </div>
      </div>
      {totalFeedback > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Feedback breakdown</p>
          <ul className="mt-2 flex flex-wrap gap-3 text-sm text-zinc-600 dark:text-zinc-400">
            {(Object.entries(feedbackBreakdown) as [keyof AppAnalytics["feedbackBreakdown"], number][]).map(
              ([kind, count]) =>
                count > 0 ? (
                  <li key={kind}>
                    {FEEDBACK_LABELS[kind]}: <strong className="text-zinc-900 dark:text-zinc-50">{count}</strong>
                  </li>
                ) : null
            )}
          </ul>
        </div>
      )}

      {isPro && typeof pageViewsLast7Days === "number" && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Advanced (Pro)</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">
            {pageViewsLast7Days}
          </p>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">Page views (last 7 days)</p>
        </div>
      )}
      {!isPro && (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Upgrade to <span className="font-medium text-zinc-700 dark:text-zinc-300">Creator Pro</span> for
          advanced analytics (7-day breakdown, priority review, featured token, profile branding).
        </p>
      )}
    </section>
  );
}
