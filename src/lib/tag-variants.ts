/**
 * Tag classification for visual distinction: "state" (demo, wip, starter) vs "requirement" (byok, llm).
 * Used to style project tags so they communicate meaning at a glance.
 */

const STATE_TAGS = new Set(["demo", "wip", "starter"]);
const REQUIREMENT_TAGS = new Set(["byok", "llm"]);

export type TagVariant = "state" | "requirement" | "default";

export function getTagVariant(tag: string): TagVariant {
  const key = tag.trim().toLowerCase();
  if (STATE_TAGS.has(key)) return "state";
  if (REQUIREMENT_TAGS.has(key)) return "requirement";
  return "default";
}
