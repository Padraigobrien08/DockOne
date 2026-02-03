import { notFound } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { getProfileByUsername } from "@/lib/profile";
import { getApprovedAppsByOwnerId } from "@/lib/apps";
import { AppCard } from "@/components/apps/app-card";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const apps = await getApprovedAppsByOwnerId(profile.id);
  const displayName = profile.display_name || profile.username;

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt=""
                width={96}
                height={96}
                className="h-24 w-24 rounded-full object-cover"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            )}
            <div>
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {displayName}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">@{profile.username}</p>
              {profile.bio && (
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{profile.bio}</p>
              )}
            </div>
          </div>

          <section className="mt-10">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Apps</h2>
            {apps.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No approved apps yet.</p>
            ) : (
              <ul className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {apps.map((app) => (
                  <li key={app.id}>
                    <AppCard app={app} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </Container>
    </div>
  );
}
