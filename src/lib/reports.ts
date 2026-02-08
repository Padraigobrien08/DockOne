import { createClient } from "@/lib/supabase/server";
import type { ReportForAdmin } from "@/types";

type ReportRow = {
  id: string;
  app_id: string;
  reporter_id: string;
  reason: string | null;
  created_at: string;
  apps: { slug: string; name: string } | { slug: string; name: string }[] | null;
};

/** Fetch all reports for admin. Joins apps; looks up reporter usernames from profiles. */
export async function getReportsForAdmin(): Promise<ReportForAdmin[]> {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("reports")
    .select("id, app_id, reporter_id, reason, created_at, apps!app_id(slug, name)")
    .order("created_at", { ascending: false });

  if (error) return [];

  const list = (rows ?? []) as unknown as ReportRow[];
  const reporterIds = [...new Set(list.map((r) => r.reporter_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", reporterIds);
  const usernameById = new Map<string, string>(
    (profiles ?? []).map((p: { id: string; username: string }) => [p.id, p.username])
  );

  const appInfo = (r: ReportRow) => {
    const a = Array.isArray(r.apps) ? r.apps[0] : r.apps;
    return a ? { slug: a.slug, name: a.name } : { slug: "", name: "Unknown app" };
  };

  return list.map((r): ReportForAdmin => {
    const app = appInfo(r);
    const reporter_username = usernameById.get(r.reporter_id) ?? null;
    return {
      id: r.id,
      app_id: r.app_id,
      app_slug: app.slug,
      app_name: app.name,
      reporter_id: r.reporter_id,
      reporter_username: typeof reporter_username === "string" ? reporter_username : null,
      reason: r.reason,
      created_at: r.created_at,
    };
  });
}
