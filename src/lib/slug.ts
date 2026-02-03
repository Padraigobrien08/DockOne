import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Slugify a string: lowercase, replace spaces/slashes with dash, remove non-alphanumeric-dash.
 */
export function slugify(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/\//g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "app"
  );
}

/**
 * Return a unique slug: base slug, or base-1, base-2, … if collision.
 */
export async function ensureUniqueSlug(
  supabase: SupabaseClient,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug;
  let n = 0;
  while (true) {
    const { data } = await supabase.from("apps").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    n += 1;
    slug = `${baseSlug}-${n}`;
  }
}
