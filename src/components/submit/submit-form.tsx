"use client";

import { useState, useActionState } from "react";
import { Container } from "@/components/ui/container";
import { submitApp, type SubmitState } from "@/app/submit/actions";
import { INTENT_TAGS } from "@/types";
import type { AppVisibility } from "@/types";

const SCREENSHOTS_MAX = 5;
const ALLOWED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

const INTENT_OPTIONS: { value: (typeof INTENT_TAGS)[number]; label: string }[] = [
  { value: "feedback", label: "Feedback" },
  { value: "early-users", label: "Early users" },
];

/** Parse free-form tag string: split, trim, lowercase, non-empty. */
function parseFreeFormTags(s: string): string[] {
  return s
    .trim()
    .split(/[\s,]+/)
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

/** Merge intent tags + free-form tags: no duplicates, lowercase, max 10. */
function mergeIntentAndFreeFormTags(
  intentTags: (typeof INTENT_TAGS)[number][],
  freeForm: string
): string[] {
  const parsed = parseFreeFormTags(freeForm);
  const combined = [...intentTags, ...parsed];
  const seen = new Set<string>();
  return combined.filter((t) => {
    if (seen.has(t)) return false;
    seen.add(t);
    return true;
  }).slice(0, 10);
}

type Step = 1 | 2;

const initialState: SubmitState = {};

interface SubmitFormProps {
  /** Pro creators can publish unlisted projects (shareable link only). */
  isPro?: boolean;
}

export function SubmitForm({ isPro }: SubmitFormProps = {}) {
  const [step, setStep] = useState<Step>(1);
  const [state, formAction, isPending] = useActionState(submitApp, initialState);

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [appUrl, setAppUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [tags, setTags] = useState("");
  const [intentSelections, setIntentSelections] = useState<(typeof INTENT_TAGS)[number][]>([]);
  const [byokRequired, setByokRequired] = useState(false);
  const [visibility, setVisibility] = useState<AppVisibility>("public");
  const [description, setDescription] = useState("");
  const [howUsed, setHowUsed] = useState("");
  const [demoVideoUrl, setDemoVideoUrl] = useState("");

  const canProceedStep1 =
    name.trim().length >= 1 && name.trim().length <= 100 && appUrl.trim().length >= 1;

  function handleStep1Next(e: React.FormEvent) {
    e.preventDefault();
    if (!canProceedStep1) return;
    setStep(2);
  }

  function handleStep2Back() {
    setStep(1);
  }

  return (
    <Container>
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              step >= 1
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
            }`}
          >
            1. Basics
          </span>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              step >= 2
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
            }`}
          >
            2. Description & media
          </span>
        </div>

        {step === 1 && (
          <form onSubmit={handleStep1Next} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Project name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                minLength={1}
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
                placeholder="My project"
              />
              {state?.fieldErrors?.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="tagline"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Tagline
              </label>
              <input
                id="tagline"
                name="tagline"
                type="text"
                maxLength={200}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
                placeholder="Short one-liner"
              />
              {state?.fieldErrors?.tagline && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.fieldErrors.tagline}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="app_url"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Project URL <span className="text-red-500">*</span>
              </label>
              <input
                id="app_url"
                name="app_url"
                type="url"
                required
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
                placeholder="https://..."
              />
              {state?.fieldErrors?.app_url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.fieldErrors.app_url}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="repo_url"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Repo URL
              </label>
              <input
                id="repo_url"
                name="repo_url"
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
                placeholder="https://github.com/..."
              />
              {state?.fieldErrors?.repo_url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.fieldErrors.repo_url}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
                placeholder="react, tool, cli (comma or space separated)"
              />
              {state?.fieldErrors?.tags && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.fieldErrors.tags}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Up to 10 tags.</p>
            </div>

            <div>
              <p className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                What are you looking for? <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                {INTENT_OPTIONS.map((opt) => {
                  const checked = intentSelections.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm transition dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setIntentSelections((prev) =>
                            prev.includes(opt.value)
                              ? prev.filter((t) => t !== opt.value)
                              : [...prev, opt.value]
                          );
                        }}
                        className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900"
                      />
                      <span className="text-zinc-700 dark:text-zinc-300">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Adds the matching tag(s) to your project. Merged with your tags above.
              </p>
            </div>

            {isPro && (
              <div>
                <label
                  htmlFor="visibility"
                  className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as AppVisibility)}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="public">Listed — appears in browse</option>
                  <option value="unlisted">Unlisted — shareable private link only</option>
                </select>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Unlisted projects don’t appear in the catalog; share the direct link with anyone. Planned.
                </p>
              </div>
            )}

            <div className="flex items-start gap-3">
              <input
                id="byok_required"
                name="byok_required"
                type="checkbox"
                checked={byokRequired}
                onChange={(e) => setByokRequired(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:checked:bg-zinc-100"
              />
              <label htmlFor="byok_required" className="text-sm text-zinc-700 dark:text-zinc-300">
                BYOK required — project uses an LLM and needs users to add API keys in Settings (OpenAI
                / Anthropic).
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!canProceedStep1}
                className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Next: Description & media
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form action={formAction} className="space-y-6">
            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="tagline" value={tagline} />
            <input type="hidden" name="app_url" value={appUrl} />
            <input type="hidden" name="repo_url" value={repoUrl} />
            <input type="hidden" name="tags" value={mergeIntentAndFreeFormTags(intentSelections, tags).join(", ")} />
            <input type="hidden" name="byok_required" value={byokRequired ? "on" : ""} />
            <input type="hidden" name="lifecycle" value="wip" />
            <input type="hidden" name="visibility" value={visibility} />
            <input type="hidden" name="demo_video_url" value={demoVideoUrl} />

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Description (Markdown)
              </label>
              <textarea
                id="description"
                name="description"
                rows={8}
                maxLength={10000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
                placeholder="## What it does..."
              />
              {state?.fieldErrors?.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.fieldErrors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Max 10,000 characters.
              </p>
            </div>

            <div>
              <label
                htmlFor="how_used"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                How this is used <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
              </label>
              <textarea
                id="how_used"
                name="how_used"
                rows={5}
                maxLength={5000}
                value={howUsed}
                onChange={(e) => setHowUsed(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
                placeholder="How I use it day to day…"
              />
              {state?.fieldErrors?.how_used && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.fieldErrors.how_used}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                First-person, real usage — not features or plans. Markdown supported. Max 5,000 characters.
              </p>
            </div>

            <div>
              <label
                htmlFor="demo_video_url"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Demo video (YouTube) <span className="font-normal text-zinc-500 dark:text-zinc-400">(optional)</span>
              </label>
              <input
                id="demo_video_url"
                name="demo_video_url"
                type="url"
                value={demoVideoUrl}
                onChange={(e) => setDemoVideoUrl(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              />
              {state?.fieldErrors?.demo_video_url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.fieldErrors.demo_video_url}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                A short YouTube walkthrough or demo. YouTube links only.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Screenshots (up to {SCREENSHOTS_MAX})
              </label>
              <input
                name="screenshots"
                type="file"
                accept={ALLOWED_IMAGE_TYPES}
                multiple
                className="mt-1.5 w-full text-sm text-zinc-600 dark:text-zinc-400 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-900 dark:file:bg-zinc-700 dark:file:text-zinc-50"
              />
              {state?.fieldErrors?.screenshots && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.fieldErrors.screenshots}
                </p>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                JPEG, PNG or WebP. Max 5MB each.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Logo (optional)
              </label>
              <input
                name="logo"
                type="file"
                accept={ALLOWED_IMAGE_TYPES}
                className="mt-1.5 w-full text-sm text-zinc-600 dark:text-zinc-400 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-900 dark:file:bg-zinc-700 dark:file:text-zinc-50"
              />
              {state?.fieldErrors?.logo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {state.fieldErrors.logo}
                </p>
              )}
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleStep2Back}
                className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isPending ? "Publishing…" : "Publish project"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Container>
  );
}
