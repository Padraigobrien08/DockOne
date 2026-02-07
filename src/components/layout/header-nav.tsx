"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE_NAME } from "@/lib/constants";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface HeaderNavProps {
  isLoggedIn: boolean;
}

const navLinks = [
  { href: "/apps", label: "Browse" },
  { href: "/collections", label: "Collections" },
  { href: "/submit", label: "Publish" },
] as const;

export function HeaderNav({ isLoggedIn }: HeaderNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="flex h-14 items-center justify-between md:h-16">
        {/* Left: logo + nav links */}
        <div className="flex min-w-0 flex-1 items-center gap-6 md:gap-8">
          <Link
            href="/"
            className="shrink-0 font-semibold text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity"
          >
            {SITE_NAME}
          </Link>
          <nav
            className="hidden items-center gap-6 text-sm md:flex"
            aria-label="Main"
          >
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors whitespace-nowrap"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right: Sign in + CTA (desktop) */}
        <div className="hidden shrink-0 items-center gap-5 md:flex">
          <Link
            href="/settings"
            className="text-sm text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            Settings
          </Link>
          {isLoggedIn ? (
            <>
              <Link
                href="/me"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
              >
                Profile
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/apps"
            className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950"
          >
            Browse projects →
          </Link>
        </div>

        {/* Mobile: hamburger */}
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <Link
            href="/apps"
            className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-500"
          >
            Browse →
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        id="mobile-nav"
        className={`md:hidden overflow-hidden border-t border-zinc-200 dark:border-zinc-800 transition-[height] duration-200 ease-out ${
          mobileOpen ? "h-auto opacity-100" : "h-0 opacity-0 border-t-transparent"
        }`}
        aria-hidden={!mobileOpen}
      >
        <nav className="flex flex-col gap-0 py-3" aria-label="Main">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="px-1 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              {label}
            </Link>
          ))}
          <div className="my-1 border-t border-zinc-200 dark:border-zinc-800" />
          {isLoggedIn ? (
            <>
              <Link
                href="/me"
                onClick={() => setMobileOpen(false)}
                className="px-1 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                Profile
              </Link>
              <span className="px-1 py-2.5">
                <SignOutButton />
              </span>
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              onClick={() => setMobileOpen(false)}
              className="px-1 py-2.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className="px-1 py-2.5 text-sm text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            Settings
          </Link>
        </nav>
      </div>
    </>
  );
}
