import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Container } from "@/components/ui/container";
import { getAppBySlug } from "@/lib/apps";
import { getUser } from "@/lib/supabase/server";
import { getIsAdmin, hasUsedFeaturedTokenThisMonth } from "@/lib/profile";
import { ScreenshotsCarousel } from "@/components/apps/screenshots-carousel";
import { ReportButton } from "@/components/apps/report-button";
import { UpvoteButton } from "@/components/apps/upvote-button";
import { FeedbackButtons } from "@/components/apps/feedback-buttons";
import { getFeedbackCountsForOwner, getCurrentUserFeedback } from "@/lib/feedback";
import { getCreatorStats } from "@/lib/creator-stats";
import { recordPageView, getAppAnalytics } from "@/lib/analytics";
import { TrackedLink } from "@/components/apps/tracked-link";
import { AppAnalyticsSection } from "@/components/apps/app-analytics-section";
import { FeaturedButton } from "@/components/apps/featured-button";
import { BoostButton } from "@/components/apps/boost-button";
import { StickyOpenProject } from "@/components/apps/sticky-open-project";
import { getActiveBoosts, countActiveBoosts, MAX_ACTIVE_BOOSTS } from "@/lib/boosts";
import type { Metadata } from "next";
import { APP_LIFECYCLE_LABELS, APP_LIFECYCLE_CARD_CLASS } from "@/types";
import type { AppDetail } from "@/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) return {};
  if (app.visibility === "unlisted") {
    return { robots: { index: false, follow: true } };
  }
  return {};
}

const STATUS_LABEL: Record<AppDetail["status"], string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_CLASS: Record<AppDetail["status"], string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
};

