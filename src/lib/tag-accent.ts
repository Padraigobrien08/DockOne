/**
 * Primary-tag accent: gradient and border/highlight for card covers and page accents.
 * DockOne purple base; variation for BYOK, CLI, etc. No noisy patterns.
 */

export type TagAccentPreset = "violet" | "byok" | "cli" | "default";

const TAG_TO_PRESET: Record<string, TagAccentPreset> = {
  byok: "byok",
  llm: "byok",
  cli: "cli",
  terminal: "cli",
  api: "violet",
  browser: "violet",
  demo: "violet",
  wip: "violet",
};

/** Resolve preset from tag (lowercase). */
export function getTagAccentPreset(tag: string | null | undefined): TagAccentPreset {
  if (!tag?.trim()) return "default";
  const key = tag.trim().toLowerCase();
  return TAG_TO_PRESET[key] ?? "default";
}

/** Gradient and border for card cover / no-image hero. Clean, no patterns. */
export interface TagAccentStyles {
  /** Tailwind classes for card cover gradient (no image). */
  coverGradientClass: string;
  /** Tailwind classes for subtle border/accent (e.g. left border on content). */
  borderClass: string;
  /** Tailwind classes for cover letter color (large initial). */
  coverLetterClass: string;
}

const ACCENT_STYLES: Record<TagAccentPreset, TagAccentStyles> = {
  default: {
    coverGradientClass:
      "bg-gradient-to-br from-violet-500/10 via-violet-400/5 to-violet-600/8 dark:from-violet-600/15 dark:via-violet-800/10 dark:to-violet-900/12",
    borderClass: "border-l-violet-400/50 dark:border-l-violet-500/40",
    coverLetterClass: "text-violet-500/70 dark:text-violet-400/60",
  },
  violet: {
    coverGradientClass:
      "bg-gradient-to-br from-violet-500/12 via-violet-400/6 to-violet-600/10 dark:from-violet-600/18 dark:via-violet-800/10 dark:to-violet-900/14",
    borderClass: "border-l-violet-400/50 dark:border-l-violet-500/40",
    coverLetterClass: "text-violet-500/70 dark:text-violet-400/60",
  },
  byok: {
    coverGradientClass:
      "bg-gradient-to-br from-violet-500/8 via-amber-500/6 to-violet-600/6 dark:from-violet-700/12 dark:via-amber-900/10 dark:to-violet-800/10",
    borderClass: "border-l-amber-400/40 dark:border-l-amber-500/30",
    coverLetterClass: "text-amber-600/60 dark:text-amber-500/50",
  },
  cli: {
    coverGradientClass:
      "bg-gradient-to-br from-violet-500/6 via-slate-400/8 to-slate-500/6 dark:from-violet-800/10 dark:via-slate-700/12 dark:to-slate-800/10",
    borderClass: "border-l-slate-400/40 dark:border-l-slate-500/30",
    coverLetterClass: "text-slate-500/60 dark:text-slate-400/50",
  },
};

export function getTagAccentStyles(tag: string | null | undefined): TagAccentStyles {
  const preset = getTagAccentPreset(tag);
  const base = ACCENT_STYLES[preset];
  return base;
}

/** Resolve effective primary tag: primaryTag or first tag. */
export function getEffectivePrimaryTag(
  primaryTag: string | null | undefined,
  tags: string[]
): string | null {
  const p = primaryTag?.trim();
  if (p) return p;
  const first = tags[0]?.trim();
  return first ?? null;
}
