import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { getIsPro } from "@/lib/profile";
import { SubmitForm } from "@/components/submit/submit-form";

export default async function SubmitPage() {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");
  const isPro = await getIsPro(user.id);

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Publish a project</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          New submissions start as pending until approved. Step 1: basics. Step 2: description and
          media.
        </p>
        <div className="mt-8">
          <SubmitForm isPro={isPro} />
        </div>
      </Container>
    </div>
  );
}
