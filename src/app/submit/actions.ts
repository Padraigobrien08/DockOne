"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify, ensureUniqueSlug } from "@/lib/slug";

const NAME_MIN = 1;
const NAME_MAX = 100;
const TAGLINE_MAX = 200;
const TAG_MAX = 30;
const TAGS_MAX = 10;
const DESCRIPTION_MAX = 10_000;
const APP_MEDIA_MAX_BYTES = 5 * 1024 * 1024; // 5MB per file
const SCREENSHOTS_MAX = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function isValidUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

export type SubmitState = {
  error?: string;
  fieldErrors?: {
    name?: string;
    tagline?: string;
    app_url?: string;
    repo_url?: string;
    tags?: string;
    description?: string;
    screenshots?: string;
    logo?: string;
  };
  slug?: string;
};

export async function submitApp(
  _prev: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const name = (formData.get("name") as string)?.trim() ?? "";
  const tagline = (formData.get("tagline") as string)?.trim() ?? "";
  const app_url = (formData.get("app_url") as string)?.trim() ?? "";
  const repo_url = (formData.get("repo_url") as string)?.trim() ?? "";
  const tagsRaw = (formData.get("tags") as string)?.trim() ?? "";
  const description = (formData.get("description") as string)?.trim() ?? "";
  const byokRequired = formData.get("byok_required") === "on" || formData.get("byok_required") === "true";
  const screenshotFiles = formData.getAll("screenshots") as File[];
  const logoFile = formData.get("logo") as File | null;

  const fieldErrors: SubmitState["fieldErrors"] = {};

  if (!name) fieldErrors.name = "Name is required.";
  else if (name.length < NAME_MIN || name.length > NAME_MAX)
    fieldErrors.name = `Name must be ${NAME_MIN}–${NAME_MAX} characters.`;

  if (tagline.length > TAGLINE_MAX)
    fieldErrors.tagline = `Tagline must be at most ${TAGLINE_MAX} characters.`;

  if (!app_url) fieldErrors.app_url = "App URL is required.";
  else if (!isValidUrl(app_url)) fieldErrors.app_url = "Enter a valid URL.";

  if (repo_url && !isValidUrl(repo_url)) fieldErrors.repo_url = "Enter a valid URL.";

  const tags = tagsRaw
    ? tagsRaw.split(/[\s,]+/).map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];
  if (tags.length > TAGS_MAX)
    fieldErrors.tags = `At most ${TAGS_MAX} tags.`;
  for (const t of tags) {
    if (t.length > TAG_MAX) {
      fieldErrors.tags = `Each tag at most ${TAG_MAX} characters.`;
      break;
    }
  }

  if (description.length > DESCRIPTION_MAX)
    fieldErrors.description = `Description must be at most ${DESCRIPTION_MAX} characters.`;

  const screenshots = screenshotFiles.filter((f) => f.size > 0);
  if (screenshots.length > SCREENSHOTS_MAX)
    fieldErrors.screenshots = `At most ${SCREENSHOTS_MAX} screenshots.`;
  for (const f of screenshots) {
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
      fieldErrors.screenshots = "Screenshots must be JPEG, PNG, or WebP.";
      break;
    }
    if (f.size > APP_MEDIA_MAX_BYTES) {
      fieldErrors.screenshots = "Each screenshot must be 5MB or smaller.";
      break;
    }
  }

  if (logoFile && logoFile.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(logoFile.type))
      fieldErrors.logo = "Logo must be JPEG, PNG, or WebP.";
    else if (logoFile.size > APP_MEDIA_MAX_BYTES)
      fieldErrors.logo = "Logo must be 5MB or smaller.";
  }

  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  const baseSlug = slugify(name);
  const slug = await ensureUniqueSlug(supabase, baseSlug);

  const { data: app, error: appError } = await supabase
    .from("apps")
    .insert({
      owner_id: user.id,
      slug,
      name,
      tagline: tagline || null,
      description: description || null,
      status: "pending",
      app_url: app_url || null,
      repo_url: repo_url || null,
      byok_required: byokRequired,
    })
    .select("id")
    .single();

  if (appError || !app) return { error: appError?.message ?? "Failed to create app." };

  const appId = app.id;

  if (tags.length > 0) {
    await supabase.from("app_tags").insert(
      tags.map((tag) => ({ app_id: appId, tag }))
    );
  }

  const bucket = "app-media";
  const prefix = `${appId}/`;

  for (let i = 0; i < screenshots.length; i++) {
    const file = screenshots[i];
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${prefix}screenshot-${i + 1}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type, upsert: true });
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      await supabase.from("app_media").insert({
        app_id: appId,
        kind: "screenshot",
        url: publicUrl,
        sort_order: i,
      });
    }
  }

  if (logoFile && logoFile.size > 0) {
    const ext = logoFile.name.split(".").pop() || "jpg";
    const path = `${prefix}logo-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await logoFile.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: logoFile.type, upsert: true });
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      await supabase.from("app_media").insert({
        app_id: appId,
        kind: "logo",
        url: publicUrl,
        sort_order: 0,
      });
    }
  }

  redirect(`/apps/${slug}?pending=1`);
}
