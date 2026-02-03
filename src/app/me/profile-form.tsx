"use client";

import { useActionState } from "react";
import Image from "next/image";
import { updateProfile, uploadAvatar, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = {};

export function ProfileForm({
  initialUsername,
  initialDisplayName,
  initialBio,
  avatarUrl,
}: {
  initialUsername: string;
  initialDisplayName: string;
  initialBio: string;
  avatarUrl: string | null;
}) {
  const [profileState, profileFormAction] = useActionState(
    updateProfile,
    initialState
  );
  const [avatarState, avatarFormAction] = useActionState(
    uploadAvatar,
    initialState
  );

  return (
    <div className="mt-8 space-y-8">
      {/* Avatar */}
      <section>
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Photo
        </h2>
        <div className="mt-3 flex items-center gap-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Avatar"
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          )}
          <form action={avatarFormAction} className="flex flex-col gap-2">
            <label htmlFor="avatar" className="sr-only">
              Upload avatar
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="text-sm text-zinc-600 dark:text-zinc-400 file:mr-2 file:rounded-lg file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-900 dark:file:bg-zinc-700 dark:file:text-zinc-50"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              JPEG, PNG or WebP. Max 2MB.
            </p>
            {avatarState?.error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {avatarState.error}
              </p>
            )}
            <button
              type="submit"
              className="w-fit rounded-lg bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-600"
            >
              Upload
            </button>
          </form>
        </div>
      </section>

      {/* Profile fields */}
      <form action={profileFormAction} className="space-y-6">
        {profileState?.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {profileState.error}
          </p>
        )}

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            defaultValue={initialUsername}
            autoComplete="username"
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
            placeholder="username"
          />
          {profileState?.fieldErrors?.username && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {profileState.fieldErrors.username}
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            3–30 characters. Letters, numbers, underscores only.
          </p>
        </div>

        <div>
          <label
            htmlFor="display_name"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Display name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            defaultValue={initialDisplayName}
            maxLength={100}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
            placeholder="Your name"
          />
          {profileState?.fieldErrors?.display_name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {profileState.fieldErrors.display_name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-50"
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={initialBio}
            maxLength={500}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-400"
            placeholder="A short bio"
          />
          {profileState?.fieldErrors?.bio && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {profileState.fieldErrors.bio}
            </p>
          )}
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Max 500 characters.
          </p>
        </div>

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Save profile
        </button>
      </form>
    </div>
  );
}
