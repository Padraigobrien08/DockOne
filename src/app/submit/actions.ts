"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugify, ensureUniqueSlug } from "@/lib/slug";
import { log } from "@/lib/logger";
import { getIsPro } from "@/lib/profile";
import { submitFullSchema, submitFormFromFormData, zodFieldErrors } from "@/app/submit/schema";

const APP_MEDIA_MAX_BYTES = 5 * 1024 * 1024; // 5MB per file
const SCREENSHOTS_MAX = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const SUBMIT_RATE_LIMIT_PER_HOUR = 10;

export type SubmitState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  slug?: string;
};

function validateFiles(screenshotFiles: File[], logoFile: File | null): SubmitState["fieldErrors"] {
  const fieldErrors: Record<string, string> = {};
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
    else if (logoFile.size > APP_MEDIA_MAX_BYTES) fieldErrors.logo = "Logo must be 5MB or smaller.";
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}

export async function submitApp(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const screenshotFiles = formData.getAll("screenshots") as File[];
  const logoFile = formData.get("logo") as File | null;

  const raw = submitFormFromFormData(formData);
  const parsed = submitFullSchema.safeParse(raw);
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error) };
  }

  const fileErrors = validateFiles(screenshotFiles, logoFile);
  if (fileErrors) return { fieldErrors: fileErrors };

  const { name, tagline, app_url, repo_url, demo_video_url, tags, description, how_used, byok_required, lifecycle, visibility } =
    parsed.data;

  const isPro = await getIsPro(user.id);
  const effectiveVisibility = visibility === "unlisted" && !isPro ? "public" : visibility ?? "public";

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from("apps")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id)
    .gte("created_at", oneHourAgo);

  if (!countError && count !== null && count !== undefined && count >= SUBMIT_RATE_LIMIT_PER_HOUR) {
    log("submit_rate_limited", { count, limit: SUBMIT_RATE_LIMIT_PER_HOUR });
    return { error: "Too many submissions. Try again in an hour." };
  }

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
      how_used: how_used?.trim() || null,
      status: "pending",
      lifecycle: lifecycle ?? "wip",
      visibility: effectiveVisibility,
      app_url: app_url || null,
      repo_url: repo_url || null,
      demo_video_url: demo_video_url?.trim() || null,
      byok_required,
    })
    .select("id")
    .single();

  if (appError || !app) return { error: appError?.message ?? "Failed to create app." };

  log("app_submitted", { app_id: app.id, slug });

  const appId = app.id;

  if (tags.length > 0) {
    await supabase.from("app_tags").insert(tags.map((tag) => ({ app_id: appId, tag })));
  }

  const bucket = "app-media";
  const prefix = `${appId}/`;
  const screenshots = screenshotFiles.filter((f) => f.size > 0);

  for (let i = 0; i < screenshots.length; i++) {
    const file = screenshots[i];
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${prefix}screenshot-${i + 1}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type, upsert: true });
    if (!upErr) {
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);
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
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);
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
