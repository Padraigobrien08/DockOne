import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getCollections } from "@/lib/collections";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Collections
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Staff picks and community collections. Projects worth exploring.
        </p>

        {collections.length === 0 ? (
          <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
            No collections yet. Staff will add curated lists soon.
          </p>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {c.name}
                  </h2>
                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {c.description}
                    </p>
                  )}
                  {!c.owner_id && (
                    <span className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                      Staff pick
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </div>
  );
}
