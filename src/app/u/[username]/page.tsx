import { notFound } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { getUser } from "@/lib/supabase/server";
import { getProfileByUsername } from "@/lib/profile";
import { getApprovedAppsByOwnerId } from "@/lib/apps";
import { getCreatorStats } from "@/lib/creator-stats";
import { AppCard } from "@/components/apps/app-card";
import { CREATOR_MIN_VOTES_FOR_HIGHLIGHT } from "@/types";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const user = await getUser();
  const [apps, stats] = await Promise.all([
    getApprovedAppsByOwnerId(profile.id, user?.id ?? null),
    getCreatorStats(profile.id),
  ]);
  const displayName = profile.display_name || profile.username;

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div
            className={`flex flex-col items-start gap-6 sm:flex-row sm:items-center ${profile.isPro ? "rounded-xl border-l-4 border-emerald-500 bg-emerald-50/50 pl-4 dark:bg-emerald-950/20" : ""}`}
          >
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {displayName}
                </h1>
                {profile.isPro && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                    Pro
                  </span>
                )}
                {stats.risingCreator && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                    Rising creator
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{profile.bio}</p>
              )}
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {stats.totalVotes}
                  </span>{" "}
                  total votes
                </div>
                <div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {stats.approvedAppsCount}
                  </span>{" "}
                  approved {stats.approvedAppsCount === 1 ? "project" : "projects"}
                </div>
                {stats.appsWithMinVotes > 0 && (
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                      {stats.appsWithMinVotes}
                    </span>{" "}
                    project{stats.appsWithMinVotes === 1 ? "" : "s"} with{" "}
                    {CREATOR_MIN_VOTES_FOR_HIGHLIGHT}+ votes
                  </div>
                )}
              </dl>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Projects</h2>
            {apps.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No approved projects yet.</p>
            ) : (
              <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {apps.map((app) => (
                  <li key={app.id}>
                    <AppCard app={app} creatorStats={stats} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}
