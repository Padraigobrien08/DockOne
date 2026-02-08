import { z } from "zod";

const TAG_MAX = 30;
const TAGS_MAX = 10;

const tagsStringSchema = z
  .string()
  .optional()
  .transform((s) =>
    (s ?? "")
      .trim()
      .split(/[\s,]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
  )
  .pipe(
    z
      .array(z.string().max(TAG_MAX, `Each tag at most ${TAG_MAX} characters.`))
      .max(TAGS_MAX, `At most ${TAGS_MAX} tags.`)
  );

const lifecycleEnum = z.enum([
  "wip",
  "looking_for_feedback",
  "looking_for_users",
  "dormant",
]);

const visibilityEnum = z.enum(["public", "unlisted"]);

export const submitBasicsSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100, "Name must be 1–100 characters."),
  tagline: z
    .string()
    .max(200, "Tagline must be at most 200 characters.")
    .optional()
    .or(z.literal("")),
  app_url: z.string().min(1, "App URL is required.").url("Enter a valid URL."),
  repo_url: z.string().url("Enter a valid URL.").optional().or(z.literal("")),
  demo_video_url: z
    .string()
    .max(500, "Demo video URL must be at most 500 characters.")
    .optional()
    .or(z.literal(""))
    .refine(
      (s) => !s?.trim() || /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/.test(s?.trim() ?? ""),
      "Enter a valid YouTube URL (e.g. youtube.com/watch?v=... or youtu.be/...)"
    ),
  tags: tagsStringSchema,
  byok_required: z.boolean().default(false),
  lifecycle: lifecycleEnum.default("wip"),
  visibility: visibilityEnum.default("public"),
});

export const submitFullSchema = submitBasicsSchema.extend({
  description: z
    .string()
    .max(10_000, "Description must be at most 10,000 characters.")
    .optional()
    .or(z.literal("")),
  /** Optional: how the creator actually uses it — first-person, real usage. */
  how_used: z
    .string()
    .max(5_000, "How this is used must be at most 5,000 characters.")
    .optional()
    .or(z.literal("")),
});

const runtimeTypeEnum = z.enum(["browser", "local", "api", "cli", "hybrid"]);
const requirementsEnum = z.enum(["none", "api_key_required", "local_install", "account_required"]);

/** Edit form: submit fields + optional progressive fields. */
export const editFullSchema = submitFullSchema.extend({
  what_it_does: z.string().max(5_000).optional().or(z.literal("")),
  what_it_does_not: z.string().max(5_000).optional().or(z.literal("")),
  why_this_exists: z.string().max(2_000).optional().or(z.literal("")),
  runtime_type: z
    .union([runtimeTypeEnum, z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  requirements: z
    .union([requirementsEnum, z.literal(""), z.null()])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  primary_tag: z.string().max(TAG_MAX).optional().or(z.literal("")),
});

export type SubmitBasics = z.infer<typeof submitBasicsSchema>;
export type SubmitFull = z.infer<typeof submitFullSchema>;
export type EditFull = z.infer<typeof editFullSchema>;

/** Build submit form object from FormData (no files). */
export function submitFormFromFormData(formData: FormData): z.input<typeof submitFullSchema> {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const tagline = (formData.get("tagline") as string)?.trim() ?? "";
  const app_url = (formData.get("app_url") as string)?.trim() ?? "";
  const repo_url = (formData.get("repo_url") as string)?.trim() ?? "";
  const demo_video_url = (formData.get("demo_video_url") as string)?.trim() ?? "";
  const tagsRaw = (formData.get("tags") as string)?.trim() ?? "";
  const description = (formData.get("description") as string)?.trim() ?? "";
  const how_used = (formData.get("how_used") as string)?.trim() ?? "";
  const byok_required =
    formData.get("byok_required") === "on" || formData.get("byok_required") === "true";
  const lifecycleRaw = (formData.get("lifecycle") as string)?.trim() || "wip";
  const lifecycle = lifecycleEnum.safeParse(lifecycleRaw).success
    ? (lifecycleRaw as z.infer<typeof lifecycleEnum>)
    : "wip";
  const visibilityRaw = (formData.get("visibility") as string)?.trim() || "public";
  const visibility = visibilityEnum.safeParse(visibilityRaw).success
    ? (visibilityRaw as z.infer<typeof visibilityEnum>)
    : "public";

  return {
    name,
    tagline: tagline || undefined,
    app_url: app_url || "",
    repo_url: repo_url || undefined,
    demo_video_url: demo_video_url || undefined,
    tags: tagsRaw || undefined,
    description: description || undefined,
    how_used: how_used || undefined,
    byok_required,
    lifecycle,
    visibility,
  };
}

/** Build edit form object from FormData (includes progressive fields). */
export function editFormFromFormData(formData: FormData): z.input<typeof editFullSchema> {
  const base = submitFormFromFormData(formData);
  const what_it_does = (formData.get("what_it_does") as string)?.trim() ?? "";
  const what_it_does_not = (formData.get("what_it_does_not") as string)?.trim() ?? "";
  const why_this_exists = (formData.get("why_this_exists") as string)?.trim() ?? "";
  const runtime_type = (formData.get("runtime_type") as string)?.trim() || "";
  const requirements = (formData.get("requirements") as string)?.trim() || "";
  const primary_tag = (formData.get("primary_tag") as string)?.trim() ?? "";
  const runtimeTypeParsed = runtimeTypeEnum.safeParse(runtime_type);
  const requirementsParsed = requirementsEnum.safeParse(requirements);
  return {
    ...base,
    what_it_does: what_it_does || undefined,
    what_it_does_not: what_it_does_not || undefined,
    why_this_exists: why_this_exists || undefined,
    runtime_type: runtimeTypeParsed.success ? runtimeTypeParsed.data : undefined,
    requirements: requirementsParsed.success ? requirementsParsed.data : undefined,
    primary_tag: primary_tag || undefined,
  };
}

/** Flatten Zod errors to fieldErrors map for form state. */
export function zodFieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  const flat = err.flatten();
  for (const [path, messages] of Object.entries(flat.fieldErrors)) {
    const msg = Array.isArray(messages) ? messages[0] : messages;
    if (msg && typeof msg === "string") out[path] = msg;
  }
  return out;
}
