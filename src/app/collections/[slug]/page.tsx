import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getCollectionBySlug } from "@/lib/collections";
import { computeCreatorStatsMap } from "@/lib/creator-stats";
import { getActiveBoosts } from "@/lib/boosts";
import { AppCard } from "@/components/apps/app-card";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return {
    title: collection.name,
    description:
      collection.description ?? `Curated collection: ${collection.name}. ${collection.apps.length} apps.`,
  };
}

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const [creatorStatsMap, boostMap] = await Promise.all([
    computeCreatorStatsMap(collection.apps),
    getActiveBoosts(),
  ]);

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/collections" className="hover:text-zinc-700 dark:hover:text-zinc-300">
            ← Collections
          </Link>
        </nav>
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              {collection.name}
            </h1>
            {!collection.owner_id && (
              <span className="rounded bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                Staff pick
              </span>
            )}
          </div>
          {collection.description && (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {collection.description}
            </p>
          )}
        </header>

        {collection.apps.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
            No apps in this collection yet.
          </p>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collection.apps.map((app) => (
              <li key={app.id}>
                <AppCard
                  app={app}
                  creatorStats={creatorStatsMap.get(app.owner.id)}
                  isBoosted={boostMap.has(app.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
}
