import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { Container } from "@/components/ui/container";

const valueProps = [
  {
    title: "Show unfinished apps",
    description: "Creators share work-in-progress apps that work—no polish required.",
  },
  {
    title: "BYOK supported",
    description: "Apps that use LLMs let you bring your own API key. Stored only in your browser, never on our servers.",
  },
  {
    title: "No promises, just useful tools",
    description: "Expect rough edges and iteration. Discover tools that might actually help.",
  },
] as const;

export default function Home() {
  return (
    <div className="py-12 sm:py-16 lg:py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {SITE_NAME}
          </h1>
          <p className="mt-3 text-lg text-zinc-600 dark:text-zinc-400">
            A hub where creators post unfinished but functional apps.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/apps"
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Browse apps
            </Link>
            <Link
              href="/submit"
              className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Submit an app
            </Link>
          </div>
        </div>

        <ul className="mx-auto mt-16 grid max-w-3xl gap-8 sm:mt-20 sm:gap-10" role="list">
          {valueProps.map((item) => (
            <li key={item.title} className="border-b border-zinc-200 pb-8 last:border-0 last:pb-0 dark:border-zinc-800 sm:pb-10 sm:last:pb-0">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                {item.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
