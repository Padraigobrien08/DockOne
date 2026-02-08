import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getApprovedApps, getFeaturedApps } from "@/lib/apps";
import { computeCreatorStatsMap } from "@/lib/creator-stats";
import { getActiveBoosts } from "@/lib/boosts";
import { AppsList } from "@/components/apps/apps-list";
import { AppCard } from "@/components/apps/app-card";

export default async function AppsPage() {
  const [apps, featured, boostMap] = await Promise.all([
    getApprovedApps(),
    getFeaturedApps(),
    getActiveBoosts(),
  ]);
  const creatorStatsMap = computeCreatorStatsMap(apps);

  return (
    <div className="py-8 sm:py-12">
      <Container size="xl">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Projects</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Working software you can see and understand — no launch, no pitch.
        </p>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
          A curated selection of working projects.
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/collections" className="underline hover:no-underline">
            Staff picks
          </Link>
        </p>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
          Search, filter by tag, or sort to find projects.
        </p>

        {featured.length > 0 && (
          <section className="mt-8" aria-labelledby="featured">
            <h2 id="featured" className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Featured <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">(24h)</span>
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((app) => (
                <li key={app.id}>
                  <AppCard
                    app={app}
                    creatorStats={creatorStatsMap.get(app.owner.id)}
                    isBoosted={boostMap.has(app.id)}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className={featured.length > 0 ? "mt-10" : "mt-8"}>
          <AppsList
            apps={apps}
            creatorStatsMap={creatorStatsMap}
            boostMap={boostMap}
          />
        </div>
        <p className="mt-12 text-center text-xs text-zinc-500 dark:text-zinc-500">
          Real submissions. Real scope. No pitch required.
        </p>
      </Container>
    </div>
  );
}
