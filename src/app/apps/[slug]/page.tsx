import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Container } from "@/components/ui/container";
import { getAppBySlug } from "@/lib/apps";
import { getUser } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/profile";
import { ScreenshotsCarousel } from "@/components/apps/screenshots-carousel";
import { ReportButton } from "@/components/apps/report-button";
import type { AppDetail } from "@/types";

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

  const showStatusBadge =
    user &&
    (user.id === app.owner.id || (await getIsAdmin(user.id)));
  const isOwner = user?.id === app.owner.id;
  const showPendingBanner =
    app.status === "pending" && isOwner && pendingParam === "1";

  const screenshots = app.media
    .filter((m) => m.kind === "screenshot")
    .map((m) => ({ id: m.id, url: m.url }));

  const displayName = app.owner.display_name || app.owner.username;

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <div className="mx-auto max-w-3xl">
          {showPendingBanner && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              <strong>Pending approval.</strong> Your app is under review and will appear in the browse list once approved.
            </div>
          )}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
                {app.name}
              </h1>
              {app.tagline && (
                <p className="mt-1 text-lg text-zinc-600 dark:text-zinc-400">
                  {app.tagline}
                </p>
              )}
            </div>
            {showStatusBadge && (
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_CLASS[app.status]}`}
              >
                {STATUS_LABEL[app.status]}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Link
              href={`/u/${app.owner.username}`}
              className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {app.owner.avatar_url ? (
                <Image
                  src={app.owner.avatar_url}
                  alt=""
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <span className="h-6 w-6 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              )}
              <span>{displayName}</span>
            </Link>
            {app.tags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {app.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {(app.app_url || app.repo_url || app.demo_video_url) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {app.app_url && (
                <a
                  href={app.app_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Open app
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {app.repo_url && (
                <a
                  href={app.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Repo
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
              {app.demo_video_url && (
                <a
                  href={app.demo_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Demo video
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          )}

          {app.description && (
            <div className="prose prose-zinc mt-8 dark:prose-invert max-w-none">
              <ReactMarkdown>{app.description}</ReactMarkdown>
            </div>
          )}

          {screenshots.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                Screenshots
              </h2>
              <div className="mt-4">
                <ScreenshotsCarousel images={screenshots} />
              </div>
            </div>
          )}

          <div className="mt-10 flex items-center gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <ReportButton appName={app.name} />
          </div>
        </div>
      </Container>
    </div>
  );
}
