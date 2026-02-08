"use client";

import { useEffect, useState } from "react";
import { TrackedLink } from "./tracked-link";

interface StickyOpenProjectProps {
  appId: string;
  href: string;
  highlightPro?: boolean;
}

/** Sticky primary CTA on desktop when user has scrolled past the hero. */
export function StickyOpenProject({
  appId,
  href,
  highlightPro,
}: StickyOpenProjectProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const threshold = 280;
    function onScroll() {
      setShow(window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 hidden border-t border-zinc-200 bg-white/95 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-none md:block"
      role="banner"
      aria-label="Open app"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-center px-4">
        <TrackedLink
          appId={appId}
          eventType="demo_click"
          href={href}
          highlightPro={highlightPro}
          className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-base font-semibold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Open app
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </TrackedLink>
      </div>
    </div>
  );
}
