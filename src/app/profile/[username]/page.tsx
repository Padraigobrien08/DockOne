/**
 * Public creator profile.
 */
export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Creator profile</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mt-2">Username: {username}</p>
    </div>
  );
}
