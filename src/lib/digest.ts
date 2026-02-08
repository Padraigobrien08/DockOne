import { createClient } from "@/lib/supabase/server";
import { getApprovedApps } from "@/lib/apps";
import type { AppListItem } from "@/types";

export interface DigestData {
  risingApps: AppListItem[];
  newProjects: AppListItem[];
  newCreators: { id: string; username: string; display_name: string | null }[];
  trendingTags: { tag: string; count: number }[];
}

/** Data for "This week on DockOne": new projects, rising creators, rising apps, trending tags. */
export async function getDigestData(): Promise<DigestData> {
  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [allApps, newCreatorsRes, tagsRes] = await Promise.all([
    getApprovedApps(),
    getNewCreators(supabase, weekAgo),
    getTrendingTags(supabase, weekAgo),
  ]);

  const risingApps = [...allApps]
    .sort((a, b) => (b.trending_score ?? 0) - (a.trending_score ?? 0))
    .slice(0, 5);

  const newProjects = [...allApps]
    .filter((a) => a.created_at >= weekAgo)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return {
    risingApps,
    newProjects,
    newCreators: newCreatorsRes,
    trendingTags: tagsRes,
  };
}

async function getNewCreators(
  supabase: Awaited<ReturnType<typeof createClient>>,
  weekAgo: string
): Promise<{ id: string; username: string; display_name: string | null }[]> {
  const { data: appRows } = await supabase
    .from("apps")
    .select("owner_id, created_at")
    .eq("status", "approved")
    .eq("visibility", "public")
    .gte("created_at", weekAgo)
    .order("created_at", { ascending: false });

  if (!appRows?.length) return [];
  const seen = new Set<string>();
  const ownerIds: string[] = [];
  for (const row of appRows as { owner_id: string }[]) {
    if (!seen.has(row.owner_id)) {
      seen.add(row.owner_id);
      ownerIds.push(row.owner_id);
      if (ownerIds.length >= 5) break;
    }
  }
  if (ownerIds.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name")
    .in("id", ownerIds);

  const byId = new Map(
    (profiles ?? []).map((p: { id: string; username: string; display_name: string | null }) => [
      p.id,
      { id: p.id, username: p.username, display_name: p.display_name },
    ])
  );
  return ownerIds.map((id) => byId.get(id)).filter(Boolean) as {
    id: string;
    username: string;
    display_name: string | null;
  }[];
}

async function getTrendingTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  weekAgo: string
): Promise<{ tag: string; count: number }[]> {
  const { data: votes } = await supabase
    .from("votes")
    .select("app_id")
    .gte("created_at", weekAgo);

  if (!votes?.length) return [];
  const appIds = [...new Set((votes as { app_id: string }[]).map((v) => v.app_id))];

  const { data: tagRows } = await supabase
    .from("app_tags")
    .select("tag")
    .in("app_id", appIds);

  const counts = new Map<string, number>();
  for (const row of (tagRows ?? []) as { tag: string }[]) {
    counts.set(row.tag, (counts.get(row.tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, count]) => ({ tag, count }));
}

/** Subscribers: profiles with digest_opted_in and email. */
export async function getDigestSubscribers(): Promise<
  { id: string; email: string; username: string }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, username")
    .eq("digest_opted_in", true)
    .not("email", "is", null);

  if (error) return [];
  return (data ?? []).filter(
    (r: { email: string | null }) => r.email && r.email.trim().length > 0
  ) as { id: string; email: string; username: string }[];
}

/** Build HTML for the weekly digest email. */
export function buildDigestHtml(data: DigestData, baseUrl: string): string {
  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const link = (href: string, text: string) =>
    `<a href="${escape(href)}" style="color:#2563eb;text-decoration:underline">${escape(text)}</a>`;

  const newProjectsHtml =
    data.newProjects.length === 0
      ? "<p>No new projects this week.</p>"
      : `<ul style="margin:0;padding-left:1.2em">${data.newProjects
          .map(
            (a) =>
              `<li>${link(`${baseUrl}/apps/${a.slug}`, a.name)}${a.tagline ? ` — ${escape(a.tagline)}` : ""}</li>`
          )
          .join("")}</ul>`;

  const risingCreatorsHtml =
    data.newCreators.length === 0
      ? "<p>No rising creators this week.</p>"
      : `<ul style="margin:0;padding-left:1.2em">${data.newCreators
          .map((c) => `<li>${link(`${baseUrl}/u/${c.username}`, c.display_name || c.username)}</li>`)
          .join("")}</ul>`;

  const risingHtml =
    data.risingApps.length === 0
      ? "<p>No rising projects this week.</p>"
      : `<ul style="margin:0;padding-left:1.2em">${data.risingApps
          .map(
            (a) =>
              `<li>${link(`${baseUrl}/apps/${a.slug}`, a.name)}${a.tagline ? ` — ${escape(a.tagline)}` : ""}</li>`
          )
          .join("")}</ul>`;

  const tagsHtml =
    data.trendingTags.length === 0
      ? "<p>No trending tags this week.</p>"
      : `<p style="margin:0">${data.trendingTags
          .map((t) => link(`${baseUrl}/apps?tag=${encodeURIComponent(t.tag)}`, `#${t.tag}`))
          .join(" · ")}</p>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#18181b;line-height:1.6">
  <h1 style="font-size:1.5rem;margin:0 0 8px">This week on DockOne</h1>
  <p style="color:#71717a;margin:0 0 24px">Your weekly digest: new projects, rising creators. Build the habit.</p>

  <h2 style="font-size:1.1rem;margin:24px 0 8px">New projects</h2>
  ${newProjectsHtml}

  <h2 style="font-size:1.1rem;margin:24px 0 8px">Rising creators</h2>
  ${risingCreatorsHtml}

  <h2 style="font-size:1.1rem;margin:24px 0 8px">Rising projects</h2>
  ${risingHtml}

  <h2 style="font-size:1.1rem;margin:24px 0 8px">Trending tags</h2>
  ${tagsHtml}

  <p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #e4e4e7;color:#71717a;font-size:0.875rem">
    You're receiving this because you opted in to the weekly digest. 
    ${link(`${baseUrl}/settings`, "Update preferences")} to unsubscribe.
  </p>
</body>
</html>`;
}
