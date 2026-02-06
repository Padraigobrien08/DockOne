"use client";

import { recordAppEvent } from "@/app/apps/[slug]/actions";

type EventType = "demo_click" | "repo_click";

interface TrackedLinkProps {
  appId: string;
  eventType: EventType;
  href: string;
  children: React.ReactNode;
  className?: string;
}

/** Records a click for private analytics, then opens the link. */
export function TrackedLink({ appId, eventType, href, children, className }: TrackedLinkProps) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    recordAppEvent(appId, eventType).finally(() => {
      window.open(href, "_blank", "noopener,noreferrer");
    });
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}
