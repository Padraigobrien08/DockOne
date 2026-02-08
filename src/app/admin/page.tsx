import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/profile";
import { getPendingApps } from "@/lib/apps";
import { getReportsForAdmin } from "@/lib/reports";
import { getCollections } from "@/lib/collections";
import { getCollectionBySlug } from "@/lib/collections";
import { Container } from "@/components/ui/container";
import { PendingList } from "./pending-list";
import { ReportsList } from "./reports-list";
import { AdminCollectionsList } from "./admin-collections-list";

export default async function AdminPage() {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");

  const isAdmin = await getIsAdmin(user.id);
  if (!isAdmin) redirect("/");

  const [pendingApps, reports, collections] = await Promise.all([
    getPendingApps(),
    getReportsForAdmin(),
    getCollections(),
  ]);
  const staffCollections = collections.filter((c) => !c.owner_id);
  const staffWithApps = await Promise.all(
    staffCollections.map((c) => getCollectionBySlug(c.slug))
  );

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Moderation</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Pending projects, reports, and staff collections.
        </p>

        <section className="mt-10">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Pending projects
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Approve or reject with an optional reason.
          </p>
          <div className="mt-4">
            <PendingList apps={pendingApps} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Reports
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            User-submitted reports. Review and take action on the project if needed.
          </p>
          <div className="mt-4">
            <ReportsList reports={reports} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Staff collections
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Curate Staff picks, Best BYOK tools, Best dev utilities. Add or remove projects by slug.
          </p>
          <div className="mt-4">
            <AdminCollectionsList collections={staffWithApps.filter((c): c is NonNullable<typeof c> => c != null)} />
          </div>
        </section>
      </Container>
    </div>
  );
}
