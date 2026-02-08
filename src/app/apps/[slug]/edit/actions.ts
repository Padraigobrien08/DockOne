"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getIsPro } from "@/lib/profile";
import { editFullSchema, editFormFromFormData, zodFieldErrors } from "@/app/submit/schema";

const APP_MEDIA_MAX_BYTES = 5 * 1024 * 1024;
const SCREENSHOTS_MAX = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type EditState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function validateFiles(screenshotFiles: File[], logoFile: File | null): EditState["fieldErrors"] {
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

/** Result of performing the edit (used by both Server Action and API route). */
export type PerformEditResult =
  | { ok: true; slug: string }
  | { ok: false; error?: string; fieldErrors?: Record<string, string> };

/**
 * Perform the app update (auth, validation, DB update, storage upload).
 * Used by the Server Action and by the API route so file uploads work in both.
 */
export async function performAppEdit(formData: FormData): Promise<PerformEditResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const appId = (formData.get("app_id") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  if (!appId || !slug) return { ok: false, error: "Missing app." };

  const { data: row } = await supabase
    .from("apps")
    .select("id, owner_id, status")
    .eq("id", appId)
    .single();
  if (!row || (row as { owner_id: string }).owner_id !== user.id) {
    return { ok: false, error: "You can only edit your own project." };
  }

  const screenshotFiles = formData.getAll("screenshots") as File[];
  const logoFile = formData.get("logo") as File | null;
  const raw = editFormFromFormData(formData);
  const parsed = editFullSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  const fileErrors = validateFiles(screenshotFiles, logoFile);
  if (fileErrors) return { ok: false, fieldErrors: fileErrors };

  const {
    name,
    tagline,
    app_url,
    repo_url,
    demo_video_url,
    tags,
    description,
    how_used,
    byok_required,
    lifecycle,
    visibility,
    what_it_does,
    what_it_does_not,
    why_this_exists,
    runtime_type,
    requirements,
    primary_tag,
  } = parsed.data;

  const isPro = await getIsPro(user.id);
  const effectiveVisibility = visibility === "unlisted" && !isPro ? "public" : visibility ?? "public";

  const { error: updateError } = await supabase
    .from("apps")
    .update({
      name,
      tagline: tagline || null,
      app_url: app_url || null,
      repo_url: repo_url || null,
      demo_video_url: demo_video_url?.trim() || null,
      description: description?.trim() || null,
      how_used: how_used?.trim() || null,
      byok_required,
      lifecycle: lifecycle ?? "wip",
      visibility: effectiveVisibility,
      what_it_does: what_it_does?.trim() || null,
      what_it_does_not: what_it_does_not?.trim() || null,
      why_this_exists: why_this_exists?.trim() || null,
      runtime_type: runtime_type ?? null,
      requirements: requirements ?? null,
      primary_tag: primary_tag?.trim() || null,
    })
    .eq("id", appId);

  if (updateError) return { ok: false, error: updateError.message };

  await supabase.from("app_tags").delete().eq("app_id", appId);
  if (tags.length > 0) {
    await supabase.from("app_tags").insert(tags.map((tag) => ({ app_id: appId, tag })));
  }

  const bucket = "app-media";
  const prefix = `${appId}/`;

  const screenshotsToUpload = screenshotFiles.filter(
    (f): f is File => f instanceof File && typeof f.size === "number" && f.size > 0
  );
  if (screenshotsToUpload.length > 0) {
    const { data: existingMedia } = await supabase
      .from("app_media")
      .select("id, url")
      .eq("app_id", appId)
      .eq("kind", "screenshot");
    for (const m of existingMedia ?? []) {
      const pathInBucket = m.url.includes(`/${bucket}/`) ? m.url.split(`/${bucket}/`)[1] : null;
      if (pathInBucket) await supabase.storage.from(bucket).remove([pathInBucket]);
    }
    await supabase.from("app_media").delete().eq("app_id", appId).eq("kind", "screenshot");
    for (let i = 0; i < screenshotsToUpload.length; i++) {
      const file = screenshotsToUpload[i];
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${prefix}screenshot-${i + 1}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
      let buffer: Buffer;
      try {
        buffer = Buffer.from(await file.arrayBuffer());
      } catch {
        return { ok: false, error: "Screenshots could not be read. Try again with smaller files (max 5MB each)." };
      }
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, buffer, { contentType: file.type, upsert: true });
      if (upErr) {
        return {
          ok: false,
          error: `Screenshot upload failed: ${upErr.message}. In Supabase Dashboard → Storage, ensure the "app-media" bucket exists and is public.`,
        };
      }
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      const { error: insertErr } = await supabase.from("app_media").insert({
        app_id: appId,
        kind: "screenshot",
        url: publicUrl,
        sort_order: i,
      });
      if (insertErr) {
        return { ok: false, error: `Failed to save screenshot: ${insertErr.message}` };
      }
    }
  }

  if (logoFile && logoFile.size > 0) {
    const { data: existingLogo } = await supabase
      .from("app_media")
      .select("id, url")
      .eq("app_id", appId)
      .eq("kind", "logo")
      .maybeSingle();
    if (existingLogo) {
      const pathInBucket = existingLogo.url.includes(`/${bucket}/`) ? existingLogo.url.split(`/${bucket}/`)[1] : null;
      if (pathInBucket) await supabase.storage.from(bucket).remove([pathInBucket]);
      await supabase.from("app_media").delete().eq("id", existingLogo.id);
    }
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

  revalidatePath(`/apps/${slug}`);
  revalidatePath("/apps");
  return { ok: true, slug };
}

export async function updateApp(_prev: EditState, formData: FormData): Promise<EditState> {
  const result = await performAppEdit(formData);
  if (result.ok) redirect(`/apps/${result.slug}`);
  return {
    error: result.error,
    fieldErrors: result.fieldErrors,
  };
}
