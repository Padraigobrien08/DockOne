import Link from "next/link";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { Container } from "@/components/ui/container";
import { getHomepageStats } from "@/lib/apps";

const valueProps = [
  {
    title: "Discover projects & tools",
    description:
      "Creators share working software with intentionally limited scope. No polish required.",
  },
  {
    title: "BYOK supported",
    description:
      "Projects that use LLMs let you bring your own API key. Stored only in your browser, never on our servers.",
  },
  {
    title: "No promises, just useful tools",
    description: "Expect rough edges and iteration. Discover tools that might actually help.",
  },
] as const;

export default async function Home() {
  const { projectCount, creatorCount } = await getHomepageStats();

  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl sm:leading-tight">
            {SITE_NAME}
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
            {SITE_DESCRIPTION}
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/apps"
              className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto"
            >
              Browse projects
            </Link>
            <Link
              href="/submit"
              className="w-full rounded-lg border border-zinc-300 px-6 py-3 text-base font-medium text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:w-auto"
            >
              Publish a project
            </Link>
          </div>
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            {projectCount > 0 || creatorCount > 0 ? (
              <>
                {projectCount.toLocaleString()} project{projectCount !== 1 ? "s" : ""} ·{" "}
                {creatorCount.toLocaleString()} creator{creatorCount !== 1 ? "s" : ""} · Updated
                daily
              </>
            ) : (
              "Updated daily"
            )}
          </p>
        </div>

        <ul className="mx-auto mt-16 grid max-w-3xl gap-8 sm:mt-20 sm:gap-10" role="list">
          {valueProps.map((item) => (
            <li
              key={item.title}
              className="border-b border-zinc-200 pb-8 last:border-0 last:pb-0 dark:border-zinc-800 sm:pb-10 sm:last:pb-0"
            >
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
