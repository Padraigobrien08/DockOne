import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/profile";
import { getPendingApps } from "@/lib/apps";
import { Container } from "@/components/ui/container";
import { PendingList } from "./pending-list";

export default async function AdminPage() {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");

  const isAdmin = await getIsAdmin(user.id);
  if (!isAdmin) redirect("/");

  const pendingApps = await getPendingApps();

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Moderation
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Pending apps. Approve or reject with an optional reason.
        </p>
        <div className="mt-8">
          <PendingList apps={pendingApps} />
        </div>
      </Container>
    </div>
  );
}
