"use client";

import { recordAppEvent } from "@/app/apps/[slug]/actions";

type EventType = "demo_click" | "repo_click";

interface TrackedLinkProps {
  appId: string;
  eventType: EventType;
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Pro: highlight external link (accent ring). */
  highlightPro?: boolean;
}

/** Records a click for private analytics, then opens the link. */
export function TrackedLink({
  appId,
  eventType,
  href,
  children,
  className = "",
  highlightPro,
}: TrackedLinkProps) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    recordAppEvent(appId, eventType).finally(() => {
      window.open(href, "_blank", "noopener,noreferrer");
    });
  }

  const linkClass = highlightPro
    ? `${className} ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-zinc-900`
    : className;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={linkClass}
    >
      {children}
    </a>
  );
}
