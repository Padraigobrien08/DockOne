import { Container } from "@/components/ui/container";
import { getUser } from "@/lib/supabase/server";
import { HeaderNav } from "@/components/layout/header-nav";

export async function Header() {
  const user = await getUser();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-zinc-950/80">
      <Container
        size="wide"
        className="pl-2 pr-4 sm:pl-3 sm:pr-6 md:pl-4 md:pr-8"
      >
        <HeaderNav isLoggedIn={!!user} />
      </Container>
    </header>
  );
}