export default async function AppDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pending?: string }>;
}) {
  const { slug } = await params;
  const { pending: pendingParam } = await searchParams;
  const user = await getUser();
  const app = await getAppBySlug(slug, user?.id);
  if (!app) notFound();

  const showStatusBadge = user && (user.id === app.owner.id || (await getIsAdmin(user.id)));
  const isOwner = user?.id === app.owner.id;
  const showPendingBanner = app.status === "pending" && isOwner && pendingParam === "1";

  if (!isOwner) void recordPageView(app.id);

  const [feedbackCounts, currentUserFeedback, creatorStats, analytics, featuredTokenUsed, boostMap, activeBoostCount] =
    await Promise.all([
      getFeedbackCountsForOwner(app.id, app.owner.id, user?.id ?? null),
      getCurrentUserFeedback(app.id, user?.id ?? null),
      getCreatorStats(app.owner.id),
      isOwner ? getAppAnalytics(app.id, app.owner.id, user?.id ?? null) : Promise.resolve(null),
      isOwner && app.owner.isPro
        ? hasUsedFeaturedTokenThisMonth(app.owner.id)
        : Promise.resolve(true),
      getActiveBoosts(),
      isOwner && app.owner.isPro ? countActiveBoosts() : Promise.resolve(MAX_ACTIVE_BOOSTS),
    ]);
  const featuredTokenAvailable = isOwner && app.owner.isPro && !featuredTokenUsed;
  const isBoosted = boostMap.has(app.id);
  const canBoost = isOwner && app.owner.isPro && activeBoostCount < MAX_ACTIVE_BOOSTS && !isBoosted;

  const screenshots = app.media
    .filter((m) => m.kind === "screenshot")
    .map((m) => ({ id: m.id, url: m.url }));

  const displayName = app.owner.display_name || app.owner.username;

  return (
    <div className={`py-8 sm:py-12 ${app.app_url ? "pb-24 md:pb-28" : ""}`}>
      <Container>
        <div className="mx-auto max-w-3xl">
          {showPendingBanner && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              <strong>Pending approval.</strong> Your project is under review and will appear in the
              browse list once approved.
            </div>
          )}
          {app.status === "rejected" && isOwner && app.rejection_reason && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
              <strong>Rejection reason:</strong> {app.rejection_reason}
            </div>
          )}
          {app.byok_required && (
            <div className="mb-6 rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-200">
              <strong>BYOK compatible.</strong> This project uses an LLM. Add your OpenAI or Anthropic
              API key in{" "}
              <Link href="/settings" className="font-medium underline hover:no-underline">
                Settings
              </Link>{" "}
              so the project can use it. Keys stay in your browser and are never sent to our server.
            </div>
          )}
          {/* Hero: title + tagline only */}
          <header>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {app.name}
            </h1>
            {app.tagline && (
              <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">{app.tagline}</p>
            )}
          </header>

          {/* Tight metadata: status, creator, tags */}
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${APP_LIFECYCLE_CARD_CLASS[app.lifecycle]}`}
            >
              {APP_LIFECYCLE_LABELS[app.lifecycle]}
            </span>
            {isBoosted && (
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
                Boosted
              </span>
            )}
            {app.visibility === "unlisted" && (
              <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-600 dark:text-zinc-200">
                Unlisted
              </span>
            )}
            {showStatusBadge && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[app.status]}`}
              >
                {STATUS_LABEL[app.status]}
              </span>
            )}
            <span className="text-zinc-400 dark:text-zinc-500" aria-hidden>
              ·
            </span>
            <Link
              href={`/u/${app.owner.username}`}
              className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
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
            {app.owner.isPro && (
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                Pro
              </span>
            )}
            {creatorStats.risingCreator && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                Rising
              </span>
            )}
            {app.byok_required && (
              <span className="rounded bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                BYOK
              </span>
            )}
            {app.tags.length > 0 && (
              <>
                <span className="text-zinc-400 dark:text-zinc-500" aria-hidden>
                  ·
                </span>
                <ul className="flex flex-wrap gap-1.5">
                  {app.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Primary CTA: Open project dominant; secondary: Repo, Demo */}
          {(app.app_url || app.repo_url || app.demo_video_url) && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              {app.app_url && (
                <TrackedLink
                  appId={app.id}
                  eventType="demo_click"
                  href={app.app_url}
                  highlightPro={!!app.owner.isPro}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto sm:flex-none"
                >
                  Open project
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </TrackedLink>
              )}
              <div className="flex flex-wrap gap-2">
                {app.repo_url && (
                  <TrackedLink
                    appId={app.id}
                    eventType="repo_click"
                    href={app.repo_url}
                    highlightPro={!!app.owner.isPro}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Repo
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </TrackedLink>
                )}
                {app.demo_video_url && (
                  <a
                    href={app.demo_video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Demo video
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {app.description && (
            <div className="prose prose-zinc mt-8 dark:prose-invert max-w-none">
              <ReactMarkdown>{app.description}</ReactMarkdown>
            </div>
          )}

          {screenshots.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Screenshots</h2>
              <div className="mt-4">
                <ScreenshotsCarousel images={screenshots} />
              </div>
            </div>
          )}

          {analytics && (
            <AppAnalyticsSection
              analytics={analytics}
              isPro={!!app.owner.isPro}
              className="mt-10 border-t border-zinc-200 pt-6 dark:border-zinc-800"
            />
          )}

          {featuredTokenAvailable && (
            <FeaturedButton appId={app.id} slug={app.slug} className="mt-6" />
          )}

          {canBoost && (
            <BoostButton appId={app.id} slug={app.slug} className="mt-6" />
          )}

          <div className="mt-10 space-y-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <FeedbackButtons
              appId={app.id}
              slug={app.slug}
              isOwner={!!isOwner}
              counts={feedbackCounts}
              currentUserKind={currentUserFeedback}
            />
            <div className="flex flex-wrap items-center gap-4">
              <UpvoteButton
                appId={app.id}
                slug={app.slug}
                voteCount={app.vote_count}
                userHasVoted={app.user_has_voted}
              />
              <ReportButton appName={app.name} appId={app.id} />
            </div>
          </div>
        </div>
      </Container>
      {app.app_url && (
        <StickyOpenProject
          appId={app.id}
          href={app.app_url}
          highlightPro={!!app.owner.isPro}
        />
      )}
    </div>
  );
}
