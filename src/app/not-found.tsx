import Link from "next/link";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <div className="py-16 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Page not found
          </h1>
          <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-3 text-base font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Go home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
