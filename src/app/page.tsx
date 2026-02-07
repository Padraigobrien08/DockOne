import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { AppCard } from "@/components/apps/app-card";
import { HeroVisual } from "@/components/landing/hero-visual";
import { ProofStrip } from "@/components/landing/proof-strip";
import { getApprovedApps } from "@/lib/apps";
import { getActiveBoosts } from "@/lib/boosts";
import { computeCreatorStatsMap } from "@/lib/creator-stats";

const LANDING_PROJECTS_LIMIT = 6;

export default async function Home() {
  const [allApps, boostMap] = await Promise.all([
    getApprovedApps(),
    getActiveBoosts(),
  ]);
  const landingApps = allApps.slice(0, LANDING_PROJECTS_LIMIT);
  const creatorStatsMap = computeCreatorStatsMap(landingApps);

  const projectCount = allApps.length;
  const creatorCount = new Set(allApps.map((a) => a.owner.id)).size;

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
      {/* 1. Hero: Stripe-like 2-column — left: copy + email capture, right: visual */}
      <section aria-labelledby="hero-heading" className="border-b border-zinc-800/50">
        <Section className="py-14 md:py-16 lg:py-20">
          <Container size="wide">
            <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16 lg:gap-20 md:items-center">
              {/* Left: eyebrow → H1 → subhead → email capture */}
              <div className="min-w-0 max-w-xl flex flex-col">
                <p className="hero-entrance text-xs font-medium uppercase tracking-widest text-zinc-500">
                  Projects that work. No pitch required.
                </p>
                <h1
                  id="hero-heading"
                  className="hero-entrance hero-entrance-delay-1 mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1]"
                >
                  Not everything you build needs to become a product.
                </h1>
                <p className="hero-entrance hero-entrance-delay-2 mt-5 max-w-prose text-lg leading-relaxed text-zinc-300/90 md:mt-6 md:text-xl">
                  Publish working projects without marketing, scaling, or
                  operational pressure.
                </p>
                <div className="hero-entrance hero-entrance-delay-3 mt-8 md:mt-10">
                  <form className="flex flex-col gap-3 sm:flex-row sm:gap-0" action="#" method="post" aria-label="Email signup">
                    <label htmlFor="hero-email" className="sr-only">Email</label>
                    <input
                      id="hero-email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      className="min-w-0 flex-1 rounded-l-lg border border-zinc-600 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 sm:rounded-r-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 sm:rounded-l-none"
                    >
                      Get updates
                    </button>
                  </form>
                </div>
              </div>
              {/* Right: background visual container */}
              <div className="relative flex min-h-[220px] items-center justify-center md:min-h-[260px] lg:min-h-[280px]">
                <HeroVisual projects={landingApps.slice(0, 3)} />
              </div>
            </div>
          </Container>
        </Section>
      </section>

      {/* 2. Proof strip: distinct band beneath hero */}
      <section className="border-t border-b border-zinc-800/40 bg-zinc-900/40">
        <Section className="py-0">
          <Container size="wide">
            <ProofStrip
              projectCount={projectCount}
              creatorCount={creatorCount}
              updatedLabel="Updated daily"
            />
          </Container>
        </Section>
      </section>

      {/* 3. Not / Is: iconic two-column */}
      <section aria-labelledby="not-is-heading" className="border-b border-zinc-800/50">
        <Section className="py-12 md:py-16">
          <Container size="wide">
            <div className="max-w-2xl">
              <h2
                id="not-is-heading"
                className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
              >
                A place for intentionally scoped software.
              </h2>
              <p className="mt-2 text-lg text-zinc-400">
                DockOne is not / is
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-8 md:mt-10 md:grid-cols-2 md:gap-14 lg:gap-16">
              {/* Not: muted × icons, slightly smaller text */}
              <div className="max-w-prose border-l border-zinc-700/60 pl-6 md:pl-8">
                <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
                  DockOne is not
                </h3>
                <ul className="mt-5 space-y-3 text-xs leading-relaxed text-zinc-500 md:text-sm md:space-y-4" role="list">
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0 text-zinc-600" aria-hidden>×</span>
                    <span>App store. Launch platform. Growth tool.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0 text-zinc-600" aria-hidden>×</span>
                    <span>Vanity metrics.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0 text-zinc-600" aria-hidden>×</span>
                    <span>Scale or track you.</span>
                  </li>
                </ul>
              </div>
              {/* Is: accent border + background tint, confident bullets */}
              <div className="max-w-prose rounded-lg border border-violet-500/25 bg-violet-950/20 pl-6 pr-6 py-5 md:pl-8 md:pr-8 md:py-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-300">
                  DockOne is
                </h3>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-zinc-200 md:space-y-4 md:text-base" role="list">
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/70" aria-hidden />
                    <span>A public home for your work.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/70" aria-hidden />
                    <span>Portfolio surface. Quiet discovery. Early signals.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/70" aria-hidden />
                    <span>Share what works. No pitch.</span>
                  </li>
                </ul>
              </div>
            </div>
          </Container>
        </Section>
      </section>

      {/* 4. Projects on DockOne: curated grid */}
      <section aria-labelledby="real-projects-heading" className="bg-zinc-900/20">
        <Section className="py-12 md:py-16">
          <Container size="wide">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  id="real-projects-heading"
                  className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
                >
                  Projects on DockOne
                </h2>
                <p className="mt-2 text-zinc-400">
                  Real submissions. Real scope. No pitch required.
                </p>
              </div>
              <Link
                href="/apps"
                className="shrink-0 text-sm font-medium text-violet-400 underline decoration-violet-500/50 underline-offset-2 hover:text-violet-300 hover:decoration-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded"
              >
                Browse all →
              </Link>
            </div>
            {landingApps.length > 0 ? (
              <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10">
                {landingApps.map((app) => (
                  <li key={app.id}>
                    <AppCard
                      app={app}
                      creatorStats={creatorStatsMap.get(app.owner.id)}
                      isBoosted={boostMap.has(app.id)}
                      headingLevel={3}
                      overrideMomentumHint="New this week"
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-zinc-400">
                No projects yet — be the first to{" "}
                <Link
                  href="/submit"
                  className="rounded text-violet-400 underline decoration-violet-500/50 underline-offset-2 hover:text-violet-300 hover:decoration-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  publish one
                </Link>
                .
              </p>
            )}
          </Container>
        </Section>
      </section>

      {/* 5. BYOK: respectful trust callout */}
      <section aria-labelledby="byok-heading" className="border-b border-zinc-800/50">
        <Section className="py-12 md:py-16">
          <Container size="wide">
            <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/30 px-5 py-4 md:px-6 md:py-5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400" aria-hidden>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>
                <h2
                  id="byok-heading"
                  className="text-base font-semibold tracking-tight text-zinc-200 md:text-lg"
                >
                  Your keys stay yours.
                </h2>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
                Some projects use LLMs. DockOne never stores your API keys —
                they live only in your browser.
              </p>
              <p className="mt-3">
                <Link
                  href="/settings"
                  className="inline-flex items-center rounded-lg border border-zinc-600/80 bg-transparent px-3 py-1.5 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800/50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
                >
                  Manage keys in Settings
                </Link>
              </p>
            </div>
          </Container>
        </Section>
      </section>

      {/* 6. Soft close */}
      <section aria-labelledby="soft-close-heading" className="bg-zinc-900/20">
        <Section className="py-12 md:py-16">
          <Container size="wide">
            <h2
              id="soft-close-heading"
              className="text-2xl font-semibold tracking-tight text-white md:text-3xl"
            >
              Browse what people are building.
            </h2>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link
                href="/apps"
                className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Explore projects
              </Link>
              <Link
                href="/submit"
                className="text-sm text-zinc-400 underline decoration-zinc-600 underline-offset-2 hover:text-zinc-300 hover:decoration-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded"
              >
                Publish a project
              </Link>
            </div>
          </Container>
        </Section>
      </section>
    </div>
  );
}
