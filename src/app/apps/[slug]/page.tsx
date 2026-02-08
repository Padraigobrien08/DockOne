import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Container } from "@/components/ui/container";
import { getAppBySlug } from "@/lib/apps";
import { getTagVariant } from "@/lib/tag-variants";
import { getEffectivePrimaryTag, getTagAccentStyles } from "@/lib/tag-accent";
import { getUser } from "@/lib/supabase/server";
import { hasUsedFeaturedTokenThisMonth } from "@/lib/profile";
import { ReportButton } from "@/components/apps/report-button";
import { UpvoteButton } from "@/components/apps/upvote-button";
import { FeedbackButtons } from "@/components/apps/feedback-buttons";
import { ScreenshotsCarousel } from "@/components/apps/screenshots-carousel";
import { getFeedbackCountsForOwner, getCurrentUserFeedback } from "@/lib/feedback";
import { recordPageView, getAppAnalytics } from "@/lib/analytics";
import { TrackedLink } from "@/components/apps/tracked-link";
import { FeaturedButton } from "@/components/apps/featured-button";
import { BoostButton } from "@/components/apps/boost-button";
import { getActiveBoosts, countActiveBoosts, MAX_ACTIVE_BOOSTS } from "@/lib/boosts";
import type { Metadata } from "next";
import {
  getUiLifecycleLabel,
  getUiLifecycleCardClass,
  APP_RUNTIME_LABELS,
  APP_REQUIREMENTS_LABELS,
  INTENT_TAGS,
} from "@/types";
import type { AppDetail } from "@/types";

