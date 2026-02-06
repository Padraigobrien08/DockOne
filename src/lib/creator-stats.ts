import { getApprovedAppsByOwnerId } from "@/lib/apps";
import type { AppListItem } from "@/types";
import type { CreatorStats } from "@/types";
import { CREATOR_MIN_VOTES_FOR_HIGHLIGHT } from "@/types";

/** Min total votes and min approved apps to earn "Rising creator" badge. */
const RISING_MIN_TOTAL_VOTES = 5;
const RISING_MIN_APP_COUNT = 2;

function statsFromAppList(apps: AppListItem[]): CreatorStats {
  const totalVotes = apps.reduce((sum, app) => sum + (app.vote_count ?? 0), 0);
  const approvedAppsCount = apps.length;
  const appsWithMinVotes = apps.filter(
    (app) => (app.vote_count ?? 0) >= CREATOR_MIN_VOTES_FOR_HIGHLIGHT
  ).length;
  const risingCreator =
    totalVotes >= RISING_MIN_TOTAL_VOTES && approvedAppsCount >= RISING_MIN_APP_COUNT;
  return {
    totalVotes,
    approvedAppsCount,
    appsWithMinVotes,
    risingCreator,
  };
}

/**
 * Compute creator reputation stats from approved apps and their vote counts.
 * Used on profile page and app detail (creator badge).
 */
export async function getCreatorStats(ownerId: string): Promise<CreatorStats> {
  const apps = await getApprovedAppsByOwnerId(ownerId);
  return statsFromAppList(apps);
}

/**
 * Build a map of owner id → creator stats from a list of apps (e.g. from getApprovedApps).
 * Use on browse page to show "Rising creator" on cards without extra queries.
 */
export function computeCreatorStatsMap(apps: AppListItem[]): Map<string, CreatorStats> {
  const byOwner = new Map<string, AppListItem[]>();
  for (const app of apps) {
    const id = app.owner.id;
    if (!byOwner.has(id)) byOwner.set(id, []);
    byOwner.get(id)!.push(app);
  }
  const map = new Map<string, CreatorStats>();
  for (const [ownerId, ownerApps] of byOwner) {
    map.set(ownerId, statsFromAppList(ownerApps));
  }
  return map;
}
