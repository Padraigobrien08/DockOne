"use client";

import { useState, useActionState } from "react";
import { Container } from "@/components/ui/container";
import { submitApp, type SubmitState } from "@/app/submit/actions";
import { APP_LIFECYCLE_LABELS, type AppLifecycle } from "@/types";
import type { AppVisibility } from "@/types";

const SCREENSHOTS_MAX = 5;
const ALLOWED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

type Step = 1 | 2;

const initialState: SubmitState = {};

interface SubmitFormProps {
  /** Pro creators can submit unlisted apps (shareable link only). */
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
  const [byokRequired, setByokRequired] = useState(false);
  const [lifecycle, setLifecycle] = useState<AppLifecycle>("wip");
  const [visibility, setVisibility] = useState<AppVisibility>("public");
  const [description, setDescription] = useState("");

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
                App name <span className="text-red-500">*</span>
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
                placeholder="My App"
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
                App URL <span className="text-red-500">*</span>
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
              <label
                htmlFor="lifecycle"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                Status
              </label>
              <select
                id="lifecycle"
                name="lifecycle"
                value={lifecycle}
                onChange={(e) => setLifecycle(e.target.value as AppLifecycle)}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                {(Object.entries(APP_LIFECYCLE_LABELS) as [AppLifecycle, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Helps others know what you’re looking for (feedback, users, etc.).
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
                  <option value="unlisted">Unlisted — shareable link only (investors, testers, hiring)</option>
                </select>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Unlisted apps don’t appear in the catalog; share the direct link with anyone.
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
                BYOK required — app uses an LLM and needs users to add API keys in Settings (OpenAI
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
            <input type="hidden" name="tags" value={tags} />
            <input type="hidden" name="byok_required" value={byokRequired ? "on" : ""} />
            <input type="hidden" name="lifecycle" value={lifecycle} />
            <input type="hidden" name="visibility" value={visibility} />

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
                {isPending ? "Submitting…" : "Submit app"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Container>
  );
}
