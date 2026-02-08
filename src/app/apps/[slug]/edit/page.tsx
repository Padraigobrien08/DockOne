import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getAppBySlug } from "@/lib/apps";
import { getIsPro } from "@/lib/profile";
import { EditAppForm } from "@/components/apps/edit-app-form";

export default async function EditAppPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error: errorParam } = await searchParams;
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");

  const app = await getAppBySlug(slug, user.id);
  if (!app) notFound();
  if (app.owner.id !== user.id) redirect(`/apps/${slug}`);

  let isPro = false;
  try {
    isPro = await getIsPro(user.id);
  } catch {
    // Default to false
  }

  return <EditAppForm app={app} isPro={isPro} initialError={errorParam ?? undefined} />;
}
