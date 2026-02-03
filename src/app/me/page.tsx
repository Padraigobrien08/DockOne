import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { ProfileForm } from "./profile-form";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="py-12 sm:py-16">
      <Container>
        <div className="mx-auto max-w-xl">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit profile</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Your profile is public. Username is used in your profile URL.
          </p>

          <ProfileForm
            initialUsername={profile.username}
            initialDisplayName={profile.display_name ?? ""}
            initialBio={profile.bio ?? ""}
            avatarUrl={profile.avatar_url}
          />
        </div>
      </Container>
    </div>
  );
}
