/**
 * App detail: description, links, screenshots.
 */
export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">App detail</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mt-2">Slug: {slug}</p>
    </div>
  );
}
