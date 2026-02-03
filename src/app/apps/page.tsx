import { Container } from "@/components/ui/container";
import { getApprovedApps } from "@/lib/apps";
import { AppsList } from "@/components/apps/apps-list";

export default async function AppsPage() {
  const apps = await getApprovedApps();

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Apps
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Unfinished but functional. Search, filter by tag, or sort.
        </p>
        <div className="mt-8">
          <AppsList apps={apps} />
        </div>
      </Container>
    </div>
  );
}
