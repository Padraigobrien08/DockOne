import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { AppCard } from "@/components/apps/app-card";
import { HeroMagicLinkForm } from "@/components/landing/hero-magic-link-form";
import { HeroStrip } from "@/components/landing/hero-strip";
import { ThesisBlock, ThesisHighlight } from "@/components/landing/thesis-block";
import { getApprovedApps } from "@/lib/apps";
import { getActiveBoosts } from "@/lib/boosts";
import { computeCreatorStatsMap } from "@/lib/creator-stats";

const LANDING_PROJECTS_LIMIT = 6;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth_message?: string }>;
}) {
  const { auth_message } = await searchParams;
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
      {auth_message === "link_used" && (
        <div className="bg-amber-500/15 text-amber-200 border-b border-amber-500/30 px-4 py-2.5 text-center text-sm">
          That sign-in link was already used. If you&apos;re signed in, you&apos;re all set — otherwise request a new link from the form below.
        </div>
      )}
      {/* 1. Hero: single column, centred text, no image */}
      <section aria-labelledby="hero-heading" className="relative overflow-hidden">
        {/* Aurora: slightly stronger gradient, centred */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            maskImage: "radial-gradient(ellipse 75% 65% at 50% 50%, black 18%, transparent 58%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 50%, black 18%, transparent 58%)",
          }}
        >
          <div
            className="absolute inset-[-15%]"
            style={{
              filter: "blur(64px)",
              background: [
                "radial-gradient(ellipse 50% 45% at 50% 50%, rgba(99, 102, 241, 0.36) 0%, transparent 45%)",
                "radial-gradient(ellipse 45% 42% at 50% 48%, rgba(139, 92, 246, 0.3) 0%, transparent 42%)",
                "radial-gradient(ellipse 40% 38% at 50% 52%, rgba(129, 140, 248, 0.26) 0%, transparent 40%)",
              ].join(", "),
            }}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background: "radial-gradient(ellipse 85% 75% at 50% 45%, transparent 40%, rgba(0,0,0,0.04) 100%)",
          }}
        />
        <Section className="relative z-10 pt-12 pb-4 md:pt-14 md:pb-5 lg:pt-16 lg:pb-6">
          <Container size="wide">
            <div className="flex flex-col items-center text-center">
              <p className="hero-entrance text-xs font-medium uppercase tracking-[0.06em] text-zinc-300">
                Projects that work. No pitch required.
              </p>
              <h1
                id="hero-heading"
                className="hero-entrance hero-entrance-delay-1 mt-1.5 text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1]"
              >
                <span className="block">Not everything you build</span>
                <span className="block">needs to become a product.</span>
              </h1>
              <p className="hero-entrance hero-entrance-delay-2 mt-3 text-lg font-medium text-zinc-300 md:text-xl">
                It&apos;s worth showing.
              </p>
              <p className="hero-entrance hero-entrance-delay-2 mt-4 max-w-prose text-lg leading-relaxed text-zinc-300/90 md:mt-5 md:text-xl">
                Publish working projects without marketing, scaling, or
                operational pressure.
              </p>
              <div className="hero-entrance hero-entrance-delay-3 mt-6 w-full max-w-md text-center md:mt-8">
                <HeroMagicLinkForm />
              </div>
            </div>
          </Container>
        </Section>
      </section>

      {/* 2. Hero strip: hairline handoff, two-cluster stats */}
      <HeroStrip
        projectCount={projectCount}
        creatorCount={creatorCount}
        updatedLabel="Updated daily"
      />

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
              {/* Not: intentionally muted, readable — not equal to "is" */}
              <div className="max-w-prose border-l border-zinc-700/50 border-r border-zinc-600/55 pr-6 pl-6 md:pl-8 md:pr-8">
                <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
                  DockOne is not
                </h3>
                <ul className="mt-5 space-y-4 text-xs leading-loose text-zinc-400 md:text-sm md:space-y-5 md:leading-loose" role="list">
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0 text-zinc-500" aria-hidden>×</span>
                    <span>App store. Launch platform. Growth tool.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0 text-zinc-500" aria-hidden>×</span>
                    <span>Vanity metrics.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-0.5 shrink-0 text-zinc-500" aria-hidden>×</span>
                    <span>Scale or track you.</span>
                  </li>
                </ul>
              </div>
              {/* Is: subtle tint and border — integrated, not a standalone card */}
              <div className="max-w-prose rounded-lg border border-violet-500/12 bg-violet-950/8 pl-6 pr-6 py-5 md:pl-8 md:pr-8 md:py-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-violet-400/90">
                  DockOne is
                </h3>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-zinc-200 md:space-y-4 md:text-base" role="list">
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/50" aria-hidden />
                    <span>A public home for your work.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/50" aria-hidden />
                    <span>Portfolio surface. Quiet discovery. Early signals.</span>
                  </li>
                  <li className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/50" aria-hidden />
                    <span>Share what works. No pitch.</span>
                  </li>
                </ul>
              </div>
            </div>
          </Container>
        </Section>
      </section>

      {/* 3b. Thesis Block — core pillar, comparable importance to hero */}
      <ThesisBlock
        id="bridge-heading"
        label="Where DockOne fits"
        badge="The why"
        headline={
          <>
            Between a <ThesisHighlight>README</ThesisHighlight> and a{" "}
            <ThesisHighlight>product launch</ThesisHighlight> there’s a gap. DockOne is that space.
          </>
        }
        outcomes={[
          "Easier discovery",
          "Immediate understanding",
          "No setup. No pitch. No launch.",
        ]}
        supportingLine="Working software becomes easy to find, understand, and try — without turning it into a startup."
      />

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
                <p className="mt-2 text-zinc-500">
                  Working software you can see, try, and understand.
                </p>
              </div>
              <Link
                href="/apps"
                className="shrink-0 text-sm text-zinc-500 hover:text-zinc-400 hover:underline underline-offset-2 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded"
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
                      context="landing"
                      imageStyle="premium"
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

      {/* 5. Soft close */}
      <section aria-labelledby="soft-close-heading" className="bg-zinc-900/20">
        <Section className="py-14 md:py-20">
          <Container size="wide">
            <p className="mx-auto max-w-xl text-center text-base font-normal leading-relaxed text-zinc-500 md:text-lg">
              Work worth showing.
            </p>
            <h2
              id="soft-close-heading"
              className="mt-8 text-center text-2xl font-semibold tracking-tight text-white md:text-3xl md:leading-snug"
            >
              Browse what people are building.
            </h2>
            <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
              <Link
                href="/apps"
                className="inline-flex items-center justify-center rounded-lg border border-violet-500/50 bg-transparent px-5 py-2.5 text-sm font-medium text-violet-300 transition-colors hover:bg-violet-500/10 hover:border-violet-500/70 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                Explore projects
              </Link>
              <Link
                href="/submit"
                className="text-center text-sm font-normal text-zinc-500 hover:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-950 rounded"
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
