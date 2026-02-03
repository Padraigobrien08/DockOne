import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";
import { ApiKeysSection } from "@/components/settings/api-keys-section";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/auth/sign-in");

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <div className="mx-auto max-w-xl">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Profile and API keys (BYOK). Keys are stored only in your browser.
          </p>

          <section className="mt-8">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              API Keys
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              For apps that use OpenAI or Anthropic. Add keys here so BYOK-compatible apps can use them. Never sent to our server.
            </p>
            <div className="mt-4">
              <ApiKeysSection />
            </div>
          </section>
        </div>
      </Container>
    </div>
  );
}
