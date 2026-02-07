import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { Container } from "@/components/ui/container";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getUser } from "@/lib/supabase/server";

export async function Header() {
  const user = await getUser();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-zinc-950/80">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="font-semibold text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity"
          >
            {SITE_NAME}
          </Link>
          <nav className="flex items-center gap-6 text-sm" aria-label="Main">
            <Link
              href="/apps"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/collections"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Collections
            </Link>
            <Link
              href="/submit"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Publish
            </Link>
            {user ? (
              <>
                <Link
                  href="/me"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                >
                  Profile
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/auth/sign-in"
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
              >
                Sign in
              </Link>
            )}
            <Link
              href="/settings"
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Settings
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
