"use client";

import { type ReactNode } from "react";

const RULE_MASK =
  "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)";

export function ThesisHighlight({ children }: { children: ReactNode }) {
  return (
    <span
      className="bg-gradient-to-r from-violet-400/85 to-indigo-400/85 bg-clip-text font-semibold text-transparent"
      style={{ WebkitBackgroundClip: "text" }}
    >
      {children}
    </span>
  );
}

export interface ThesisBlockProps {
  id?: string;
  label: string;
  badge: string;
  headline: ReactNode;
  outcomes: [string, string, string];
  supportingLine?: string;
}

export function ThesisBlock({
  id,
  label,
  badge,
  headline,
  outcomes,
  supportingLine,
}: ThesisBlockProps) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className="border-b border-zinc-800/50"
    >
      <div className="relative py-20 md:py-28 lg:py-32">
        {/* Layered glow: indigo + purple, low opacity, blurred — depth through glass */}
        <div
          className="pointer-events-none absolute -inset-[6%] z-0"
          style={{
            background: [
              "radial-gradient(ellipse 85% 90% at 5% 45%, rgba(99, 102, 241, 0.035) 0%, transparent 50%)",
              "radial-gradient(ellipse 80% 85% at 0% 55%, rgba(139, 92, 246, 0.03) 0%, transparent 55%)",
            ].join(", "),
            filter: "blur(32px)",
            WebkitFilter: "blur(32px)",
          }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 md:px-8">
          <div className="flex gap-6 md:gap-8">
            {/* A) Left accent column: vertical rule with gradient fade */}
            <div className="flex w-4 flex-shrink-0 flex-col md:w-5">
              <div
                className="w-px flex-1 bg-violet-500/25"
                style={{
                  maskImage: RULE_MASK,
                  WebkitMaskImage: RULE_MASK,
                }}
                aria-hidden
              />
            </div>

            {/* B) Content column — flows across width, no narrow cap */}
            <div className="min-w-0 flex-1">
              {/* C) Header row */}
              <div className="flex flex-wrap items-center gap-2">
                <span
                  id={id ? `${id}-heading` : undefined}
                  className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-400"
                >
                  {label}
                </span>
                <span className="rounded-full border border-violet-500/15 bg-violet-950/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-400/80">
                  {badge}
                </span>
              </div>

              {/* D) Thesis headline */}
              <h2 className="mt-5 max-w-[65ch] text-left text-2xl font-bold tracking-tight leading-snug text-white md:text-3xl lg:text-4xl lg:leading-snug">
                {headline}
              </h2>

              {/* E) Outcomes row — chips + optional right-side anchor */}
              <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-8">
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <span className="rounded-full border border-violet-500/15 bg-violet-950/15 px-3 py-1.5 text-sm font-medium text-zinc-300">
                    {outcomes[0]}
                  </span>
                  <span className="rounded-full border border-violet-500/15 bg-violet-950/15 px-3 py-1.5 text-sm font-medium text-zinc-300">
                    {outcomes[1]}
                  </span>
                  <span className="rounded-full border border-violet-500/15 bg-violet-950/15 px-3 py-1.5 text-sm font-medium text-zinc-300">
                    {outcomes[2]}
                  </span>
                </div>
                <p className="text-left text-sm font-normal leading-relaxed text-zinc-600 dark:text-zinc-500 sm:text-right sm:max-w-[28ch]">
                  No pitch. No launch. Just working software.
                </p>
              </div>

              {/* F) Supporting line */}
              {supportingLine && (
                <p className="mt-6 max-w-[65ch] text-left text-sm leading-relaxed text-zinc-500 md:text-base">
                  {supportingLine}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
