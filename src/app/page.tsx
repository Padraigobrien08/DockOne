import Link from "next/link";
import { Container } from "@/components/ui/container";
import { AppCard } from "@/components/apps/app-card";
import { getApprovedApps } from "@/lib/apps";
import { getActiveBoosts } from "@/lib/boosts";
import { computeCreatorStatsMap } from "@/lib/creator-stats";

const LANDING_PROJECTS_LIMIT = 6;

function formatProofDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function Home() {
  const [allApps, boostMap] = await Promise.all([
    getApprovedApps(),
    getActiveBoosts(),
  ]);
  const landingApps = allApps.slice(0, LANDING_PROJECTS_LIMIT);
  const creatorStatsMap = computeCreatorStatsMap(landingApps);

  const projectCount = allApps.length;
  const creatorCount = new Set(allApps.map((a) => a.owner.id)).size;
  const lastUpdatedAt = allApps
    .map((a) => a.updated_at)
    .filter(Boolean)
    .sort()
    .pop();
  const proofUpdated = lastUpdatedAt
    ? `Updated ${formatProofDate(lastUpdatedAt)}`
    : "Updated daily";
  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Hero */}
      <section
        aria-labelledby="hero-heading"
        className="border-b border-zinc-200 dark:border-zinc-800/80"
      >
        <Container className="py-20 sm:py-28 md:py-32">
          <h1
            id="hero-heading"
            className="hero-entrance max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl sm:leading-tight"
          >
            Not everything you build needs to become a product.
          </h1>
          <p className="hero-entrance hero-entrance-delay-1 mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 sm:mt-8 sm:text-xl">
            Working software projects. No marketing, scaling, or ops pressure.
          </p>
          <div className="hero-entrance hero-entrance-delay-2 mt-10 sm:mt-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link href="/apps" className="link-btn-primary">
                Explore projects
              </Link>
              <Link href="/submit" className="link-btn-secondary">
                Publish a project
              </Link>
            </div>
            <p className="hero-entrance hero-entrance-delay-3 mt-4 text-sm text-zinc-500 dark:text-zinc-500">
              No signup to look around. Publish when you&apos;re ready.
            </p>
            <div
              className="hero-entrance hero-entrance-delay-3 mt-8 flex flex-wrap items-center gap-x-6 gap-y-1 border-t border-zinc-200 dark:border-zinc-800 pt-6 text-xs text-zinc-500 dark:text-zinc-500"
              aria-label="Catalog stats"
            >
              <span>{projectCount} projects</span>
              <span>{creatorCount} creators</span>
              <span>{proofUpdated}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* This is what it's for */}
      <section
        aria-labelledby="what-its-for-heading"
        className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/80 dark:bg-zinc-900/30"
      >
        <Container className="py-16 sm:py-20 md:py-24">
          <h2 id="what-its-for-heading" className="page-section-title">
            This is what it&apos;s for
          </h2>
          <p className="mt-6 max-w-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed sm:mt-8">
            Ship working software and get feedback without a roadmap or launch
            story. Put what you built in front of people without turning it
            into a company. A record of what works — no pitch deck, just the
            project and who it&apos;s for.
          </p>
        </Container>
      </section>

      {/* DockOne is not / is */}
      <section
        aria-labelledby="not-is-heading"
        className="border-b border-zinc-200 dark:border-zinc-800/80"
      >
        <Container className="py-16 sm:py-20 md:py-24">
          <h2 id="not-is-heading" className="page-section-title">
            DockOne is not / is
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:mt-14 sm:grid-cols-2 sm:gap-12 md:gap-16">
            {/* Not: muted, subtle strike */}
            <div
              className="relative rounded-xl border border-zinc-200 bg-zinc-100/80 p-6 dark:border-zinc-800 dark:bg-zinc-800/40 sm:p-8"
              aria-label="What DockOne is not"
            >
              <h3 className="text-lg font-medium text-zinc-500 dark:text-zinc-500">
                DockOne is{" "}
                <span className="line-through decoration-zinc-400 dark:decoration-zinc-500 decoration-2">
                  not
                </span>
              </h3>
              <p className="mt-3 text-zinc-500 dark:text-zinc-500 leading-relaxed">
                An app store, portfolio showcase, or launch platform. A home
                for working projects that don&apos;t need to become products.
              </p>
            </div>
            {/* Is: stronger contrast, accent sparingly */}
            <div
              className="relative rounded-xl border border-zinc-200 border-l-4 border-l-violet-500 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none sm:p-8"
              aria-label="What DockOne is"
            >
              <h3 className="text-lg font-semibold text-violet-700 dark:text-violet-300">
                DockOne is
              </h3>
              <p className="mt-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Share working software without pressure to productise. A home
                for projects that work, not a stage for promises.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Real projects */}
      <section
        aria-labelledby="real-projects-heading"
        className="border-b border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/80 dark:bg-zinc-900/30"
      >
        <Container className="py-16 sm:py-20 md:py-24">
          <h2 id="real-projects-heading" className="page-section-title">
            Real projects
          </h2>
          <p className="mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400">
            What people have put on DockOne.
          </p>
          <div className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {landingApps.length > 0 ? (
              landingApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  creatorStats={creatorStatsMap.get(app.owner.id)}
                  isBoosted={boostMap.has(app.id)}
                  headingLevel={3}
                />
              ))
            ) : (
              <p className="col-span-full text-sm text-zinc-500 dark:text-zinc-400">
                No projects yet — be the first to{" "}
                <Link
                href="/submit"
                className="underline outline-none hover:no-underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-100 dark:focus-visible:ring-offset-zinc-900"
              >
                publish one
              </Link>
                .
              </p>
            )}
          </div>
        </Container>
      </section>

      {/* BYOK respect */}
      <section
        aria-labelledby="byok-heading"
        className="border-b border-zinc-200 dark:border-zinc-800/80"
      >
        <Container className="py-16 sm:py-20 md:py-24">
          <h2 id="byok-heading" className="page-section-title">
            BYOK respect
          </h2>
          <p className="mt-6 max-w-2xl text-zinc-600 dark:text-zinc-400 leading-relaxed sm:mt-8">
            LLM projects let you bring your own API key. We don&apos;t store it
            — you keep it in your browser. No upsell, no lock-in.
          </p>
        </Container>
      </section>

      {/* Soft close */}
      <section
        aria-labelledby="soft-close-heading"
        className="bg-zinc-100/80 dark:bg-zinc-900/30"
      >
        <Container className="py-16 sm:py-20 md:py-24">
          <h2 id="soft-close-heading" className="page-section-title">
            What next
          </h2>
          <p className="mt-6 max-w-xl text-zinc-600 dark:text-zinc-400 leading-relaxed sm:mt-8">
            Browse or add your own. No signup required.
          </p>
          <Link href="/apps" className="link-btn-primary mt-8 sm:mt-10">
            Explore projects
          </Link>
        </Container>
      </section>
    </div>
  );
}
