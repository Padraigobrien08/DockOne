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
      <Container>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Projects</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          A home for software projects that work — without the pressure to productise. Search, filter by tag, or sort.
        </p>

        {featured.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Featured <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">(24h)</span>
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      </Container>
    </div>
  );
}