/** Pre-launch: hide Featured/Boost and Pro surfaces (no monetisation during MVP). */
const SHOW_PROMO_FEATURES = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) return {};
  
  const title = app.name;
  const description = app.tagline?.trim() || 
    app.whatItDoes?.trim()?.slice(0, 160) ||
    app.description?.trim()?.slice(0, 160) ||
    `View ${app.name} on DockOne — working software you can see and understand.`;
  
  const metadata: Metadata = {
    title: `${title} — DockOne`,
    description,
  };
  
  if (app.visibility === "unlisted") {
    metadata.robots = { index: false, follow: true };
  }
  
  return metadata;
}

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

  const isOwner = user?.id === app.owner.id;
  const showPendingBanner = app.status === "pending" && isOwner && pendingParam === "1";

  if (!isOwner) void recordPageView(app.id);

  const [feedbackCounts, currentUserFeedback, analytics, featuredTokenUsed, boostMap, activeBoostCount] =
    await Promise.all([
      getFeedbackCountsForOwner(app.id, app.owner.id, user?.id ?? null),
      getCurrentUserFeedback(app.id, user?.id ?? null),
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
  const primaryScreenshot = screenshots[0] ?? null;
  const hasDemo = !!app.app_url?.trim();
  const explanationFromWhatItDoes = app.whatItDoes?.trim() || null;
  const explanationFromHowUsed = app.how_used?.trim() || null;
  const explanationFromDescription = app.description?.trim() || null;
  type ArtifactType = "screenshot" | "demo" | "explanation";
  const primaryArtifact: ArtifactType = primaryScreenshot
    ? "screenshot"
    : hasDemo
      ? "demo"
      : "explanation";
  const primaryExplanation =
    primaryArtifact === "explanation"
      ? explanationFromWhatItDoes || explanationFromHowUsed || explanationFromDescription
      : null;
  const primaryExplanationIsHowUsed =
    !explanationFromWhatItDoes && !!explanationFromHowUsed && primaryArtifact === "explanation";

  const displayName = app.owner.display_name || app.owner.username;
  const displayTags = app.primaryTag
    ? [app.primaryTag, ...app.tags.filter((t) => t !== app.primaryTag)]
    : app.tags;
  const effectivePrimaryTag = getEffectivePrimaryTag(app.primaryTag, app.tags);
  const accentStyles = getTagAccentStyles(effectivePrimaryTag);

  const hasAppUrl = !!app.app_url?.trim();

  // At a glance: always render with sensible defaults
  const atGlanceWhatRaw =
    app.tagline?.trim() ||
    app.whatItDoes?.trim() ||
    app.how_used?.trim() ||
    app.description?.trim() ||
    "";
  const atGlanceWhat =
    atGlanceWhatRaw &&
    (app.tagline?.trim()
      ? app.tagline.trim()
      : (() => {
          const plain = atGlanceWhatRaw
            .replace(/\n+/g, " ")
            .replace(/\s+/g, " ")
            .replace(/^#+\s*|\*\*?/g, "")
            .trim();
          const take = plain.slice(0, 220);
          const lastPeriod = take.lastIndexOf(".");
          return lastPeriod > 60 ? take.slice(0, lastPeriod + 1) : take;
        })());
  const atGlanceWhere = app.runtimeType
    ? APP_RUNTIME_LABELS[app.runtimeType]
    : app.app_url?.trim()
      ? "Runs in the browser"
      : app.repo_url?.trim()
        ? "Local or CLI — check repo"
        : "To be added";
  const atGlanceWho = "Anyone";

  /** YouTube URL → embed URL for iframe (watch, youtu.be, or embed). */
  function getYoutubeEmbedUrl(url: string): string | null {
    try {
      const u = new URL(url.trim());
      if (u.hostname === "youtu.be") {
        const id = u.pathname.slice(1).split("?")[0];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (u.hostname?.replace("www.", "") === "youtube.com") {
        const v = u.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}`;
        if (u.pathname.startsWith("/embed/")) return url;
      }
      return null;
    } catch {
      return null;
    }
  }
  const demoVideoEmbedUrl = app.demo_video_url?.trim()
    ? getYoutubeEmbedUrl(app.demo_video_url)
    : null;

  /** Strip a leading markdown heading line if it matches the block label (avoids duplicate "What it does" etc.). */
  function stripLeadingMatchingHeading(md: string, label: string): string {
    const trimmed = md.trimStart();
    const firstLine = trimmed.split("\n")[0];
    const match = firstLine?.match(/^#+\s*(.+?)\s*$/);
    if (!match) return md;
    const headingText = match[1].trim();
    if (headingText.toLowerCase() !== label.trim().toLowerCase()) return md;
    const rest = trimmed.slice(trimmed.indexOf("\n") + 1).trimStart();
    return rest || trimmed;
  }

  return (
    <div className="py-6 sm:py-10">
      <Container>
        <div
          className={`mx-auto max-w-3xl ${effectivePrimaryTag ? `pl-4 border-l-4 ${accentStyles.borderClass} sm:pl-6` : ""}`}
        >
          <Link
            href="/apps"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to projects
          </Link>
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
          {app.visibility === "unlisted" && (
            <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">
              Unlisted — accessible by link.
            </p>
          )}
          {/* Header: 1. Name 2. Tagline 3. Primary actions 4. Metadata (status, creator, tags) */}
          <header className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                {app.name}
              </h1>
              {app.tagline && (
                <p className="mt-1 text-base text-zinc-600 dark:text-zinc-400">
                  {app.tagline}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {app.app_url?.trim() ? (
                <>
                  <TrackedLink
                    appId={app.id}
                    eventType="demo_click"
                    href={app.app_url}
                    highlightPro={SHOW_PROMO_FEATURES && !!app.owner.isPro}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Open app
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </TrackedLink>
                  {app.repo_url?.trim() && (
                    <TrackedLink
                      appId={app.id}
                      eventType="repo_click"
                      href={app.repo_url}
                      highlightPro={SHOW_PROMO_FEATURES && !!app.owner.isPro}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      View repo
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </TrackedLink>
                  )}
                </>
              ) : app.repo_url?.trim() ? (
                <>
                  <TrackedLink
                    appId={app.id}
                    eventType="repo_click"
                    href={app.repo_url}
                    highlightPro={SHOW_PROMO_FEATURES && !!app.owner.isPro}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    View repo
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </TrackedLink>
                </>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/80 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-500"
                  aria-hidden
                >
                  Demo link coming soon
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400" role="group" aria-label="Project metadata">
              <span
                className={`rounded px-1.5 py-0.5 font-medium ${getUiLifecycleCardClass(app.lifecycle)}`}
              >
                {getUiLifecycleLabel(app.lifecycle)}
              </span>
              <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>·</span>
              <Link
                href={`/u/${app.owner.username}`}
                className="flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                {app.owner.avatar_url ? (
                  <Image src={app.owner.avatar_url} alt="" width={16} height={16} className="rounded-full" />
                ) : (
                  <span className="h-4 w-4 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                )}
                {displayName}
              </Link>
              {isOwner && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>·</span>
                  <Link
                    href={`/apps/${app.slug}/edit`}
                    className="hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    Edit project
                  </Link>
                </>
              )}
              {app.visibility === "unlisted" && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>·</span>
                  <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-600 dark:text-zinc-200">
                    Unlisted
                  </span>
                </>
              )}
              {displayTags.length > 0 && (
                <>
                  <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>·</span>
                  <span className="flex flex-wrap gap-1">
                    {displayTags.map((tag) => {
                      const variant = getTagVariant(tag);
                      const stateClass = "rounded border-l-2 border-zinc-400/40 pl-1 pr-1.5 py-0.5 text-zinc-500 dark:text-zinc-400";
                      const requirementClass = "rounded bg-violet-50/70 dark:bg-violet-950/25 px-1.5 py-0.5 text-violet-600 dark:text-violet-400";
                      const defaultClass = "rounded bg-zinc-100/90 dark:bg-zinc-800/70 px-1.5 py-0.5 text-zinc-500 dark:text-zinc-400";
                      const className = variant === "state" ? stateClass : variant === "requirement" ? requirementClass : defaultClass;
                      return (
                        <span key={tag} className={className}>
                          {tag}
                        </span>
                      );
                    })}
                  </span>
                </>
              )}
            </div>
            {(app.tags ?? []).some((t) => INTENT_TAGS.includes(t as (typeof INTENT_TAGS)[number])) && (
              <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500" aria-label="Creator intent">
                {(app.tags ?? []).includes("feedback") && (app.tags ?? []).includes("early-users")
                  ? "Creator is looking for feedback and early users."
                  : (app.tags ?? []).includes("feedback")
                    ? "Creator is looking for feedback."
                    : (app.tags ?? []).includes("early-users")
                      ? "Creator is looking for early users."
                      : null}
              </p>
            )}
          </header>

          {/* At a glance — cognitive anchor: what, where, who (always rendered) */}
          <section
            className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/60 px-5 py-4 dark:border-zinc-700 dark:bg-zinc-800/30"
            aria-labelledby="at-a-glance"
          >
            <h2
              id="at-a-glance"
              className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
            >
              At a glance
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  What it does
                </dt>
                <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                  {atGlanceWhat || "Short description coming soon."}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Where it runs
                </dt>
                <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                  {atGlanceWhere}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Who it&apos;s for
                </dt>
                <dd className="mt-0.5 text-zinc-700 dark:text-zinc-300">
                  {atGlanceWho}
                </dd>
              </div>
            </dl>
          </section>

          {/* Screenshots — show all uploaded screenshots (carousel when multiple); always show section so it's obvious where they go */}
          <section
            className="mt-6"
            aria-labelledby="screenshots-heading"
          >
            <h2
              id="screenshots-heading"
              className="text-sm font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-3"
            >
              Screenshots
            </h2>
            {screenshots.length > 0 ? (
              <ScreenshotsCarousel
                images={screenshots.map((s) => ({ id: s.id, url: s.url }))}
                projectName={app.name}
              />
            ) : (
              <div className="flex min-h-[140px] w-full flex-col items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50/80 px-6 py-8 dark:border-zinc-700 dark:bg-zinc-800/40">
                <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No screenshots yet. Try the app to see it live.
                </p>
                {isOwner && (
                  <p className="mt-2 text-center text-xs text-zinc-400 dark:text-zinc-500">
                    <Link href={`/apps/${app.slug}/edit`} className="underline hover:no-underline">
                      Edit project
                    </Link>
                    {" "}to add screenshots.
                  </p>
                )}
              </div>
            )}

            {demoVideoEmbedUrl && (
              <section className="mt-6" aria-labelledby="demo-video-heading">
                <h2
                  id="demo-video-heading"
                  className="sr-only"
                >
                  Demo video
                </h2>
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                  <iframe
                    src={demoVideoEmbedUrl}
                    title={`${app.name} demo video`}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </section>
            )}

            {/* More details — optional expandable; does not compete with At a glance */}
            <details
              className="mt-6 group"
              aria-labelledby="more-details-summary"
            >
              <summary
                id="more-details-summary"
                className="cursor-pointer list-none select-none text-xs font-medium uppercase tracking-wider text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 [&::-webkit-details-marker]:hidden"
              >
                <span className="inline-flex items-center gap-1.5">
                  More details
                  <svg
                    className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </summary>
              <div className="mt-4 space-y-4 border-t border-zinc-200/80 pt-4 dark:border-zinc-700/80">
                {(app.whatItDoes?.trim() || app.whatItDoesNot?.trim() || app.whyThisExists?.trim()) ? (
                  <>
                    <div className="space-y-6 max-w-2xl">
                      {app.whatItDoes?.trim() && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                            What it does
                          </p>
                          <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:text-[15px] prose-p:leading-[1.7] prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-headings:font-semibold prose-headings:tracking-tight">
                            <ReactMarkdown>{stripLeadingMatchingHeading(app.whatItDoes.trim(), "What it does")}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {app.whatItDoesNot?.trim() && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                            What it doesn&apos;t do
                          </p>
                          <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:text-[15px] prose-p:leading-[1.7] prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-headings:font-semibold prose-headings:tracking-tight">
                            <ReactMarkdown>{stripLeadingMatchingHeading(app.whatItDoesNot.trim(), "What it doesn't do")}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      {app.whyThisExists?.trim() && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                            Why it exists
                          </p>
                          <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:text-[15px] prose-p:leading-[1.7] prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-headings:font-semibold prose-headings:tracking-tight">
                            <ReactMarkdown>{stripLeadingMatchingHeading(app.whyThisExists.trim(), "Why it exists")}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                    {(app.runtimeType || (app.requirements != null)) && (
                      <div className="flex flex-wrap items-center gap-2" aria-label="Quick facts">
                        {app.runtimeType && (
                          <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                            Runtime: {APP_RUNTIME_LABELS[app.runtimeType]}
                          </span>
                        )}
                        {app.requirements != null && (
                          <span className="inline-flex items-center rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                            Requirements: {APP_REQUIREMENTS_LABELS[app.requirements]}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    More details coming soon.
                  </p>
                )}
              </div>
            </details>
            {primaryArtifact === "demo" && app.app_url && (
              <div className={`rounded-xl border border-zinc-200 bg-zinc-50/80 p-8 dark:border-zinc-700 dark:bg-zinc-800/50 ${!primaryScreenshot ? "mt-6" : ""}`}>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  What it does
                </p>
                <TrackedLink
                  appId={app.id}
                  eventType="demo_click"
                  href={app.app_url}
                  highlightPro={SHOW_PROMO_FEATURES && !!app.owner.isPro}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-3 text-base font-semibold text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Open app
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </TrackedLink>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
                  See what it does
                </p>
              </div>
            )}
            {primaryArtifact === "explanation" && primaryExplanation && (
              <div className={`rounded-xl border border-zinc-200 bg-zinc-50/80 p-6 dark:border-zinc-700 dark:bg-zinc-800/50 ${!primaryScreenshot ? "mt-6" : ""}`}>
                <p
                  id="primary-artifact"
                  className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                >
                  {primaryExplanationIsHowUsed
                    ? "How this is used"
                    : "What it does"}
                </p>
                <div className="prose prose-zinc mt-4 dark:prose-invert max-w-none prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed">
                  <ReactMarkdown>
                    {stripLeadingMatchingHeading(
                      primaryExplanation,
                      primaryExplanationIsHowUsed ? "How this is used" : "What it does"
                    )}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </section>

          {/* Supporting content — only what wasn’t the primary artifact */}
          {primaryArtifact !== "explanation" && app.how_used?.trim() && (
            <section
              className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50"
              aria-labelledby="section-how-used"
            >
              <h2
                id="section-how-used"
                className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                How this is used
              </h2>
              <div className="prose prose-zinc mt-4 dark:prose-invert max-w-none prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed">
                <ReactMarkdown>{stripLeadingMatchingHeading(app.how_used.trim(), "How this is used")}</ReactMarkdown>
              </div>
            </section>
          )}
          {primaryArtifact !== "explanation" && app.description?.trim() && (
            <section
              className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50"
              aria-labelledby="section-what"
            >
              <h2
                id="section-what"
                className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                What it does
              </h2>
              <div className="prose prose-zinc mt-4 dark:prose-invert max-w-none prose-p:text-zinc-600 dark:prose-p:text-zinc-400">
                <ReactMarkdown>{stripLeadingMatchingHeading(app.description.trim(), "What it does")}</ReactMarkdown>
              </div>
            </section>
          )}
          {primaryArtifact === "explanation" && primaryExplanationIsHowUsed && app.description?.trim() && (
            <section
              className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50"
              aria-labelledby="section-what"
            >
              <h2
                id="section-what"
                className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                What it does
              </h2>
              <div className="prose prose-zinc mt-4 dark:prose-invert max-w-none prose-p:text-zinc-600 dark:prose-p:text-zinc-400">
                <ReactMarkdown>{stripLeadingMatchingHeading(app.description.trim(), "What it does")}</ReactMarkdown>
              </div>
            </section>
          )}
          {primaryArtifact === "explanation" && !primaryExplanationIsHowUsed && app.how_used?.trim() && (
            <section
              className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50"
              aria-labelledby="section-how-used"
            >
              <h2
                id="section-how-used"
                className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
              >
                How this is used
              </h2>
              <div className="prose prose-zinc mt-4 dark:prose-invert max-w-none prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed">
                <ReactMarkdown>{stripLeadingMatchingHeading(app.how_used.trim(), "How this is used")}</ReactMarkdown>
              </div>
            </section>
          )}

          {/* Send a signal to the creator — primary interaction, intentional not reactive */}
          <section
            className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/70 px-5 py-5 dark:border-zinc-700 dark:bg-zinc-800/40"
            aria-labelledby="section-signal"
          >
            <h2
              id="section-signal"
              className="text-sm font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-300"
            >
              Send a signal to the creator
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Lightweight signals help creators understand what resonates — no comments, no rankings.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <FeedbackButtons
                appId={app.id}
                slug={app.slug}
                isOwner={!!isOwner}
                counts={feedbackCounts}
                currentUserKind={currentUserFeedback}
              />
              <span className="text-zinc-300 dark:text-zinc-600" aria-hidden>·</span>
              <UpvoteButton
                appId={app.id}
                slug={app.slug}
                voteCount={app.vote_count}
                userHasVoted={app.user_has_voted}
              />
              <ReportButton appName={app.name} appId={app.id} />
            </div>
          </section>

          {SHOW_PROMO_FEATURES && featuredTokenAvailable && (
            <FeaturedButton appId={app.id} slug={app.slug} className="mt-5" />
          )}

          {SHOW_PROMO_FEATURES && canBoost && (
            <BoostButton appId={app.id} slug={app.slug} className="mt-5" />
          )}

          {/* Activity (owner only) — subdued, trend over raw counts, no conversion */}
          {analytics && (
            <section
              className="mt-8 border-t border-zinc-200/80 pt-6 dark:border-zinc-800/80"
              aria-labelledby="activity-heading"
            >
              <h2
                id="activity-heading"
                className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
              >
                Activity
              </h2>
              <div className="mt-3 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                {analytics.pageViews === 0 &&
                analytics.demoClicks === 0 &&
                analytics.repoClicks === 0 &&
                analytics.voteCount === 0 ? (
                  <p>Activity will show here.</p>
                ) : (
                  <>
                    {analytics.voteCount >= 1 && (
                      <p>First interest received</p>
                    )}
                    {analytics.demoClicks >= 1 && (
                      <p>
                        {analytics.demoClicks === 1
                          ? "First app open"
                          : "App opened"}
                      </p>
                    )}
                    {analytics.repoClicks >= 1 && (
                      <p>
                        {analytics.repoClicks === 1
                          ? "First repo click"
                          : "Repo clicked"}
                      </p>
                    )}
                    <p className="pt-1 text-zinc-400 dark:text-zinc-500">
                      {analytics.pageViews} view{analytics.pageViews !== 1 ? "s" : ""}
                      {" · "}
                      {analytics.demoClicks} app open{analytics.demoClicks !== 1 ? "s" : ""}
                      {" · "}
                      {analytics.repoClicks} repo click{analytics.repoClicks !== 1 ? "s" : ""}
                    </p>
                  </>
                )}
              </div>
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}
