"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { updateApp, type EditState } from "@/app/apps/[slug]/edit/actions";
import {
  APP_LIFECYCLE_LABELS,
  APP_RUNTIME_LABELS,
  APP_REQUIREMENTS_LABELS,
  type AppLifecycle,
  type AppDetail,
} from "@/types";
import type { AppVisibility } from "@/types";

const SCREENSHOTS_MAX = 5;
const ALLOWED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

interface EditAppFormProps {
  app: AppDetail;
  isPro?: boolean;
}

export function EditAppForm({ app, isPro }: EditAppFormProps) {
  const [state, formAction, isPending] = useActionState(updateApp, {} as EditState);

  return (
    <div className="py-8 sm:py-12">
      <Container>
        <div className="mx-auto max-w-xl">
          <Link
            href={`/apps/${app.slug}`}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to project
          </Link>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Edit project</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Update your project details. Leave screenshots/logo empty to keep current media.
          </p>

          <form action={formAction} className="mt-8 space-y-6">
            <input type="hidden" name="app_id" value={app.id} />
            <input type="hidden" name="slug" value={app.slug} />

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Project name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                minLength={1}
                maxLength={100}
                defaultValue={app.name}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              />
              {state?.fieldErrors?.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.fieldErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Tagline
              </label>
              <input
                id="tagline"
                name="tagline"
                type="text"
                maxLength={200}
                defaultValue={app.tagline ?? ""}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Short one-liner"
              />
              {state?.fieldErrors?.tagline && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.fieldErrors.tagline}</p>
              )}
            </div>

            <div>
              <label htmlFor="app_url" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Project URL <span className="text-red-500">*</span>
              </label>
              <input
                id="app_url"
                name="app_url"
                type="url"
                required
                defaultValue={app.app_url ?? ""}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="https://..."
              />
              {state?.fieldErrors?.app_url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.fieldErrors.app_url}</p>
              )}
            </div>

            <div>
              <label htmlFor="repo_url" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Repo URL
              </label>
              <input
                id="repo_url"
                name="repo_url"
                type="url"
                defaultValue={app.repo_url ?? ""}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="https://github.com/..."
              />
              {state?.fieldErrors?.repo_url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.fieldErrors.repo_url}</p>
              )}
            </div>

            <div>
              <label htmlFor="demo_video_url" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Demo video (YouTube)
              </label>
              <input
                id="demo_video_url"
                name="demo_video_url"
                type="url"
                defaultValue={app.demo_video_url ?? ""}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
              />
              {state?.fieldErrors?.demo_video_url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.fieldErrors.demo_video_url}</p>
              )}
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                defaultValue={app.tags.join(", ")}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="react, tool, cli (comma or space separated)"
              />
              {state?.fieldErrors?.tags && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.fieldErrors.tags}</p>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Up to 10 tags.</p>
            </div>

            {/* Lifecycle dropdown hidden pre-launch; value preserved via hidden input. */}
            <input type="hidden" name="lifecycle" value={app.lifecycle} />
            {isPro && (
              <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  defaultValue={app.visibility}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                >
                  <option value="public">Listed — appears in browse</option>
                  <option value="unlisted">Unlisted — shareable private link only</option>
                </select>
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                id="byok_required"
                name="byok_required"
                type="checkbox"
                defaultChecked={app.byok_required}
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900"
              />
              <label htmlFor="byok_required" className="text-sm text-zinc-700 dark:text-zinc-300">
                This project uses an LLM (BYOK — users add their own API key)
              </label>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-700" />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Description (Markdown)
              </label>
              <textarea
                id="description"
                name="description"
                rows={8}
                maxLength={10000}
                defaultValue={app.description ?? ""}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="## What it does..."
              />
              {state?.fieldErrors?.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.fieldErrors.description}</p>
              )}
            </div>

            <div>
              <label htmlFor="how_used" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                How this is used
              </label>
              <textarea
                id="how_used"
                name="how_used"
                rows={5}
                maxLength={5000}
                defaultValue={app.how_used ?? ""}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="How I use it day to day…"
              />
              {state?.fieldErrors?.how_used && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.fieldErrors.how_used}</p>
              )}
            </div>

            <div>
              <label htmlFor="what_it_does" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                What it does (short)
              </label>
              <textarea
                id="what_it_does"
                name="what_it_does"
                rows={3}
                maxLength={5000}
                defaultValue={app.whatItDoes ?? ""}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Structured short description. Markdown supported."
              />
            </div>

            <div>
              <label htmlFor="what_it_does_not" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                What it doesn&apos;t do
              </label>
              <textarea
                id="what_it_does_not"
                name="what_it_does_not"
                rows={2}
                maxLength={5000}
                defaultValue={app.whatItDoesNot ?? ""}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Out of scope. Optional."
              />
            </div>

            <div>
              <label htmlFor="why_this_exists" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Why it exists
              </label>
              <textarea
                id="why_this_exists"
                name="why_this_exists"
                rows={2}
                maxLength={2000}
                defaultValue={app.whyThisExists ?? ""}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Why you built this. Optional."
              />
            </div>

            <div>
              <label htmlFor="runtime_type" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Where it runs
              </label>
              <select
                id="runtime_type"
                name="runtime_type"
                defaultValue={app.runtimeType ?? ""}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">Not specified</option>
                {(Object.entries(APP_RUNTIME_LABELS) as [keyof typeof APP_RUNTIME_LABELS, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Requirements
              </label>
              <select
                id="requirements"
                name="requirements"
                defaultValue={app.requirements ?? ""}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
              >
                <option value="">Not specified</option>
                {(Object.entries(APP_REQUIREMENTS_LABELS) as [keyof typeof APP_REQUIREMENTS_LABELS, string][]).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label htmlFor="primary_tag" className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Primary tag
              </label>
              <input
                id="primary_tag"
                name="primary_tag"
                type="text"
                maxLength={30}
                defaultValue={app.primaryTag ?? ""}
                className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50"
                placeholder="Single primary category (e.g. cli)"
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Should be one of your tags. Used for display accent.
              </p>
            </div>

            <hr className="border-zinc-200 dark:border-zinc-700" />

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Replace screenshots (optional)
              </label>
              <input
                name="screenshots"
                type="file"
                accept={ALLOWED_IMAGE_TYPES}
                multiple
                className="mt-1.5 w-full text-sm text-zinc-600 dark:text-zinc-400 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-900 dark:file:bg-zinc-700 dark:file:text-zinc-50"
              />
              {state?.fieldErrors?.screenshots && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.fieldErrors.screenshots}</p>
              )}
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Leave empty to keep current. Up to {SCREENSHOTS_MAX}. JPEG, PNG or WebP. Max 5MB each.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Replace logo (optional)
              </label>
              <input
                name="logo"
                type="file"
                accept={ALLOWED_IMAGE_TYPES}
                className="mt-1.5 w-full text-sm text-zinc-600 dark:text-zinc-400 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-900 dark:file:bg-zinc-700 dark:file:text-zinc-50"
              />
              {state?.fieldErrors?.logo && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{state.fieldErrors.logo}</p>
              )}
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
            )}

            <div className="flex gap-3">
              <Link
                href={`/apps/${app.slug}`}
                className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
